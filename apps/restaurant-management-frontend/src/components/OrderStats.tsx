import React, { useContext, useMemo } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

// Helper function to format orders data into chart data
const formatChartData = (orders) => {
  const data = [];

  orders.forEach((order) => {
    const date = new Date(order.timestamp).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    let existingEntry = data.find((entry) => entry.date === date);
    if (!existingEntry) {
      existingEntry = { date, createdOrders: 0, cancelledOrders: 0 };
      data.push(existingEntry);
    }

    if (order.kind === "orderCreated") {
      existingEntry.createdOrders += 1;
    } else if (order.kind === "orderCancelled") {
      existingEntry.cancelledOrders += 1;
    }
  });

  return data;
};

const chartConfig = {
  totalOrders: {
    label: "Created Orders",
    color: "#b5b5b5",
  },
  cancelledOrders: {
    label: "Cancelled Orders",
    color: "hsl(1.13deg 83.25% 62.55%)",
  },
} satisfies ChartConfig;

const OrderStats: React.FC = () => {
  const { orders } = useContext(WebSocketContext);

  // Use useMemo to format chart data only when orders change
  const chartData = useMemo(() => formatChartData(orders), [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Statistics</CardTitle>
        <CardDescription>Created vs. Cancelled Orders by Day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <Legend />
            <Bar
              dataKey="createdOrders"
              stackId="a"
              fill="#b5b5b5"
              name="Created Orders"
            />
            <Bar
              dataKey="cancelledOrders"
              stackId="a"
              fill="hsl(1.13deg 83.25% 62.55%)"
              name="Cancelled Orders"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by{" "}
              {(
                ((chartData.at(-1)?.createdOrders || 0) /
                  (chartData.at(-1)?.createdOrders +
                    chartData.at(-1)?.cancelledOrders || 1)) *
                100
              ).toFixed(1)}
              % <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Orders from {chartData[0]?.date} - {chartData.at(-1)?.date}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderStats;

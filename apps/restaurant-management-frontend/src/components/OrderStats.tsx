import React, { useMemo } from "react";
import { useSnapshot } from "valtio";
import store from "../store/store";
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
// import { TrendingUp } from "lucide-react";
import type { OrderEvent } from "@repo/shared-types";
import { format, startOfDay, parseISO } from "date-fns";

// Helper function to format orders data into chart data
const formatChartData = (orders: Map<string, OrderEvent[]>) => {
  console.log("format", orders.size);

  const data = new Map<
    string, // Use formatted day as 'MMM d' for unique key and display
    { date: string; createdOrders: number; cancelledOrders: number }
  >();

  orders.forEach((orderEvents) => {
    orderEvents.forEach((event) => {
      // Parse the timestamp, normalize it to the start of the day, and format it
      const day = new Date(event.timestamp).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      //const day = format(startOfDay(parseISO(event.timestamp)), "MMM d");

      if (data.has(day)) {
        console.log("add to existing entry", day);
        const existingEntry = data.get(day)!;
        if (event.kind === "orderCancelled") {
          existingEntry.cancelledOrders += 1;
        } else if (event.kind === "orderCreated") {
          existingEntry.createdOrders += 1;
        }
      } else {
        console.log("create new entry", day);
        // Add a new entry if it doesn't exist
        data.set(day, {
          date: day, // Store formatted day string
          createdOrders: event.kind === "orderCreated" ? 1 : 0,
          cancelledOrders: event.kind === "orderCancelled" ? 1 : 0,
        });
      }
    });
  });

  return Array.from(data.values());
};

const chartConfig = {
  createdOrders: {
    label: "Created Orders",
    color: "#b5b5b5",
  },
  cancelledOrders: {
    label: "Cancelled Orders",
    color: "hsl(1.13deg 83.25% 62.55%)",
  },
} satisfies ChartConfig;

const OrderStats: React.FC = () => {
  const { orderEvents: orders } = useSnapshot(store);

  //const chartData = useMemo(() => formatChartData(orders), [orders]);
  const chartData = [...formatChartData(orders)];

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
              fill="#b5b5b5"
              name="Created Orders"
              stackId="a"
            />
            <Bar
              dataKey="cancelledOrders"
              fill="hsl(1.13deg 83.25% 62.55%)"
              name="Cancelled Orders"
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {/* <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by{" "}
              {(
                ((chartData.at(-1)?.createdOrders || 0) /
                  (chartData.at(-1)?.createdOrders +
                    chartData.at(-1)?.cancelledOrders || 1)) *
                100
              ).toFixed(1)}
              % <TrendingUp className="h-4 w-4" />
            </div> */}
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

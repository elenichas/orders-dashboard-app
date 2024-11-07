"use client";

import React, { useContext, useMemo } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Helper function to format orders data into chart data
const formatChartData = (orders) => {
  const data = [];

  orders.forEach((order) => {
    const date = new Date(order.timestamp).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    const existingEntry = data.find((entry) => entry.date === date);

    if (existingEntry) {
      existingEntry.totalOrders += 1;
      if (order.kind === "orderDelivered") existingEntry.deliveredOrders += 1;
    } else {
      data.push({
        date,
        totalOrders: 1,
        deliveredOrders: order.kind === "orderDelivered" ? 1 : 0,
      });
    }
  });

  return data;
};

const chartConfig = {
  totalOrders: {
    label: "Total Orders",
    color: "hsl(var(--chart-1))",
  },
  deliveredOrders: {
    label: "Delivered Orders",
    color: "hsl(var(--chart-2))",
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
        <CardDescription>Total and delivered orders over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0} // Ensures one tick per date
              tickFormatter={(value) => {
                // Format the date as desired, e.g., "MM/DD" or "DD MMM"
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="totalOrders"
              type="monotone"
              fill="var(--chart-1)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
            />
            <Area
              dataKey="deliveredOrders"
              type="monotone"
              fill="var(--chart-2)"
              fillOpacity={0.4}
              stroke="var(--chart-2)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by{" "}
              {(
                ((chartData.at(-1)?.deliveredOrders || 0) /
                  (chartData.at(-1)?.totalOrders || 1)) *
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

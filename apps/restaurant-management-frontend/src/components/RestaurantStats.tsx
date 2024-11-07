"use client";

import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Label, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WebSocketContext } from "./WebSocketProvider";

interface Restaurant {
  restaurantId: string;
  name: string;
}

const RestaurantStats: React.FC = () => {
  const { orders } = useContext(WebSocketContext);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Fetch restaurant data from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:8014/restaurants");
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    fetchRestaurants();
  }, []);

  // Helper function to calculate stats for each restaurant based on order events
  const calculateStatsByRestaurant = () => {
    const restaurantData: Record<
      string,
      {
        created: number;
        delivered: number;
        cancelled: number;
        revenue: number;
        lostRevenue: number;
      }
    > = {};

    const orderMap: Record<
      string,
      { restaurantId: string; totalAmount: number; status: string }
    > = {};

    orders.forEach((event: OrderEvent) => {
      const { orderId, kind, restaurantId, totalAmount } = event;

      // Handle order creation by setting restaurant association
      if (kind === "orderCreated" && restaurantId) {
        orderMap[orderId] = {
          restaurantId,
          totalAmount: parseFloat(totalAmount || "0"),
          status: "created",
        };
        if (!restaurantData[restaurantId]) {
          restaurantData[restaurantId] = {
            created: 0,
            delivered: 0,
            cancelled: 0,
            revenue: 0,
            lostRevenue: 0,
          };
        }
        restaurantData[restaurantId].created += 1;
      }

      // Update order status based on subsequent events
      if (orderMap[orderId]) {
        const { restaurantId } = orderMap[orderId];

        if (kind === "orderDelivered") {
          orderMap[orderId].status = "delivered";
          restaurantData[restaurantId].delivered += 1;
          restaurantData[restaurantId].revenue += orderMap[orderId].totalAmount;
        }

        if (kind === "orderCancelled") {
          orderMap[orderId].status = "cancelled";
          restaurantData[restaurantId].cancelled += 1;
          restaurantData[restaurantId].lostRevenue +=
            orderMap[orderId].totalAmount;
        }
      }
    });

    return restaurantData;
  };

  const restaurantStats = calculateStatsByRestaurant();

  return (
    <div className="restaurant-stats">
      <h2>Restaurant Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => {
          const stats = restaurantStats[restaurant.id] || {
            created: 0,
            delivered: 0,
            cancelled: 0,
            revenue: 0,
            lostRevenue: 0,
          };

          const pieData = [
            { name: "Created", value: stats.created, fill: "#fdd835" },
            { name: "Delivered", value: stats.delivered, fill: "#66bb6a" },
            { name: "Cancelled", value: stats.cancelled, fill: "#ef5350" },
          ];

          return (
            <Card key={restaurant.id} className="my-4">
              <CardHeader className="text-center">
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription>Total Orders and Revenue</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PieChart width={250} height={250}>
                  {/* Add Tooltip for hover effect */}
                  <Tooltip
                    formatter={(value, name) => [`${value}`, `${name} Orders`]}
                  />

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    stroke="none"
                  >
                    <Label
                      position="center"
                      content={({ viewBox }) => (
                        <text
                          x={viewBox?.cx}
                          y={viewBox?.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan className="fill-foreground text-3xl font-bold">
                            {stats.created}
                          </tspan>
                          <tspan
                            x={viewBox?.cx}
                            y={(viewBox?.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Orders
                          </tspan>
                        </text>
                      )}
                    />
                  </Pie>
                </PieChart>
              </CardContent>
              <CardFooter className="text-center">
                <p>Total Revenue (Delivered): £{stats.revenue.toFixed(2)}</p>
                <p>Lost Revenue (Cancelled): £{stats.lostRevenue.toFixed(2)}</p>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantStats;

"use client";

import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Label } from "recharts";
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

  // Helper function to calculate stats for each restaurant
  const calculateStats = (restaurantId: string) => {
    const restaurantOrders = orders.filter(
      (order) => order.restaurantId === restaurantId
    );

    let createdCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let deliveredAmount = 0;
    let cancelledAmount = 0;

    restaurantOrders.forEach((order) => {
      if (order.kind === "Created") {
        createdCount++;
      } else if (order.kind === "Delivered") {
        deliveredCount++;
        deliveredAmount += order.amount || 0; // Assuming `amount` is a field in the order object
      } else if (order.kind === "Cancelled") {
        cancelledCount++;
        cancelledAmount += order.amount || 0;
      }
    });

    return {
      createdCount,
      deliveredCount,
      cancelledCount,
      deliveredAmount,
      cancelledAmount,
    };
  };

  return (
    <div className="restaurant-stats">
      <h2>Restaurant Statistics</h2>
      {restaurants.map((restaurant) => {
        const {
          createdCount,
          deliveredCount,
          cancelledCount,
          deliveredAmount,
          cancelledAmount,
        } = calculateStats(restaurant.restaurantId);

        // Data for the pie chart
        const pieData = [
          { name: "Created", value: createdCount, fill: "#fdd835" },
          { name: "Delivered", value: deliveredCount, fill: "#66bb6a" },
          { name: "Cancelled", value: cancelledCount, fill: "#ef5350" },
        ];

        return (
          <Card key={restaurant.restaurantId} className="my-4">
            <CardHeader className="text-center">
              <CardTitle>{restaurant.name}</CardTitle>
              <CardDescription>Total Orders and Revenue</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PieChart width={250} height={250}>
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
                          {createdCount + deliveredCount + cancelledCount}
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
              <p>Total Revenue (Delivered): £{deliveredAmount}</p>
              <p>Lost Revenue (Cancelled): £{cancelledAmount}</p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default RestaurantStats;

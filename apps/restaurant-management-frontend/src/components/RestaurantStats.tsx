import React, { useMemo, useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import store from "../store/store";
import { PieChart, Pie, Label, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaStar } from "react-icons/fa";
import type { Restaurant } from "@repo/shared-types";

// Sort options
const SORT_OPTIONS = [
  { value: "totalRevenue", label: "Total Revenue" },
  { value: "lostRevenue", label: "Lost Revenue" },
  { value: "rating", label: "Rating" },
];

const RestaurantStats: React.FC = () => {
  const { orderEvents } = useSnapshot(store);
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

  // State for sorting criteria and order
  const [sortCriterion, setSortCriterion] = useState("totalRevenue");
  const [sortOrder, setSortOrder] = useState("desc");

  // Function to calculate stats by restaurant from orderEvents
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

    // Map to track each order's restaurantId and totalAmount from orderCreated events
    const orderDetailsMap: Record<
      string,
      { restaurantId: string; totalAmount: number }
    > = {};

    orderEvents.forEach((events, orderId) => {
      events.forEach((event) => {
        if (event.kind === "orderCreated" && event.restaurantId) {
          const totalAmount = parseFloat(event.totalAmount || "0");

          // Store order details for future reference (for revenue or lost revenue)
          orderDetailsMap[orderId] = {
            restaurantId: event.restaurantId,
            totalAmount,
          };

          // Initialize restaurant data if it doesn't exist
          if (!restaurantData[event.restaurantId]) {
            restaurantData[event.restaurantId] = {
              created: 0,
              delivered: 0,
              cancelled: 0,
              revenue: 0,
              lostRevenue: 0,
            };
          }

          // Increment the count of created orders for this restaurant
          restaurantData[event.restaurantId].created += 1;
        } else {
          // Retrieve order details from the map for delivered/cancelled events
          const orderDetails = orderDetailsMap[orderId];

          if (orderDetails) {
            const { restaurantId, totalAmount } = orderDetails;

            // If the event is "orderDelivered", add to revenue
            if (event.kind === "orderDelivered") {
              restaurantData[restaurantId].delivered += 1;
              restaurantData[restaurantId].revenue += totalAmount;
            }

            // If the event is "orderCancelled", add to lost revenue
            if (event.kind === "orderCancelled") {
              restaurantData[restaurantId].cancelled += 1;
              restaurantData[restaurantId].lostRevenue += totalAmount;
            }
          }
        }
      });
    });

    return restaurantData;
  };

  const restaurantStats = calculateStatsByRestaurant();

  // Sorting logic for restaurants
  const sortedRestaurants = useMemo(() => {
    return [...restaurants].sort((a, b) => {
      const statA = restaurantStats[a.id] || {
        revenue: 0,
        lostRevenue: 0,
        rating: a.rating,
      };
      const statB = restaurantStats[b.id] || {
        revenue: 0,
        lostRevenue: 0,
        rating: b.rating,
      };

      let valueA, valueB;
      if (sortCriterion === "totalRevenue") {
        valueA = statA.revenue;
        valueB = statB.revenue;
      } else if (sortCriterion === "lostRevenue") {
        valueA = statA.lostRevenue;
        valueB = statB.lostRevenue;
      } else {
        valueA = a.rating;
        valueB = b.rating;
      }

      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });
  }, [restaurants, restaurantStats, sortCriterion, sortOrder]);

  return (
    <div className="restaurant-stats">
      <h2 className="text-center text-xl font-bold mb-4">
        Restaurant Statistics
      </h2>

      <div className="flex justify-center gap-4 mb-4">
        <select
          value={sortCriterion}
          onChange={(e) => setSortCriterion(e.target.value)}
          className="p-2 border rounded"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 border rounded"
        >
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRestaurants.map((restaurant, index) => {
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
            <Card key={restaurant.id} className="relative my-4">
              <CardHeader className="text-center">
                <CardTitle className="flex justify-center items-center gap-1">
                  {restaurant.name} <span>{restaurant.rating}</span>
                  <FaStar className="w-4 h-4 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PieChart width={250} height={250}>
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

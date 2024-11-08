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
import type { OrderEvent, Restaurant } from "@repo/shared-types";

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

    // Iterate through each order's events
    orderEvents.forEach((events, orderId) => {
      let orderStatus = "created";
      let totalAmount = 0;
      let restaurantId = "";

      // Process each event for this order
      events.forEach((event) => {
        totalAmount = parseFloat(event.totalAmount || "0");
        restaurantId = event.restaurantId || "";

        // Initialize restaurant data if it doesn't exist
        if (!restaurantData[restaurantId]) {
          restaurantData[restaurantId] = {
            created: 0,
            delivered: 0,
            cancelled: 0,
            revenue: 0,
            lostRevenue: 0,
          };
        }

        if (event.kind === "orderCreated") {
          restaurantData[restaurantId].created += 1;
        } else if (event.kind === "orderDelivered") {
          orderStatus = "delivered";
          restaurantData[restaurantId].delivered += 1;
          restaurantData[restaurantId].revenue += totalAmount;
        } else if (event.kind === "orderCancelled") {
          orderStatus = "cancelled";
          restaurantData[restaurantId].cancelled += 1;
          restaurantData[restaurantId].lostRevenue += totalAmount;
        }
      });
    });

    return restaurantData;
  };

  const restaurantStats = calculateStatsByRestaurant();

  // Sorting function
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

      {/* Sorting Controls */}
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
              {/* Index on the top left */}
              <div className="absolute top-2 left-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
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

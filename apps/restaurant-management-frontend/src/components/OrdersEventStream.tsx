import React, { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import store from "../store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderEvent, Restaurant } from "@repo/shared-types";

interface OrderCardData {
  orderId: string;
  createdTime?: string;
  restaurantName?: string;
  deliveryTime?: string;
  status?: string;
  driverName?: string;
}

const cardColorOptions = {
  orderCancelled: "bg-red-100 border-red-400",
  orderDelivered: "bg-green-100 border-green-400",
  orderEnRoute: "bg-orange-100 border-orange-400",
  orderCreated: "bg-orange-100 border-orange-400",
};

const cardColor = (status: string) => {
  return cardColorOptions[status] || "bg-gray-100 border-gray-400";
};

const processOrderEvents = (
  events: OrderEvent[],
  restaurants: Restaurant[]
): OrderCardData => {
  let createdTime: string | undefined;
  let restaurantName = "Unknown";
  let driverName: string | undefined;
  let deliveryTime: string | undefined;
  let status: string | undefined;

  const { kind } = events.at(-1) || { kind: "orderCreated" };

  events.forEach((event) => {
    if (event.kind === "orderCreated") {
      createdTime = new Date(event.timestamp).toLocaleString();
      const restaurant = restaurants.find((r) => r.id === event.restaurantId);
      restaurantName = restaurant ? restaurant.name : "Unknown";
    } else if (event.kind === "orderEnRoute") {
      driverName = event.driverName;
      deliveryTime = new Date(event.timestamp).toLocaleString();
    } else if (
      event.kind === "orderDelivered" ||
      event.kind === "orderCancelled"
    ) {
      status = event.kind === "orderDelivered" ? "Delivered" : "Cancelled";
      deliveryTime = new Date(event.timestamp).toLocaleString();
    }
  });

  return {
    orderId: events[0].orderId,
    createdTime,
    restaurantName,
    driverName,
    deliveryTime,
    status,
    kind,
  };
};

const OrderEventStream: React.FC = () => {
  const { orderEvents: orders } = useSnapshot(store);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orderCards, setOrderCards] = useState<OrderCardData[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedDriverName, setSelectedDriverName] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  useEffect(() => {
    const fetchRestaurants = async () => {
      const response = await fetch("http://localhost:8014/restaurants");
      const data = await response.json();
      setRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const processedCards = Array.from(orders.entries()).map(
      ([orderId, events]) => processOrderEvents(events, restaurants)
    );
    setOrderCards(processedCards);
  }, [orders, restaurants]);

  // Filtered and sorted order cards based on selected filters and sort order
  const filteredOrderCards = orderCards
    .filter((order) => {
      const restaurantMatches =
        !selectedRestaurant || order.restaurantName === selectedRestaurant;
      const driverNameMatches =
        !selectedDriverName || order.driverName === selectedDriverName;
      return restaurantMatches && driverNameMatches;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdTime || "").getTime();
      const dateB = new Date(b.createdTime || "").getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="order-event-stream h-full w-full overflow-y-auto p-4 border-gray-200 text-xs">
      <h2 className="text-center text-xl font-bold mb-4">Live Feed</h2>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 items-start">
        {/* Restaurant Filter */}
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">All Restaurants</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.name}>
              {restaurant.name}
            </option>
          ))}
        </select>

        {/* Delivery Person Filter */}
        <select
          value={selectedDriverName}
          onChange={(e) => setSelectedDriverName(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">All Delivery Persons</option>
          {[
            ...new Set(
              orderCards.map((order) => order.driverName).filter(Boolean)
            ),
          ].map((driverName) => (
            <option key={driverName} value={driverName}>
              {driverName}
            </option>
          ))}
        </select>

        {/* Sort Order Filter */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="desc">Most Recent First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Display filtered and sorted order cards */}
      {filteredOrderCards.map((order) => (
        <Card
          key={order.orderId}
          className={`mb-4 border ${cardColor(order.kind)}`}
        >
          <CardHeader>
            <CardTitle>Order: {order.orderId}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <td className="font-bold">Created:</td>
                  <td>{order.createdTime}</td>
                </tr>
                <tr>
                  <td className="font-bold">Restaurant:</td>
                  <td>{order.restaurantName}</td>
                </tr>
                <tr>
                  <td className="font-bold">Out for Delivery:</td>
                  <td>{order.deliveryTime || "Pending"}</td>
                  <td>{order.driverName || "N/A"}</td>
                </tr>
                <tr>
                  <td className="font-bold">Status:</td>
                  <td>{order.status || "In Progress"}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderEventStream;

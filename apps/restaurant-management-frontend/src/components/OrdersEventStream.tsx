import React, { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderEvent {
  orderId: string;
  timestamp: string;
  kind: string;
  restaurantId?: string;
  driverName?: string;
}

interface Restaurant {
  id: string;
  name: string;
}

interface OrderCardData {
  orderId: string;
  createdTime?: string;
  restaurantName?: string;
  deliveryTime?: string;
  status?: string;
  deliveryPerson?: string;
}

const OrderEventStream: React.FC = () => {
  const { orders } = useContext(WebSocketContext);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orderCards, setOrderCards] = useState<OrderCardData[]>([]);

  // State for filters
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] =
    useState<string>("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      const response = await fetch("http://localhost:8014/restaurants");
      const data = await response.json();
      setRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const handleNewEvent = (event: OrderEvent) => {
      setOrderCards((prevOrderCards) => {
        const existingOrder = prevOrderCards.find(
          (order) => order.orderId === event.orderId
        );

        const restaurant = restaurants.find((r) => r.id === event.restaurantId);

        if (event.kind === "orderCreated") {
          if (!existingOrder) {
            return [
              {
                orderId: event.orderId,
                createdTime: new Date(event.timestamp).toLocaleString(),
                restaurantName: restaurant ? restaurant.name : "Unknown",
              },
              ...prevOrderCards,
            ];
          }
        } else if (event.kind === "orderEnRoute" && existingOrder) {
          return prevOrderCards.map((order) =>
            order.orderId === event.orderId
              ? {
                  ...order,
                  deliveryPerson: event.driverName,
                  deliveryTime: new Date(event.timestamp).toLocaleString(),
                }
              : order
          );
        } else if (
          (event.kind === "orderDelivered" ||
            event.kind === "orderCancelled") &&
          existingOrder
        ) {
          return prevOrderCards.map((order) =>
            order.orderId === event.orderId
              ? {
                  ...order,
                  status:
                    event.kind === "orderDelivered" ? "Delivered" : "Cancelled",
                  deliveryTime: new Date(event.timestamp).toLocaleString(),
                }
              : order
          );
        }
        return prevOrderCards;
      });
    };

    orders.forEach(handleNewEvent);
  }, [orders, restaurants]);

  // Filtered order cards based on selected filters
  const filteredOrderCards = orderCards.filter((order) => {
    const restaurantMatches =
      !selectedRestaurant || order.restaurantName === selectedRestaurant;
    const deliveryPersonMatches =
      !selectedDeliveryPerson ||
      order.deliveryPerson === selectedDeliveryPerson;
    return restaurantMatches && deliveryPersonMatches;
  });

  return (
    <div className="order-event-stream h-full overflow-y-auto p-4 border-gray-200 text-xs">
      <h2 className="text-center text-xl font-bold mb-4">Live Feed</h2>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        {/* Restaurant Filter */}
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="p-2 border rounded"
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
          value={selectedDeliveryPerson}
          onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Delivery Persons</option>
          {[
            ...new Set(
              orderCards.map((order) => order.deliveryPerson).filter(Boolean)
            ),
          ].map((deliveryPerson) => (
            <option key={deliveryPerson} value={deliveryPerson}>
              {deliveryPerson}
            </option>
          ))}
        </select>
      </div>

      {filteredOrderCards.map((order) => {
        const cardColor =
          order.status === "Cancelled"
            ? "bg-red-100 border-red-400"
            : order.status === "Delivered"
              ? "bg-green-100 border-green-400"
              : "bg-orange-100 border-orange-400";

        return (
          <Card key={order.orderId} className={`mb-4 border ${cardColor}`}>
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
                    <td>{order.deliveryPerson || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Status:</td>
                    <td>
                      {order.deliveryTime ? order.deliveryTime : "Pending"} -{" "}
                      {order.status || "In Progress"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderEventStream;

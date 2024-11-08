import React, { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import store from "../store/store"; // Import the Valtio store
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
  return cardColorOptions[status];
};
const processOrderEvents = (events: OrderEvent[]) => {
  // Initial values for the order details
  let createdTime: string | undefined;
  let restaurantName = "Unknown";
  let driverName: string | undefined;
  let deliveryTime: string | undefined;
  let status: string | undefined;
  const { kind } = events.at(-1);
  // Iterate through events in order and update details
  events.forEach((event) => {
    if (event.kind === "orderCreated") {
      createdTime = new Date(event.timestamp).toLocaleString();
      restaurantName = event.restaurantId;
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
    kind,
    createdTime,
    restaurantName,
    driverName,
    deliveryTime,
    status,
  };
};
const OrderEventStream: React.FC = () => {
  const { orderEvents: orders } = useSnapshot(store); // Get orders directly from Valtio store
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orderCards, setOrderCards] = useState<OrderCardData[]>([]);

  // State for filters
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedDriverName, setSelectedDriverName] = useState<string>("");

  useEffect(() => {
    // Fetch restaurants data on component mount
    const fetchRestaurants = async () => {
      const response = await fetch("http://localhost:8014/restaurants");
      const data = await response.json();
      setRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  // Filtered order cards based on selected filters
  const filteredOrderCards = orderCards.filter((order) => {
    const restaurantMatches =
      !selectedRestaurant || order.restaurantName === selectedRestaurant;
    const driverNameMatches =
      !selectedDriverName || order.driverName === selectedDriverName;
    return restaurantMatches && driverNameMatches;
  });
  return (
    <div className="order-event-stream h-full w-full overflow-y-auto p-4 border-gray-200 text-xs">
      <h2 className="text-center text-xl font-bold mb-4">Live Feed</h2>
      {Array.from(orders.entries()).map(
        ([orderId, events]: [string, OrderEvent[]]) => {
          const {
            kind,
            createdTime,
            restaurantName,
            driverName,
            deliveryTime,
            status,
          } = processOrderEvents(events);
          return (
            <Card key={orderId} className={`mb-4 border ${cardColor(kind)}`}>
              <CardHeader>
                <CardTitle>Order: {orderId}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-left">
                  <tbody>
                    <tr>
                      <td className="font-bold">Created:</td>
                      <td>{createdTime}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Restaurant:</td>
                      <td>{restaurantName}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Out for Delivery:</td>
                      <td>{deliveryTime || "Pending"}</td>
                      <td>{driverName || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Status:</td>
                      <td>
                        {`${deliveryTime || "Pending"} - ${status || "In Progress"}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        }
      )}
    </div>
  );
};
//   return (

//       {/* Filters */}
//       <div className="mb-4 flex flex-col gap-4 items-start">
//         {/* Restaurant Filter */}
//         <select
//           value={selectedRestaurant}
//           onChange={(e) => setSelectedRestaurant(e.target.value)}
//           className="p-2 border rounded w-full"
//         >
//           <option value="">All Restaurants</option>
//           {restaurants.map((restaurant) => (
//             <option key={restaurant.id} value={restaurant.name}>
//               {restaurant.name}
//             </option>
//           ))}
//         </select>

//         {/* Delivery Person Filter */}
//         <select
//           value={selectedDriverName}
//           onChange={(e) => setSelectedDriverName(e.target.value)}
//           className="p-2 border rounded w-full"
//         >
//           <option value="">All Delivery Persons</option>
//           {[
//             ...new Set(
//               orderCards.map((order) => order.driverName).filter(Boolean)
//             ),
//           ].map((driverName) => (
//             <option key={driverName} value={driverName}>
//               {driverName}
//             </option>
//           ))}
//         </select>
//       </div>

//       {filteredOrderCards.map((order) => {

//         return (

//         );
//       })}
//     </div>
//   );
//};

export default OrderEventStream;

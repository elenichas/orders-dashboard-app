import React, { useContext } from "react";
import { WebSocketContext } from "./WebSocketProvider";

const OrderStats: React.FC = () => {
  const { orders } = useContext(WebSocketContext);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(
    (order) => order.kind === "orderDelivered"
  ).length;

  return (
    <div className="order-stats">
      <h2>Order Statistics</h2>
      <p>Total Orders: {totalOrders}</p>
      <p>Delivered Orders: {deliveredOrders}</p>
      {/* Additional statistics can be added here */}
    </div>
  );
};

export default OrderStats;

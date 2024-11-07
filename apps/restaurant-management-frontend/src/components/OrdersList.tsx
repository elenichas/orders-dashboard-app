// src/components/OrdersList.tsx
import React, { useContext } from "react";
import { WebSocketContext } from "./WebSocketProvider";

const OrdersList: React.FC = () => {
  const { orders } = useContext(WebSocketContext);

  return (
    <div className="orders-list">
      <h2>Orders</h2>
      <ul>
        {orders.map((order, index) => (
          <li key={`${order.orderId}-${index}`}>
            {order.kind} - {order.status} - {order.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;

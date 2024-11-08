// src/components/Dashboard.tsx
import React from "react";
import OrderStats from "./OrderStats";
import RestaurantStats from "./RestaurantStats";
import OrderEventStream from "./OrdersEventStream";
import WebSocketProvider from "./WebSocketProvider";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard h-screen flex w-full">
      <WebSocketProvider>
        <div className="w-1/4 h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
          {/* <OrderEventStream /> */}
        </div>
        <div className="w-3/4 h-full overflow-y-auto p-4">
          <OrderStats />
          <RestaurantStats />
        </div>
      </WebSocketProvider>
    </div>
  );
};

export default Dashboard;

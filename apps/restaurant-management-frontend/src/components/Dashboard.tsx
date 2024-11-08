// src/components/Dashboard.tsx
import React from "react";
import OrderStats from "./OrderStats";
import RestaurantStats from "./RestaurantStats";
import OrderEventStream from "./OrdersEventStream";
import WebSocketProvider from "./WebSocketProvider";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard w-screen h-screen flex box-border bg-gray-100">
      <WebSocketProvider>
        {/* Left Sidebar */}
        <div className="w-1/4 h-full overflow-y-auto bg-white border-r border-gray-200 p-4 rounded-md shadow-sm">
          <OrderEventStream />
        </div>

        {/* Main Content Area */}
        <div className="w-3/4 h-full overflow-y-auto">
          <div className="space-y-6">
            <OrderStats />
            <RestaurantStats />
          </div>
        </div>
      </WebSocketProvider>
    </div>
  );
};

export default Dashboard;

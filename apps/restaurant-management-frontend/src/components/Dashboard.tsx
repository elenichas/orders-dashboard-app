// src/components/Dashboard.tsx
import React from "react";
import OrdersList from "./OrdersList";
import OrderStats from "./OrderStats";
import RestaurantList from "./RestaurantList";
import RestaurantStats from "./RestaurantStats";
import WebSocketProvider from "./WebSocketProvider";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <WebSocketProvider>
        <>
          <OrderStats />
          <RestaurantStats />
        </>
      </WebSocketProvider>
    </div>
  );
};

export default Dashboard;

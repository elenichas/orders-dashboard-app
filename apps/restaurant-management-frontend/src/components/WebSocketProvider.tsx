import React, { createContext, ReactNode, useEffect } from "react";
import store from "../store/store"; // Import Valtio store

// No need for `useState` or WebSocketContextProps here since we’re using Valtio

const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8014/ws");

    ws.onmessage = (event) => {
      const orderEvent = JSON.parse(event.data);
      store.addOrder(orderEvent); // Use Valtio's addOrder to update orders in global store
    };

    return () => {
      ws.close();
    };
  }, []);

  return <>{children}</>;
};

export default WebSocketProvider;

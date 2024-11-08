import React, { createContext, ReactNode, useEffect } from "react";
import { addOrUpdateOrderEvent } from "@/store/store";

const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8014/ws");

    ws.onmessage = (event) => {
      const orderEvent = JSON.parse(event.data);
      addOrUpdateOrderEvent(orderEvent);
    };

    return () => {
      ws.close();
    };
  }, []);

  return <>{children}</>;
};

export default WebSocketProvider;

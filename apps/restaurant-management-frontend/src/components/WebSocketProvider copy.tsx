import React, { createContext, ReactNode, useEffect, useState } from "react";

interface Order {
  orderId: string;
  timestamp: string;
  kind: string;
  restaurantId: string;
  status?: string;
}

interface WebSocketContextProps {
  orders: Order[];
}

export const WebSocketContext = createContext<WebSocketContextProps>({
  orders: [],
});

const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8014/ws");

    ws.onmessage = (event) => {
      const orderEvent = JSON.parse(event.data);
      setOrders((prevOrders) => [...prevOrders, orderEvent]);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ orders }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;

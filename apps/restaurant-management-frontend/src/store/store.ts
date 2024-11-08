// store.ts
import { proxy } from "valtio";
import { proxyMap } from "valtio/utils";
import throttle from "lodash.throttle"; // Optional: to throttle updates
import type { OrderEvent } from "@repo/shared-types";

// Initialize the Valtio store
const store = proxy({
  orderEvents: proxyMap<string, OrderEvent[]>(),
});
const FLUSH_THRESHOLD = 1200;
const eventBuffer: OrderEvent[] = []; // Intermediate buffer

export const addOrUpdateOrderEvent = (orderEvent: OrderEvent) => {
  eventBuffer.push(orderEvent);
  if (eventBuffer.length >= FLUSH_THRESHOLD) {
    flushBufferToStore();
  }
};

const flushBufferToStore = () => {
  eventBuffer.forEach((orderEvent) => {
    const { orderId } = orderEvent;
    if (!store.orderEvents.has(orderId)) {
      store.orderEvents.set(orderId, [orderEvent]);
    } else {
      const events = store.orderEvents.get(orderId)!;
      events.push(orderEvent);
    }
  });

  eventBuffer.length = 0;
};

export default store;

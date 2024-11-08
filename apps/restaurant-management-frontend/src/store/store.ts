// store.ts
import { proxy } from "valtio";
import { proxyMap } from "valtio/utils";
// import throttle from "lodash.throttle"; // Optional: to throttle updates
import type { OrderEvent } from "@repo/shared-types";

// Initialize the Valtio store
const store = proxy({
  orderEvents: proxyMap<string, OrderEvent[]>(),
});

export const addOrUpdateOrderEvent = (orderEvent: OrderEvent) => {
  const { orderId } = orderEvent;
  if (!store.orderEvents.has(orderId)) {
    store.orderEvents.set(orderId, [orderEvent]);
  } else {
    const events = store.orderEvents.get(orderId)!;
    events.push(orderEvent);
  }
};

export default store;

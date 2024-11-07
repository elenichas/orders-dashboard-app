// store.ts
import { proxy } from "valtio";
import throttle from "lodash.throttle"; // Optional: to throttle updates

// Define the Order type based on your WebSocket data structure
interface Order {
  orderId: string;
  timestamp: string;
  kind: string;
  restaurantId: string;
  status?: string;
}

// Initialize the Valtio store
const store = proxy({
  orders: [] as Order[],

  // Method to add or update an order in the store
  addOrder: throttle((newOrder: Order) => {
    const existingOrderIndex = store.orders.findIndex(
      (order) => order.orderId === newOrder.orderId
    );

    if (existingOrderIndex > -1) {
      // Update the existing order with new details
      store.orders[existingOrderIndex] = {
        ...store.orders[existingOrderIndex],
        ...newOrder,
      };
    } else {
      // Add new order if it doesn’t already exist
      store.orders.push(newOrder);
    }
  }, 100), // Throttle updates to every 100ms (adjust as needed)
});

export default store;

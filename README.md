# Init

- repo was bootstrapped from turbo repo sample `pnpm dlx create-turbo@latest`.
- Types extracted into a shared package under `packages/shared-types`.
- Frontend bootstrapped with Vite `pnpm create vite` under `apps/restaurant-management-frontend`.
- Provided backend code lives under `apps/restaurant-management-backend`.

# Dev

- To start development, run `pnpm install` in the root of the mono-repo.
- Run `pnpm dev` to start development servers in respective packages.

# Incoming challenge data

You're building a dashboard for a company that owns several restaurants. To avoid the fees from existing delivery apps, they've built their own app for customers to place orders.

Lately there have been some issues; some restaurants are getting poor customer reviews. The Chief Financial Officer (CFO) would like to understand what's going on and see order statuses in realtime.

The platform team has built a backend service that provides a live feed of orders, as well as basic restaurant information. You've been given access to the backend repo with instructions on how to run it and access API docs.

Please build an app that the CFO can use to overview their current situation and hopefully learn more about the cause of poor reviews.

The CFO needs information about:

- A view of orders, with both open and closed orders and status information, and the overall stats of orders through the app
- A view of restaurants, with insights into how restaurants have been handling orders based on the data available

## Specifications

- Use **React** and **TypeScript** to build a web application
- Other frameworks, libraries and styling is left to you
- Use the provided backend service to fetch data
- Include a README with clear instructions on how to run your project from a fresh setup, and discussion points on your solution, as well as any discussion you'd bring to a meeting with the backend developer on how to improve the service.

## Endpoints

- `http` - `GET /restaurants` Get the IDs, names, and current user ratings (/5) of all restaurants
- `websocket` - `/ws` Stream of all past events and live streaming of new order events

## Models

Models can be found in the [types](src/types.ts) file.
The `/restaurants` HTTP endpoint returns a list of `Restaurant`.
The websocket endpoint sends a stream of `OrderEvent`.

## Using the backend

The backend is a simple Node.js application that uses Websockets. You will need to have `node.js` and `npm` installed.

### Install the packages

```bash
npm install
```

### Start the server

```bash
npm start
```

### Front-end Components

- Dashboard: The main layout component that organizes the application into two primary sections: a sidebar and a main content area. It uses WebSocketProvider to handle WebSocket connections and displays OrderEventStream in the sidebar for live updates, while OrderStats and RestaurantStats appear in the main content area to show data analytics and order statistics.

- OrdersEventStream: Displays a live feed of order events in real-time. It fetches order and restaurant data, allows filtering by restaurant and delivery person, and includes an ascending/descending sorting option. Each order is represented as a card with details such as creation time, restaurant name, delivery time, driver’s name, and status.

- OrderStats: A component for visualizing order statistics with a bar chart. It processes order data to display counts of created and canceled orders by day, using Recharts for rendering. The data is grouped by day, and the chart provides an overview of order trends over time.

- RestaurantStats: Shows statistics related to each restaurant, including the number of created, delivered, and canceled orders. Each restaurant’s statistics appear in pie chart format, with filters for sorting by revenue, lost revenue, or rating. It also calculates and displays revenue generated from delivered orders and revenue lost from canceled orders.

- WebSocketProvider: Establishes a WebSocket connection to receive real-time order updates. When a message is received, it parses the data and updates the store with new order events, allowing other components to react to real-time changes in order data. The connection closes gracefully when the component unmounts.

### Implementation

I explored two different implementations for handling real-time data updates from the WebSocket:

- Direct WebSocket Data Update: In this approach, the application reads data live from the WebSocket and directly updates the frontend. While this method ensures that graphs and UI elements reflect real-time changes immediately, it has a trade-off: the app can become less responsive, especially when handling high volumes of data or rapid updates. This approach works well for seeing immediate changes in the data but affects performance as each new data point triggers an update.

- Buffered Data with Valtio Store: In another branch, I introduced a Valtio store with a buffering mechanism. This implementation temporarily holds incoming WebSocket data in a buffer and flushes updates to the main store periodically rather than in real-time. By controlling the frequency of updates, this method improves app responsiveness, especially when processing large or frequent data bursts. It provides smoother UI updates and helps prevent UI lag, although it may introduce a slight delay in the data visualization updates.

Each approach has its benefits: the direct update approach offers real-time accuracy, while the buffered approach ensures a more consistent, smooth user experience by balancing data timeliness

### Improvements with backend collaboration

To improve the frontend experience, I’d propose the following points to discuss with the backend developer:

- Include **restaurantId** on All Relevant Events:
  Current Challenge: Only "orderCreated" events contain restaurantId. This requires the front end to track orderId mappings manually.
  Proposed Solution: Standardize event data by including restaurantId in "orderDelivered" and "orderCancelled" events, enabling more reliable and efficient data handling on the front end.
  Paginated or Batched Order Events:

- Paginated or Batched Order Events:
  Current Challenge: **High traffic** or a large volume of real-time data could slow down the front end.
  Proposed Solution: Implement pagination or batch updates in WebSocket messages to avoid overwhelming the front end.
  Enhanced Order Statuses:

- Enhanced Order Statuses:
  Current Challenge: **Limited statuses** in the current event structure (created, en route, delivered, canceled) can lead to ambiguity in data representation.
  Proposed Solution: Consider additional statuses (e.g., "preparing", "awaiting pickup") to provide a more detailed order journey.
  Optimize Backend API for Frontend Use Cases:

### App screenshots

![Vite + React + TS - Google Chrome 11_8_2024 1_56_52 PM](https://github.com/user-attachments/assets/531f3a2d-8b89-4cd3-8ab8-648c65e00b37)
![Vite + React + TS - Google Chrome 11_8_2024 1_57_12 PM](https://github.com/user-attachments/assets/fbd113e7-ce85-4f56-a876-70db6397c9f5)

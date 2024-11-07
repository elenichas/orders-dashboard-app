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

- Please use **React** and **TypeScript** to build a web application
- Other frameworks, libraries and styling is left to you
- Please use the provided backend service to fetch data
- Please also include a README with clear instructions on how to run your project from a fresh setup, and discussion points on your solution, as well as any discussion you'd bring to a meeting with the backend developer on how to improve the service.

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

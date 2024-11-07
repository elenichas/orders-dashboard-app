"use client";

import React, { useContext, useMemo, useState } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper function to group orders by `orderId`
const groupOrdersByOrderId = (orders) => {
  return orders.reduce((acc, order) => {
    if (!acc[order.orderId]) {
      acc[order.orderId] = [];
    }
    acc[order.orderId].push(order);
    return acc;
  }, {});
};

const OrdersList = () => {
  const { orders } = useContext(WebSocketContext);
  const [statusFilter, setStatusFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Filtered and grouped orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter
        ? (statusFilter === "orderDelivered" &&
            order.kind === "orderDelivered") ||
          (statusFilter === "orderCancelled" && order.kind === "orderCancelled")
        : true;
      const matchesDriver = driverFilter
        ? order.driverName.toLowerCase().includes(driverFilter.toLowerCase())
        : true;
      const matchesDate = dateFilter
        ? new Date(order.timestamp).toLocaleDateString() === dateFilter
        : true;

      return matchesStatus && matchesDriver && matchesDate;
    });
  }, [orders, statusFilter, driverFilter, dateFilter]);

  const groupedOrders = useMemo(
    () => groupOrdersByOrderId(filteredOrders),
    [filteredOrders]
  );

  return (
    <div className="orders-list">
      <h2>Orders</h2>

      {/* Filters */}
      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Driver"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Scrollable Table */}
      <div
        className="table-container"
        style={{ overflowX: "auto", maxHeight: "500px" }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Driver Name</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedOrders).map(([orderId, events]) => (
              <React.Fragment key={orderId}>
                {events.map((event, index) => (
                  <TableRow
                    key={`${orderId}-${index}`}
                    style={{
                      backgroundColor:
                        event.kind === "orderCancelled" ? "#ffcccc" : "#ccffcc",
                    }}
                  >
                    <TableCell>{index === 0 ? orderId : ""}</TableCell>
                    <TableCell>{event.kind}</TableCell>
                    <TableCell>{event.driverName}</TableCell>
                    <TableCell>
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersList;


/**
 * A restaurant
 */
export interface Restaurant {
    /**
     * Unique ID of the restaurant
     */
    id: string

    /**
     * Name of this location
     */
    name: string

    /**
     * Average rating (out of 5) from user reviews
     */
    rating: number
}

/**
 * An order has been placed
 */
export interface OrderCreated {
    kind: 'orderCreated'

    /**
     * Unique ID of this order
     */
    orderId: string

    /**
     * Timestamp of order creation (UTC)
     */
    timestamp: Date

    /**
     * Unique ID of restaurant
     */
    restaurantId: string

    /**
     * Unique ID of the user creating the order
     */
    userId: string

    /**
     * Total amount of the order (£)
     * This is a number encoded as a string
     */
    totalAmount: string
}

/**
 * An order has been handed off to a driver and is out for delivery
 */
export interface OrderEnRoute {
    kind: 'orderEnRoute'

    /**
     * Unique ID of the order
     */
    orderId: string

    /**
     * Timestamp when the order was picked up (UTC)
     */
    timestamp: Date

    /**
     * Unique ID of the driver
     */
    driverId: string

    /**
     * Display name of the driver en route
     */
    driverName: string
}

/**
 * An order has been successfully delivered
 */
export interface OrderDelivered {
    kind: 'orderDelivered'

    /**
     * Unique ID of the order
     */
    orderId: string

    /**
     * Timestamp when the order was delivered (UTC)
     */
    timestamp: Date
}

/**
 * An order has been cancelled by the customer
 */
export interface OrderCancelled {
    kind: 'orderCancelled'

    /**
     * Unique ID of the order that was cancelled
     */
    orderId: string

    /**
     * Timestamp of order cancellation (UTC)
     */
    timestamp: Date
}

export type OrderEvent = OrderCreated | OrderCancelled | OrderDelivered | OrderEnRoute;

// src/components/RestaurantList.tsx
import React, { useEffect, useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  rating: number;
}

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use fetch to retrieve restaurant data
    fetch("http://localhost:8014/restaurants")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRestaurants(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="restaurant-list">
      <h2>Restaurants</h2>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            {restaurant.name} - Rating: {restaurant.rating}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantList;

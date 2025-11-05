import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  // Debug logging
  console.log('Current category:', category);
  console.log('Available food items:', food_list);
  console.log('Categories in food list:', [...new Set(food_list.map(item => item.category))]);

  // Case-insensitive category matching
  const filteredItems = food_list.filter(item => 
    category === 'All' || 
    category.toLowerCase() === item.category.toLowerCase()
  );

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      {food_list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading food items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No items found in {category} category</p>
        </div>
      ) : (
        <div className='food-display-list'>
          {filteredItems.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodDisplay

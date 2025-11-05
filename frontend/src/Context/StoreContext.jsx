import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://foods-here.vercel.app"
  const [token,setToken] = useState("")
  const [food_list,setFoodList] = useState([])

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
    }
  }

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
    }
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  }

  const fetchFoodList = async(retryCount = 0) => {
      try {
        console.log("Fetching food list from:", url+"/api/food/list");
        const response = await axios.get(url+"/api/food/list");
        console.log("Food list response:", response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          if (response.data.data.length === 0 && retryCount < 3) {
            // If the list is empty and we haven't retried too many times, wait and retry
            console.log(`No food items found, retrying in 2 seconds... (attempt ${retryCount + 1})`);
            setTimeout(() => fetchFoodList(retryCount + 1), 2000);
            return;
          }
          setFoodList(response.data.data);
          console.log(`Loaded ${response.data.data.length} food items`);
        } else {
          console.error("Invalid food list data:", response.data);
          setFoodList([]);
        }
      } catch (error) {
        console.error("Error fetching food list:", error);
        if (retryCount < 3) {
          console.log(`Retrying in 2 seconds... (attempt ${retryCount + 1})`);
          setTimeout(() => fetchFoodList(retryCount + 1), 2000);
        } else {
          setFoodList([]);
        }
      }
  }

  const loadCartData = async (token) => {
    const response = await axios.post(url+"/api/cart/get",{},{headers:{token}})
    setCartItems(response.data.cartData);
  }

  useEffect(()=>{
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  },[])

  const contextvalue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken
  };

  return (
    <StoreContext.Provider value={contextvalue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

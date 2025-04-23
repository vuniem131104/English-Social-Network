import { 
  ADD_TO_CART, 
  REMOVE_FROM_CART, 
  UPDATE_QUANTITY,
  CLEAR_CART 
} from '../actions/cartActions';

// Initial state for the cart
const initialState = {
  items: [],
  total: 0
};

/**
 * Calculate the total price of all items in the cart
 * @param {Array} items - Array of cart items
 * @returns {number} - Total price
 */
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Cart reducer to handle cart-related actions
 * @param {Object} state - Current state
 * @param {Object} action - Dispatched action
 * @returns {Object} New state
 */
const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      // Check if the item already exists in the cart
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );

      let updatedItems;
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Item doesn't exist, add it to the cart
        updatedItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case REMOVE_FROM_CART: {
      const updatedItems = state.items.filter(
        item => item.id !== action.payload
      );
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case UPDATE_QUANTITY: {
      const updatedItems = state.items.map(item => 
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case CLEAR_CART:
      return initialState;

    default:
      return state;
  }
};

export default cartReducer; 
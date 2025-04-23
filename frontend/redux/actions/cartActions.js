// Action Types
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
export const CLEAR_CART = 'CLEAR_CART';

/**
 * Action to add an item to the cart
 * @param {Object} product - The product to add to cart
 * @returns {Object} Action object
 */
export const addToCart = (product) => {
  return {
    type: ADD_TO_CART,
    payload: {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      author: product.author,
      quantity: 1
    }
  };
};

/**
 * Action to remove an item from the cart
 * @param {string|number} productId - The ID of the product to remove
 * @returns {Object} Action object
 */
export const removeFromCart = (productId) => {
  return {
    type: REMOVE_FROM_CART,
    payload: productId
  };
};

/**
 * Action to update the quantity of an item in the cart
 * @param {string|number} productId - The ID of the product to update
 * @param {number} quantity - The new quantity
 * @returns {Object} Action object
 */
export const updateQuantity = (productId, quantity) => {
  return {
    type: UPDATE_QUANTITY,
    payload: {
      id: productId,
      quantity: quantity
    }
  };
};

/**
 * Action to clear all items from the cart
 * @returns {Object} Action object
 */
export const clearCart = () => {
  return {
    type: CLEAR_CART
  };
}; 
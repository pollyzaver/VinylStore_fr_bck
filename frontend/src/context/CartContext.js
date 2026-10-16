import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

// Открытка к пластинке стоит отдельно: 100 ₽ за каждую открытку в заказе.
export const CARD_PRICE = 100;

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const keyOf = i => i.lineId || i.id;
      const existingItem = state.items.find(item => keyOf(item) === keyOf(action.payload));
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            keyOf(item) === keyOf(action.payload)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => (item.lineId || item.id) !== action.payload)
      };

    case 'REMOVE_CARD':
      return {
        ...state,
        items: state.items.map(item => {
          if ((item.lineId || item.id) !== action.payload) return item;
          const { card, ...rest } = item;
          return rest;
        })
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          (item.lineId || item.id) === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const removeCard = (lineId) => {
    dispatch({ type: 'REMOVE_CARD', payload: lineId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => total + ((item.price + (item.card ? CARD_PRICE : 0)) * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      removeCard,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
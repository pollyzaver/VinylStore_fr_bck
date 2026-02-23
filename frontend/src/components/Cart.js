import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  // Если корзина закрыта - не рендерим ничего
  if (!isOpen) return null;

  return (
    <div 
      className="cart-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2 id="cart-title">Корзина</h2>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Закрыть корзину"
          >
            ×
          </button>
        </div>

        <div className="cart-content">
          {cart.items.length === 0 ? (
            <p className="cart-empty">Корзина пуста</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map(item => (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={process.env.PUBLIC_URL + item.image} 
                      alt={`Обложка альбома ${item.title}`} 
                    />
                    <div className="cart-item-info">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <div className="cart-item-price">{item.price.toLocaleString()} ₽</div>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Уменьшить количество"
                        >
                          -
                        </button>
                        <span className="quantity-number">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Увеличить количество"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Удалить ${item.title} из корзины`}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  Итого: <strong>{getCartTotal().toLocaleString()} ₽</strong>
                </div>
                <div className="cart-actions">
                  <button 
                    className="btn btn-outline" 
                    onClick={clearCart}
                  >
                    Очистить корзину
                  </button>
                  <button className="btn btn-primary">
                    Оформить заказ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
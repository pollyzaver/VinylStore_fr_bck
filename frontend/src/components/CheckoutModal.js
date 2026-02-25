import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/components/CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    comment: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Заказ оформлен:', {
      items: cart.items,
      total: getCartTotal(),
      customer: formData
    });
    alert('Спасибо за заказ! Мы свяжемся с вами для подтверждения.');
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal-content" onClick={e => e.stopPropagation()}>
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">Оформление заказа</h2>
          <button className="checkout-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="checkout-modal-body">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-form-group">
              <label>Ваше имя *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Иван Иванов"
              />
            </div>

            <div className="checkout-form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="checkout-form-group">
              <label>Адрес доставки *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
              />
            </div>

            <div className="checkout-form-group">
              <label>Комментарий к заказу</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Дополнительная информация"
                rows="3"
              />
            </div>

            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span>Товаров:</span>
                <span>{cart.items.length} шт.</span>
              </div>
              <div className="checkout-summary-row">
                <span>Сумма:</span>
                <span>{getCartTotal().toLocaleString()} ₽</span>
              </div>
              <div className="checkout-summary-row">
                <span>Доставка:</span>
                <span>Бесплатно</span>
              </div>
              <div className="checkout-summary-row total">
                <span>Итого к оплате:</span>
                <span>{getCartTotal().toLocaleString()} ₽</span>
              </div>
            </div>

            <div className="checkout-actions">
              <button type="button" className="checkout-btn-back" onClick={onClose}>
                Назад
              </button>
              <button type="submit" className="checkout-btn-submit">
                Подтвердить заказ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
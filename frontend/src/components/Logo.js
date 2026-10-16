import React from 'react';

// Wordmark S◯lco: диск вместо первой «o», по высоте строчной буквы, на базовой линии.
const Logo = ({ size = 34, className = '' }) => (
  <span
    className={`solco-logo ${className}`.trim()}
    style={{ '--logo-size': `${size}px` }}
    role="img"
    aria-label="Solco"
  >
    <span aria-hidden="true">S</span>
    <svg className="solco-o" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle className="ring" cx="50" cy="50" r="43.5" />
      <circle className="groove" cx="50" cy="50" r="27" />
      <circle className="label" cx="50" cy="50" r="6" />
    </svg>
    <span aria-hidden="true">lco</span>
  </span>
);

export default Logo;

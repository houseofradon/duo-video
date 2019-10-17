import React from 'react';

import './index.css';

interface Props{
  index: number,
  onClick: () => void,
  title: string,
  cssType: string,
  currentIndex: number,
}

const NavButton = ({
  index, onClick, title, cssType, currentIndex,
}: Props) => (
  <div className={`nav-button ${cssType}${currentIndex === index ? ' active' : ''}`}>
    <button type="button" onClick={() => onClick(index)}>{title}</button>
  </div>
);

export default NavButton;

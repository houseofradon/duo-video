import React from 'react';

import Loader from '../assets/loader.svg';

import './index.css';

interface Props{
  visible: boolean
}

const LoadingScreen = ({ visible }: Props) => (
  <div className={`loading-screen${visible ? ' visible' : ''}`}>
    <img width="200" height="200" src={Loader} alt="loader" />
  </div>
);

export default LoadingScreen;

import React from 'react';

import './index.css';

interface Props{
  visible: boolean,
  onStartClick: () => void,
  mediaReady: boolean,
}

const StartScreen = ({ onStartClick, visible, mediaReady }: Props) => (
  <div className={`start-screen${visible ? ' visible' : ''}`}>
    <div className="center-container">
      <h2>Duo Video</h2>
      <button className={mediaReady ? 'visible' : ''} type="button" onClick={onStartClick}>Start</button>
    </div>
  </div>
);


export default StartScreen;

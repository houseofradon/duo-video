import React from 'react';

import PlayIcon from '../assets/play.svg';
import PauseIcon from '../assets/pause.svg';

import './index.css';

interface Props{
  isPlaying: boolean,
  isLoading: boolean,
  onPlayClick: () => void,
  onPauseClick: () => void,
}

const PlayPauseControl = ({
  isPlaying, isLoading, onPlayClick, onPauseClick,
}: Props) => (
  <div className={`play-pause-control${isLoading ? ' hide' : ''}`}>
    {isPlaying ? (
      <button onClick={onPauseClick} type="button">
        <img src={PauseIcon} alt="pause-icon" />
      </button>
    ) : (
      <button onClick={onPlayClick} type="button">
        <img src={PlayIcon} alt="play-icon" />
      </button>
    )}
  </div>
);

export default PlayPauseControl;

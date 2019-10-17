import React, { useCallback } from 'react';

import MutedIcon from '../assets/muted.svg';
import UnMutedIcon from '../assets/volume.svg';

import './index.css';

interface Props{
  playerState: boolean,
  onSetMute: (boolean) => void,
}

const MutedControl = ({ playerState, onSetMute }: Props) => {
  const mute = useCallback(() => {
    onSetMute(true);
  }, [onSetMute]);

  const unMute = useCallback(() => {
    onSetMute(false);
  }, [onSetMute]);

  return (
    <div className="muted-control">
      {playerState.isMuted ? (
        <button onClick={unMute} type="button">
          <img src={MutedIcon} alt="mute-icon" />
        </button>
      ) : (
        <button onClick={mute} type="button">
          <img src={UnMutedIcon} alt="not-muted-icon" />
        </button>
      )}
    </div>
  );
};

export default MutedControl;

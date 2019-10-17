/* global window */

import React, { useLayoutEffect } from 'react';

// import './index.css';

const style = {
  position: 'absolute',
  top: '10px',
  right: '200px',
  zIndex: '-1',
};

interface Props{
  onReady: (number) => void,
  src: string,
}

const AudioPlayer = React.forwardRef(({
  onReady,
  src,
}: Props, audioRef) => {
  const isIE11 = () => !!window.msCrypto;

  useLayoutEffect(() => {
    let tempAudioRef = null;
    if (audioRef.current) {
      tempAudioRef = audioRef.current;
      // eslint-disable-next-line no-param-reassign
      audioRef.current.src = src;
      audioRef.current.addEventListener('loadedmetadata', onReady);
      // eslint-disable-next-line no-param-reassign
      audioRef.current.volume = 0;
    }

    return () => {
      if (tempAudioRef) {
        tempAudioRef.removeEventListener('loadedmetadata', onReady);
      }
    };
  }, [audioRef, onReady, src]);

  /* eslint-disable jsx-a11y/media-has-caption */
  return (
    <audio
      data-testid="audio-player"
      className={`audio-player ${isIE11() ? 'isIE' : ''}`}
      ref={audioRef}
      controls
      style={style}
    />
  );
  /* eslint-enable jsx-a11y/media-has-caption */
});

export default AudioPlayer;

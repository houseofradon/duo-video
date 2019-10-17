/* global window */

import React, { useState, useCallback, useEffect } from 'react';

const style = {
  position: 'absolute',
  background: 'white',
  color: 'black',
  right: '20px',
  top: '70%',
  zIndex: '2',
  padding: '0 20px',
  width: '200px',
};

interface Props{
  audioRef: Object,
  videoRefs: Array<Object>,
}

const DebugLayer = (props: Props) => {
  const { audioRef, videoRefs } = props;
  const [el, setEl] = useState(null);
  const render = useCallback(() => {
    window.requestAnimationFrame(render);
    if (audioRef.current && (videoRefs.current && videoRefs.current['0-video'] && videoRefs.current['1-video'] && videoRefs.current['0-video'].current)) {
      const children = el.querySelectorAll('p');
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (i === 0) {
          child.innerHTML = `Audio: ${Math.round(audioRef.current.currentTime * 1000) / 1000.0}`;
        } else if (i === 1) {
          child.innerHTML = `Video 0: ${Math.round(videoRefs.current['0-video'].current.currentTime * 1000.0) / 1000.0}`;
        } else if (i === 2) {
          child.innerHTML = `Video 1: ${Math.round(videoRefs.current['1-video'].current.currentTime * 1000.0) / 1000.0}`;
        }
      }
    }
  }, [audioRef, videoRefs, el]);

  const debugRef = useCallback((debugEl) => {
    if (debugEl) {
      setEl(debugEl);
    }
  }, []);

  useEffect(() => {
    if (el && audioRef.current && videoRefs.current) {
      render();
    }
  }, [el, audioRef, videoRefs, render]);

  return (
    <div style={style} ref={debugRef} className="debug-layer">
      <p />
      <p />
      <p />
    </div>
  );
};

export default DebugLayer;

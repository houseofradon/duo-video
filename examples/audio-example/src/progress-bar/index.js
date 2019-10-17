/* global window */

import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';

import ProgressIndicator from './progress-indicator';

import './index.css';

interface Props{
  getCurrentTime: () => number,
  getDuration: () => number,
  getBuffers: () => Object,
  videoPaths: Array<Object>,
  setCurrentTime: (number) => void,
}

const ProgressBar = (props: Props) => {
  const {
    getBuffers, getDuration, setCurrentTime, getCurrentTime,
  } = props;

  const animFrameRef = useRef(0);
  const durationIntervalRef = useRef(0);
  const [duration, setDuration] = useState(0);
  const [audioBufferBar, setAudioBufferBar] = useState(null);
  const [video0BufferBar, setVideo0BufferBar] = useState(null);
  const [video1BufferBar, setVideo1BufferBar] = useState(null);
  const [progressIndicator, setProgressIndicator] = useState(null);
  const [barContainer, setBarContainer] = useState(null);
  const isDraggingRef = useRef(false);
  const winWRef = useRef(window.innerWidth);

  useEffect(() => {
    const onResize = () => {
      winWRef.current = window.innerWidth;
    };

    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    durationIntervalRef.current = setInterval(() => {
      const durationTime = getDuration();
      if (durationTime > 0) {
        setDuration(durationTime);

        clearInterval(durationIntervalRef.current);
      }
    }, 2000);
  }, [getDuration]);

  const setIsDragging = useCallback((isDragging: boolean) => {
    isDraggingRef.current = isDragging;
  }, []);

  const barContainerRef = useCallback((el) => {
    if (el) {
      setBarContainer(el);
    }
  }, []);

  const progressIndicatorRef = useCallback((el) => {
    if (el) {
      setProgressIndicator(el);
    }
  }, []);

  const audioBarBufferCallback = useCallback((el) => {
    if (el) {
      setAudioBufferBar(el);
    }
  }, []);

  const video0BufferCallback = useCallback((el) => {
    if (el) {
      setVideo0BufferBar(el);
    }
  }, []);

  const video1BufferCallback = useCallback((el) => {
    if (el) {
      setVideo1BufferBar(el);
    }
  }, []);

  const onClick = (e: Object) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const time = (x / winWRef.current) * duration;

    setCurrentTime(time);
  };

  const render = useCallback(() => {
    animFrameRef.current = window.requestAnimationFrame(render);

    const w = winWRef.current;

    const buffers = getBuffers();
    if (!isDraggingRef.current) {
      const currentTime = getCurrentTime();
      const progressX = Math.floor((currentTime / duration) * w);
      progressIndicator.style.transform = `translateX(${progressX}px)`;
    }

    const audioBufferWidth = Math.floor((buffers.audioBuffer / duration) * 100);
    audioBufferBar.style.width = `${audioBufferWidth}%`;

    const video0BufferWidth = Math.floor((buffers.video0Buffer / duration) * 100);
    video0BufferBar.style.width = `${video0BufferWidth}%`;

    const video1BufferWidth = Math.floor((buffers.video1Buffer / duration) * 100);
    video1BufferBar.style.width = `${video1BufferWidth}%`;
  }, [
    getBuffers,
    audioBufferBar,
    duration,
    video0BufferBar,
    video1BufferBar,
    progressIndicator,
    getCurrentTime,
  ]);

  const onKeyDown = () => {};

  useEffect(() => {
    if (audioBufferBar && video1BufferBar && video0BufferBar && duration > 0 && progressIndicator) {
      render();
    }
  }, [audioBufferBar, video0BufferBar, video1BufferBar, duration, render, progressIndicator]);

  return (
    <div
      className="progress-bar"
      ref={barContainerRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
    >
      <div ref={audioBarBufferCallback} className="bar-buffer audio">
        audio
      </div>
      <div ref={video0BufferCallback} className="bar-buffer video0">
        video0
      </div>
      <div ref={video1BufferCallback} className="bar-buffer video1">
        video1
      </div>

      <ProgressIndicator
        ref={progressIndicatorRef}
        parentEl={barContainer}
        setCurrentTime={setCurrentTime}
        duration={duration}
        setIsDragging={setIsDragging}
      />
    </div>
  );
};

export default ProgressBar;

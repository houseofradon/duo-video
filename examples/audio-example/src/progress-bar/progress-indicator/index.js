/* global window */

import React, { useRef, useState, useCallback } from 'react';

import './index.css';

interface Props{
  setCurrentTime: (number) => void,
  parentEl: Object,
  duration: number,
  setIsDragging: (boolean) => void,
}

const ProgressIndicator = React.forwardRef(({
  setCurrentTime,
  parentEl,
  duration,
  setIsDragging,
}: Props, indicatorRef) => {
  const startDownX = useRef(0);
  const [el, setEl] = useState(null);
  const winWRef = useRef(window.innerWidth);

  const elRef = useCallback((indicatorEl) => {
    if (indicatorEl) {
      setEl(indicatorEl);
    }
  }, []);

  const onMove = (e: Object) => {
    e.preventDefault();
    e.stopPropagation();

    const isTouch = (e.touches && e.touches.length > 0);

    const x = isTouch ? e.touches[0].x : e.clientX;
    const delta = x - startDownX.current;

    const newX = delta;
    el.style.transform = `translateX(${newX}px)`;

    const w = winWRef.current;

    const timeX = newX + startDownX.current;
    const time = (timeX / w) * duration;

    setCurrentTime(time);
  };

  const onUp = () => {
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('mousemove', onMove);
    parentEl.removeEventListener('mouseleave', onUp);

    setIsDragging(false);

    el.style.transform = `translateX(${0}px)`;
  };

  const onDown = (e: Object) => {
    e.preventDefault();
    e.stopPropagation();

    const isTouch = (e.touches && e.touches.length > 0);
    startDownX.current = isTouch ? e.touches[0].x : e.clientX;

    setIsDragging(true);

    winWRef.current = window.innerWidth;

    if (isTouch) {
      window.addEventListener('touchmove', onMove);
    } else {
      window.addEventListener('mousemove', onMove);
      parentEl.addEventListener('mouseleave', onUp);
    }
  };

  return (
    <div
      ref={indicatorRef}
      className="progress-indicator"
    >
      <div
        ref={elRef}
        className="dragger"
        onMouseDown={onDown}
        onMouseUp={onUp}
        onTouchStart={onDown}
        onTouchEnd={onUp}
        role="button"
        tabIndex={0}
        label="dragger"
      />
    </div>
  );
});

export default ProgressIndicator;

/* global window */
import React, {
  useRef, useEffect, useState, useCallback, useLayoutEffect,
} from 'react';

// import './index.css';

const style = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  willChange: 'contents',
  display: 'block',
  transition: 'opacity 0.2s',
};

let Hls;

interface Props{
  mp4?: boolean,
  src: string,
  fallbackSrc: string,
  onVideoReady: (number) => void,
  index: number,
  currentIndex: number,
}

const VideoPlayer = React.forwardRef(({
  mp4,
  src,
  fallbackSrc,
  onVideoReady,
  index,
  currentIndex,
}: Props, videoRef) => {
  const hlsRef = useRef(null);

  const currentVolRef = useRef(0);
  const targetVolRef = useRef(0);
  const [shouldUseFallback, setShouldUseFallback] = useState(false);

  const useAnimationFrame = (callback: () => void) => {
    const callbackRef = useRef(callback);

    callbackRef.current = callback;

    const frameRef = useRef();

    const loop = useCallback(() => {
      frameRef.current = window.requestAnimationFrame(
        loop,
      );
      const cb = callbackRef.current;
      cb();
    }, []);

    useLayoutEffect(() => {
      frameRef.current = window.requestAnimationFrame(
        loop,
      );
      return () => window.cancelAnimationFrame(frameRef.current);
    }, [loop]);
  };

  const isIE11 = () => !!window.msCrypto;

  useAnimationFrame(() => {
    if ((videoRef && !videoRef.current) || !videoRef) {
      return;
    }

    currentVolRef.current += (targetVolRef.current - currentVolRef.current) * 0.1;
    const diff = Math.abs(targetVolRef.current - currentVolRef.current);

    if (diff < 0.05) {
      currentVolRef.current = targetVolRef.current;
    }

    // eslint-disable-next-line no-param-reassign
    videoRef.current.volume = currentVolRef.current;
  });

  const onReady = useCallback(() => {
    onVideoReady(index);
  }, [onVideoReady, index]);

  useEffect(() => {
    if (currentIndex === 0 && index === 0) {
      targetVolRef.current = 1;
    } else if (currentIndex > 0 && index === 0) {
      targetVolRef.current = 0;
    }

    if (currentIndex === 1 && index === 1) {
      targetVolRef.current = 1;
    } else if (currentIndex === 0 && index === 1) {
      targetVolRef.current = 0;
    }
  }, [currentIndex, index]);

  const setVideo = useCallback(() => {
    if (!mp4) {
      if (!Hls) {
        try {
          // eslint-disable-next-line global-require
          Hls = require('hls.js');
        } catch (err) {
          throw new Error(err);
        }
      }
      if (Hls.isSupported()) {
        if (!hlsRef.current) {
          hlsRef.current = new Hls({ enableWorker: false });
          hlsRef.current.loadSource(src);
          hlsRef.current.attachMedia(videoRef.current);
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, onReady);
        }
      } else if (videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        if (src) {
          videoRef.current.addEventListener('loadedmetadata', onReady);
          // eslint-disable-next-line no-param-reassign
          videoRef.current.src = src;
        }
      }
    } else {
      setShouldUseFallback(true);
      videoRef.current.addEventListener('loadedmetadata', onReady);
    }

    // eslint-disable-next-line no-param-reassign
    videoRef.current.muted = true;
    setTimeout(() => {
      if (videoRef && videoRef.current) {
        // eslint-disable-next-line no-param-reassign
        videoRef.current.muted = false;
      }
    }, 2000);
  }, [mp4, onReady, src, videoRef]);

  const videoRefCallback = useCallback((el) => {
    if (el) {
      // eslint-disable-next-line no-param-reassign
      videoRef.current = el;
      setVideo();
    }
  }, [videoRef, setVideo]);

  useEffect(() => () => {
    if (hlsRef && hlsRef.current) {
      hlsRef.current.off(Hls.Events.MANIFEST_PARSED, onReady);
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
    }

    if (videoRef && videoRef.current) {
      videoRef.current.removeEventListener('loadedmetadata', onReady);
    }
  }, [videoRef, onReady]);

  let source;

  if (mp4) {
    source = <source src={src} type="video/mp4" />;
  } else if (shouldUseFallback) {
    source = <source src={fallbackSrc} type="video/mp4" />;
  }

  /* eslint-disable jsx-a11y/media-has-caption */
  return (
    <video
      data-testid="video-player"
      playsInline
      webkit-playsinline="true"
      preload="auto"
      ref={videoRefCallback}
      className={`videoItem${isIE11() ? ' isIE' : ''}`}
      crossOrigin="anonymous"
      style={style}
    >
      {source}
    </video>
  );
  /* eslint-enable jsx-a11y/media-has-caption */
});

export default VideoPlayer;

import React, {
  useRef,
  useCallback,
  useState,
  useReducer,
  useEffect,
} from 'react';

import DuoVideo from 'duo-video';

import StartScreen from '../start-screen';
import NavButton from '../nav-button';
import ProgressBar from '../progress-bar';
import LoadingScreen from '../loading-screen';
import PlayPauseControl from '../play-pause-control';
import MutedControl from '../muted-control';

import playerReducer from './player-reducer';

// import { fragmentDebug } from './shaders';

const videoPaths = [
  {
    src: `${process.env.PUBLIC_URL}/videos/hls/DuoVideo_1.m3u8`,
    fallback: `${process.env.PUBLIC_URL}/videos/mp4/DuoVideo_1.mp4`,
  },
  {
    src: `${process.env.PUBLIC_URL}/videos/hls/DuoVideo_2.m3u8`,
    fallback: `${process.env.PUBLIC_URL}/videos/mp4/DuoVideo_2.mp4`,
  },
];

// const videoPaths = [
//   {
//     src: `${process.env.PUBLIC_URL}/videos/mp4/DuoVideo_1.mp4`,
//     fallback: `${process.env.PUBLIC_URL}/videos/mp4/DuoVideo_1.mp4`,
//     mp4: true,
//   },
//   {
//     src: `${process.env.PUBLIC_URL}/videos/mp4/DuoVideo_2.mp4`,
//     fallback: `${process.env.PUBLIC_URL}/videos/mp4/DuoVideo_2.mp4`,
//     mp4: true,
//   },
// ];

const audioPath = `${process.env.PUBLIC_URL}/audio.mp3`;

const Container = () => {
  const [startScreenVisible, setStartScreenVisible] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const ref = useRef(null);
  const graphicsLayerRef = useRef(null);
  const [mediaIsReady, setMediaIsReady] = useState(false);
  const checkBufferIntervalRef = useRef(0);

  const playerInitState = {
    isLoading: false,
    isPlaying: false,
    canBeSafelyPlayed: false,
    isMuted: false,
  };

  const [playerState, playerDispatch] = useReducer(playerReducer, playerInitState);

  /* SYNC MEDIA LOOP --- VERY GOOD FOR SYNCING AND SLOWER CONNECTIONS */
  useEffect(() => {
    if (playerState.canBeSafelyPlayed) {
      checkBufferIntervalRef.current = setInterval(() => {
        if (ref && ref.current) {
          ref.current.checkBuffers(playerState, playerDispatch);
        }
      }, 2000);

      if (ref && ref.current) {
        ref.current.checkBuffers(playerState, playerDispatch);
      }
    }

    return () => {
      // $FlowFixMe
      clearInterval(checkBufferIntervalRef.current);
    };
  }, [playerState, playerDispatch]);

  /* NEEDS TO BE CALLED ONCE TO TRIGGER CAN-BE-SAFELY-PLAYED EVENT */
  const onStartClick = useCallback(() => {
    if (ref && ref.current) {
      ref.current.start();
      setStartScreenVisible(false);
    }
  }, []);

  /* CALLED WHEN ITS SAFE TO PLAY (IOS) */
  const onMediaCanBeSafelyPlayed = useCallback(() => {
    playerDispatch({ type: 'safely-played', payload: true });
    if (ref && ref.current) {
      ref.current.play(playerDispatch);
    }
  }, []);

  /* DUO VIDEO ENDPOINTS  --- START --- */
  const getBuffers = useCallback(() => {
    if (ref && ref.current) {
      return ref.current.getBuffers();
    }
    return {};
  }, []);

  const getDuration = useCallback(() => {
    if (ref && ref.current) {
      return ref.current.getDuration();
    }
    return 0;
  }, []);

  const getCurrentTime = useCallback(() => {
    if (ref && ref.current) {
      return ref.current.getCurrentTime();
    }
    return 0;
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    if (ref && ref.current && playerState.canBeSafelyPlayed) {
      ref.current.setCurrentTime(time, playerState, playerDispatch);
    }
  }, [playerState]);

  const onPlayClick = useCallback(() => {
    if (ref && ref.current && !playerState.isLoading) {
      ref.current.play(playerDispatch);
    }
  }, [playerState]);

  const onPauseClick = useCallback(() => {
    if (ref && ref.current) {
      ref.current.pause(playerDispatch);
    }
  }, []);

  const onSetMute = useCallback((mute: boolean) => {
    if (ref && ref.current) {
      ref.current.mute(mute, playerDispatch);
    }
  }, []);
  /* DUO VIDEO ENDPOINTS  --- END --- */

  const onNavButtonClick = useCallback((index: number) => {
    setVideoIndex(index);
  }, []);

  return (
    <div className="container">
      <DuoVideo
        videoPaths={videoPaths}
        audioPath={audioPath}
        ref={ref}
        frontRef={graphicsLayerRef}
        currentIndex={videoIndex}
        onMediaCanBeSafelyPlayed={onMediaCanBeSafelyPlayed}
        onMediaReady={setMediaIsReady}
        videoResolution={[1920, 1080]}
        showDebug
      />
      <NavButton index={0} onClick={onNavButtonClick} title="VIDEO 0" cssType="left" currentIndex={videoIndex} />
      <NavButton index={1} onClick={onNavButtonClick} title="VIDEO 1" cssType="right" currentIndex={videoIndex} />
      <ProgressBar
        getBuffers={getBuffers}
        getDuration={getDuration}
        getCurrentTime={getCurrentTime}
        setCurrentTime={setCurrentTime}
      />
      <PlayPauseControl
        isPlaying={playerState.isPlaying}
        isLoading={playerState.isLoading}
        onPlayClick={onPlayClick}
        onPauseClick={onPauseClick}
      />
      <MutedControl
        playerState={playerState}
        onSetMute={onSetMute}
      />
      <StartScreen
        onStartClick={onStartClick}
        visible={startScreenVisible}
        mediaReady={mediaIsReady}
      />
      <LoadingScreen visible={playerState.isLoading} />
    </div>
  );
};

export default Container;

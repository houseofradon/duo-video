/* global HTMLVideoElement */
// @flow
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
} from 'react';

import FrontLayer from './front-layer';
import VideoPlayer from './components/video-player';
import AudioPlayer from './components/audio-player';
import DebugLayer from './debug-layer';

import {
  play,
  pause,
  getBuffers,
  getDuration,
  setCurrentTime,
  getCurrentTime,
  checkBuffers,
  mute,
} from './media-sync';

const style = {
  background: 'black',
  width: '100vw',
  height: '100vh',
};

interface VideoObj {
  src: string,
  fallback: string,
  mp4?: boolean,
}

interface Props{
  videoPaths: Array<VideoObj>,
  audioPath?: string,
  frontRef: Object,
  currentIndex: number,
  onMediaCanBeSafelyPlayed: () => void,
  onMediaReady: (boolean) => void,
  fragmentShader?: string,
  videoResolution: Array<number>,
  showDebug?: boolean,
}

const DuoVideo = React.forwardRef<Props, Object>(({
  videoPaths,
  audioPath,
  frontRef,
  currentIndex,
  onMediaCanBeSafelyPlayed,
  onMediaReady,
  fragmentShader,
  videoResolution,
  showDebug,
}: Props, componentRef) => {
  const videoRefs = useRef({});
  const audioPlayerRef: { current: null | HTMLVideoElement } = useRef(null);
  const videosReady = useRef(0);
  const audioReady = useRef(false);
  const [initHasBeenCalled, setInitHasBeenCalled] = useState(false);
  const [videosCanRender, setVideosCanRender] = useState(false);
  const mediaRef = useRef({
    audio: null,
    video0: null,
    video1: null,
  });

  /* INIT VIDEO REFS */
  useMemo(() => {
    for (let i = 0; i < videoPaths.length; i++) {
      const ref = React.createRef();
      const key = `${i}-video`;
      videoRefs.current[key] = ref;
    }
  }, [videoPaths]);

  /*
    ONLY WAY I'VE MANAGED TO GET THIS TO WORK ON SAFARI IOS
  */
  const onStartClick = () => {
    setTimeout(() => {
      if (videoRefs.current['0-video'].current) {
        videoRefs.current['0-video'].current.play()
          .then(() => {
            // console.log('play video 0');
            videoRefs.current['0-video'].current.pause();
          });
      }

      setTimeout(() => {
        if (videoRefs.current['1-video'].current) {
          videoRefs.current['1-video'].current.play()
            .then(() => {
              // console.log('play video 1');
              videoRefs.current['1-video'].current.pause();
            });
        }
        setTimeout(() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.play()
              .then(() => {
                if (audioPlayerRef.current) {
                  audioPlayerRef.current.pause();
                }
                setInitHasBeenCalled(true);
                setVideosCanRender(true);

                setTimeout(() => {
                  onMediaCanBeSafelyPlayed();
                }, 200);
              });
          } else {
            setInitHasBeenCalled(true);
            setVideosCanRender(true);

            setTimeout(() => {
              onMediaCanBeSafelyPlayed();
            }, 200);
          }
        }, 200);
      }, 100);
    }, 500);
  };

  /*
    USEFUL FUNCTIONS FOR BUILDING THINGS LIKE
    PROGRESS-BAR AND VARIOUS CONTROLS
  */
  useImperativeHandle(componentRef, () => ({
    start: () => {
      onStartClick();
    },
    checkBuffers: (playerState: Object, playerDispatch: (Object) => void) => {
      checkBuffers(mediaRef, playerState, playerDispatch);
    },
    getBuffers: () => getBuffers(mediaRef),
    play: (playerDispatch: (Object) => void) => {
      if (initHasBeenCalled) {
        play(mediaRef, playerDispatch);
      }
    },
    pause: (playerDispatch: (Object) => void) => {
      pause(mediaRef, playerDispatch);
    },
    getDuration: () => getDuration(mediaRef),
    setCurrentTime: (time: number, playerState: Object, playerDispatch: (Object) => void) => {
      setCurrentTime(time, mediaRef, playerState, playerDispatch);
    },
    getCurrentTime: () => getCurrentTime(mediaRef),
    mute: (payload: boolean, playerDispatch: (Object) => void) => {
      mute(payload, mediaRef, playerDispatch);
    },
  }));

  const checkMediaInitLoaded = useCallback(() => {
    if (videoPaths && videoPaths.length > 0 && audioPath) {
      if (audioReady.current && (videosReady.current === videoPaths.length)) {
        onMediaReady(true);

        // $FlowFixMe
        mediaRef.current.audio = audioPlayerRef.current;
        mediaRef.current.video0 = videoRefs.current['0-video'].current;
        mediaRef.current.video1 = videoRefs.current['1-video'].current;
      }
    }

    if (!audioPath) {
      if (videosReady.current === videoPaths.length) {
        onMediaReady(true);

        // $FlowFixMe
        mediaRef.current.audio = audioPlayerRef.current;
        mediaRef.current.video0 = videoRefs.current['0-video'].current;
        mediaRef.current.video1 = videoRefs.current['1-video'].current;
      }
    }
  }, [videoPaths, onMediaReady, audioPath]);

  const onAudioReady = useCallback(() => {
    audioReady.current = true;
    checkMediaInitLoaded();
  }, [checkMediaInitLoaded]);

  const onVideoReady = useCallback(() => {
    videosReady.current += 1;
    if (videosReady.current === videoPaths.length) {
      checkMediaInitLoaded();
    }
  }, [videoPaths, checkMediaInitLoaded]);

  const videoMapMemo = useMemo(() => (
    videoPaths.map((t, i) => (
      <div className="videoContainerItem" key={`video-${i}`}>
        <VideoPlayer
          src={t.src}
          mp4={t.mp4}
          fallbackSrc={t.fallback}
          onVideoReady={onVideoReady}
          index={i}
          currentIndex={currentIndex}
          ref={videoRefs.current[`${i}-video`]}
        />
      </div>
    ))
  ), [onVideoReady, videoPaths, currentIndex]);

  const audioPlayerMemo = useMemo(() => {
    const audioPaths = audioPath ? [audioPath] : [];
    return audioPaths.map((t, i) => (
      <AudioPlayer
        key={`audio-key-${i}`}
        onReady={onAudioReady}
        ref={audioPlayerRef}
        src={t}
      />
    ));
  }, [audioPath, onAudioReady]);

  const frontLayerMemo = useMemo(() => (
    <FrontLayer
      videos={videoRefs}
      readyRender={videosCanRender}
      currentIndex={currentIndex}
      ref={frontRef}
      fragmentShader={fragmentShader}
      videoResolution={videoResolution}
    />
  ), [currentIndex, videosCanRender, fragmentShader, frontRef, videoResolution]);

  return (
    <div style={style} className="duo-video">
      {audioPlayerMemo}
      {videoMapMemo}
      {frontLayerMemo}
      {showDebug && (
        <DebugLayer audioRef={audioPlayerRef} videoRefs={videoRefs} />
      )}
    </div>
  );
});

export default DuoVideo;

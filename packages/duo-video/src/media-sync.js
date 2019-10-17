// @flow

const getRefs = (mediaRefs: Object) => {
  const audioRef = mediaRefs.current.audio;
  const video0Ref = mediaRefs.current.video0;
  const video1Ref = mediaRefs.current.video1;

  return [audioRef, video0Ref, video1Ref];
};

export const getBuffers = (mediaRefs: Object) => {
  const [audioRef, video0Ref, video1Ref] = getRefs(mediaRefs);
  const audioBuffer = (audioRef && audioRef.buffered && audioRef.buffered.length > 0)
    ? audioRef.buffered.end(audioRef.buffered.length - 1) : 0;
  const video0Buffer = (video0Ref && video0Ref.buffered && video0Ref.buffered.length > 0)
    ? video0Ref.buffered.end(video0Ref.buffered.length - 1) : 0;
  const video1Buffer = (video1Ref && video1Ref.buffered && video1Ref.buffered.length > 0)
    ? video1Ref.buffered.end(video1Ref.buffered.length - 1) : 0;

  return {
    audioBuffer,
    video0Buffer,
    video1Buffer,
  };
};

// const sync = () => {
//   const currentTimeVideo0 = video0Ref.currentTime;
//   const currentTimeVideo1 = video1Ref.currentTime;

//   const min = Math.min(currentTimeVideo0, currentTimeVideo1);

//   audioRef.currentTime = min;
// };

export const getCurrentTime = (mediaRefs: Object) => {
  if (mediaRefs.current.video0) {
    return mediaRefs.current.video0.currentTime;
  }

  if (mediaRefs.current.audio) {
    return mediaRefs.current.audio.currentTime;
  }

  return 0;
};

export const play = (mediaRefs: Object, playerDispatch: (Object) => void) => {
  const [audioRef, video0Ref, video1Ref] = getRefs(mediaRefs);
  if (audioRef) {
    audioRef.play();
    audioRef.volume = 1.0;
  }
  if (video0Ref) {
    video0Ref.play();
  }
  if (video1Ref) {
    video1Ref.play();
  }
  if (playerDispatch) {
    playerDispatch({ type: 'playing', payload: true });
  }
};

export const pause = (mediaRefs: Object, playerDispatch: (Object) => void) => {
  const [audioRef, video0Ref, video1Ref] = getRefs(mediaRefs);
  if (audioRef) {
    audioRef.pause();
  }
  if (video0Ref) {
    video0Ref.pause();
  }
  if (video1Ref) {
    video1Ref.pause();
  }
  if (playerDispatch) {
    playerDispatch({ type: 'playing', payload: false });
  }
};

export const mute = (payload: boolean, mediaRefs: Object, playerDispatch: (Object) => void) => {
  const [audioRef, video0Ref, video1Ref] = getRefs(mediaRefs);
  if (audioRef) {
    audioRef.muted = payload;
  }
  if (video0Ref) {
    video0Ref.muted = payload;
  }
  if (video1Ref) {
    video1Ref.muted = payload;
  }
  if (playerDispatch) {
    playerDispatch({ type: 'mute', payload });
  }
};

export const getDuration = (mediaRefs: Object) => {
  if (mediaRefs.current.video0) {
    return mediaRefs.current.video0.duration;
  }

  if (mediaRefs.current.audio) {
    return mediaRefs.current.audio.duration;
  }

  return 0;
};

export const onLoading = (mediaRefs: Object, playerDispatch: (Object) => void) => {
  if (playerDispatch) {
    playerDispatch({ type: 'loading', payload: true });
  }
  pause(mediaRefs, playerDispatch);
};

export const onDoneLoading = (mediaRefs: Object, playerDispatch: (Object) => void) => {
  if (playerDispatch) {
    playerDispatch({ type: 'loading', payload: false });
  }
  play(mediaRefs, playerDispatch);
};

export const checkBuffers = (
  mediaRefs: Object, playerState: Object, playerDispatch: (Object) => void,
) => {
  const currentTime = getCurrentTime(mediaRefs);
  const buffers = getBuffers(mediaRefs);

  const getBufferOffset = () => {
    const duration = mediaRefs.current.video0 ? mediaRefs.current.video0.duration : -1;
    if (duration > 0) {
      if ((duration - currentTime) <= 3) {
        return 0;
      }
    }

    return 3;
  };

  const bufferOffset = getBufferOffset();

  const audioIsBuffering = mediaRefs.current.audio
    ? (buffers.audioBuffer - 0) < currentTime : false;
  const video0IsBuffering = (buffers.video0Buffer - bufferOffset) < currentTime;
  const video1IsBuffering = (buffers.video1Buffer - bufferOffset) < currentTime;

  if (playerState.isLoading && !audioIsBuffering && !video0IsBuffering && !video1IsBuffering) {
    onDoneLoading(mediaRefs, playerDispatch);
  }

  if ((audioIsBuffering || video0IsBuffering || video1IsBuffering) && !playerState.isLoading) {
    onLoading(mediaRefs, playerDispatch);
  }
};

export const setCurrentTime = (
  time: number, mediaRefs: Object, playerState: Object, playerDispatch: (Object) => void,
) => {
  const [audioRef, video0Ref, video1Ref] = getRefs(mediaRefs);
  if (audioRef) {
    audioRef.currentTime = time;
  }
  if (video0Ref) {
    video0Ref.currentTime = time;
  }
  if (video1Ref) {
    video1Ref.currentTime = time;
  }
  checkBuffers(mediaRefs, playerState, playerDispatch);
};

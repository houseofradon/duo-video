# DuoVideo

DuoVideo is a react component for playing two videos synced. Finally rendered in webgl with an option to have an audiofile playing in sync aswell. There is also an option to pass in your own fragment shader to control the final graphics.

## Installation

Use [npm](https://npmjs.org) or [yarn](https://yarnpkg.com) to install DuoVideo.

```yarn
yarn add duo-video
```

## Usage

```javascript
import DuoVideo from 'duo-video';
````

### Loop to keep things in sync
ref is returned from DuoVideo component.
Look below for details about playerState and playerDispatch

```javascript
const intervalRef = useRef(null);

useEffect(() => {
  if (playerState.canBeSafelyPlayed) {
    intervalRef.current = setInterval(() => {
      if (ref && ref.current) {
        ref.current.checkBuffers(playerState, playerDispatch);
      }
    }, 2000);

    if (ref && ref.current) {
      ref.current.checkBuffers(playerState, playerDispatch);
    }
  }

  return () => {
    clearInterval(intervalRef.current);
  };
}, [playerState, playerDispatch]);
```

### DuoVideoBuffer
```javascript
{
  audioBuffer?: number,
  video0Buffer: number,
  video1Buffer: number,
}
```

### VideoObj
```javascript
{
  src: string, //hls src || if (mp4 = true) mp4 src
  fallback: string, //mp4 src
  mp4?: boolean, //force use mp4
}
```

### DuoVideo Props
```javascript
{
  videoPaths: Array<VideoObj>, // Length = 2
  audioPath?: string,
  frontRef: Object,
  currentIndex: number,
  onMediaCanBeSafelyPlayed: () => void,
  onMediaReady: (boolean) => void,
  fragmentShader?: string,
  videoResolution: Array<number>,
  showDebug?: boolean,
}
```
### Player State
The component requires a reducer to be passed to public functions which are explained below.

```javascript
const playerReducer = (state: Object, action: Object) => {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'playing':
      return {
        ...state,
        isPlaying: action.payload,
      };
    case 'safely-played':
      return {
        ...state,
        canBeSafelyPlayed: action.payload,
      };
    case 'mute':
      return {
        ...state,
        isMuted: action.payload,
      };
    default:
      throw new Error();
  }
};


const playerInitState = {
  isLoading: false,
  isPlaying: false,
  canBeSafelyPlayed: false,
  isMuted: false,
};

const [playerState, playerDispatch] = useReducer(playerReducer, playerInitState);
```

### Component

```javascript
<DuoVideo
  videoPaths={videoPaths} //required
  audioPath={audioPath} //optional - has to have the same duration as the videos
  ref={ref} //required
  frontRef={graphicsLayerRef} //required
  currentIndex={videoIndex} //required
  onMediaCanBeSafelyPlayed={onMediaCanBeSafelyPlayed} //required
  onMediaReady={setMediaIsReady} //required - called after media loaded
  videoResolution={[1280, 720]} //required
  showDebug //optional
/>
```

## Public Fns
There are some public functions available that's needed to interact with the component.

```javascript
start: () => void //triggers ios safe mobile init - has to be called first from a user action
getBuffers () => DuoVideoBuffer
play: (playerDispatch) => void
pause: (playerDispatch) => void
getDuration: () => number
setCurrentTime: (time: number, playerState, playerDispatch) => void
getCurrentTime: () => number
mute: (payload: boolean, playerDispatch) => void
```

## License
[ISC](https://choosealicense.com/licenses/isc/)
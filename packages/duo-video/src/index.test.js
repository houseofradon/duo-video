/* global window */

import React, { useReducer } from 'react';
import { cleanup, wait } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import DuoVideo from '.';

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

Enzyme.configure({ adapter: new Adapter() });

const CDN_NAME = 'CDN';
const ref = React.createRef();
const frontRef = React.createRef();
const videoPaths = [
  {
    src: `${CDN_NAME}/hls/video.m3u8`,
    fallback: `${CDN_NAME}/video.mp4`,
  },
  {
    src: `${CDN_NAME}/hls/video2.m3u8`,
    fallback: `${CDN_NAME}/video2.mp4`,
  },
];

const audioPath = 'audio.mp3';

window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

const mountWithRef = (elWithRef, options) => {
  const WithRef = () => elWithRef;
  return mount(<WithRef />, options);
};


afterEach(cleanup);

it('Renders without crashing', () => {
  shallow(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );
});

it('mounts correctly', () => {
  const component = mount(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );

  expect(component.exists()).toEqual(true);
});

it('has equal amount videoplayers as videoPaths props', () => {
  const component = mount(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );

  expect(component.find('video')).toHaveLength(videoPaths.length);
});

it('has audio player', () => {
  const component = mount(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );

  expect(component.find('audio')).toHaveLength(1);
});

it('has debug layer component', () => {
  const component = mount(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      showDebug
      videoResolution={[1280, 720]}
    />,
  );

  expect(component.find('DebugLayer')).toHaveLength(1);
});

it('front ref has public fns', () => {
  mount(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );

  expect(frontRef.current.setUniformFloat).toBeDefined();
});

it('ref has public fns', () => {
  mountWithRef(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={() => {}}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );

  expect(ref.current.start).toBeDefined();
  expect(ref.current.checkBuffers).toBeDefined();
  expect(ref.current.getBuffers).toBeDefined();
  expect(ref.current.play).toBeDefined();
  expect(ref.current.pause).toBeDefined();
  expect(ref.current.getDuration).toBeDefined();
  expect(ref.current.setCurrentTime).toBeDefined();
  expect(ref.current.getCurrentTime).toBeDefined();
  expect(ref.current.mute).toBeDefined();

  const playerInitState = {
    isLoading: false,
    isPlaying: false,
    canBeSafelyPlayed: false,
    isMuted: false,
  };

  const { result } = renderHook(() => useReducer(playerReducer, playerInitState));
  const [, dispatch] = result.current;

  act(() => {
    ref.current.mute(true, dispatch);
  });

  const [state] = result.current;

  expect(state.isMuted).toBe(true);
});

it('starts playing and then pauses', async () => {
  const onBeSafelyPlayed = jest.fn();
  mountWithRef(
    <DuoVideo
      videoPaths={videoPaths}
      audioPath={audioPath}
      ref={ref}
      frontRef={frontRef}
      currentIndex={0}
      onMediaCanBeSafelyPlayed={onBeSafelyPlayed}
      onMediaReady={() => {}}
      videoResolution={[1280, 720]}
    />,
  );

  const playerInitState = {
    isLoading: false,
    isPlaying: false,
    canBeSafelyPlayed: false,
    isMuted: false,
  };

  const { result } = renderHook(() => useReducer(playerReducer, playerInitState));
  const [, dispatch] = result.current;

  let duration = -1;
  act(() => {
    duration = ref.current.getDuration();
  });

  expect(duration).toBe(0);

  act(() => {
    ref.current.start();
  });

  await wait(() => {
    expect(onBeSafelyPlayed.mock.calls.length).toBe(1);

    act(() => {
      ref.current.play(dispatch);
    });

    expect(result.current[0].isPlaying).toBe(true);

    act(() => {
      ref.current.pause(dispatch);
    });

    expect(result.current[0].isPlaying).toBe(false);

    act(() => {
      ref.current.setCurrentTime(10.0, result.current[0], dispatch);
    });

    expect(result.current[0].isLoading).toBe(true);
  });
});

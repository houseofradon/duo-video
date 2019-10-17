/* global window */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import VideoPlayer from '.';

Enzyme.configure({ adapter: new Adapter() });

afterEach(cleanup);

const src = 'http://localhost/test.m3u';
const fallbackSrc = 'http://localhost/video.mp4';

it('Calls on ready fn if mp4', () => {
  const onReady = jest.fn();

  const { getByTestId, unmount } = render(
    <VideoPlayer
      mp4
      src={src}
      fallbackSrc={fallbackSrc}
      onVideoReady={onReady}
      index={0}
      currentIndex={0}
      ref={React.createRef()}
    />,
  );

  const videoEl = getByTestId('video-player');

  videoEl.dispatchEvent(new window.Event('loadedmetadata'));

  expect(onReady.mock.calls.length).toBe(1);

  unmount();

  videoEl.dispatchEvent(new window.Event('loadedmetadata'));

  expect(onReady.mock.calls.length).toBe(1);
});

it('Check if has src empty and doesnt add normal listener', () => {
  const onReady = jest.fn();

  const { getByTestId } = render(
    <VideoPlayer
      src={src}
      fallbackSrc={fallbackSrc}
      onVideoReady={onReady}
      index={0}
      currentIndex={0}
      ref={React.createRef()}
    />,
  );

  const videoEl = getByTestId('video-player');

  videoEl.dispatchEvent(new window.Event('loadedmetadata'));

  expect(onReady.mock.calls.length).toBe(0);

  expect(videoEl.src).toEqual('');
});

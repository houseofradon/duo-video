/* global window */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AudioPlayer from '.';

Enzyme.configure({ adapter: new Adapter() });

afterEach(cleanup);

const audioPath = 'http://localhost/audio.mp3';

it('Calls on ready fn', () => {
  const onReady = jest.fn();

  const { getByTestId } = render(
    <AudioPlayer
      onReady={onReady}
      src={audioPath}
      ref={React.createRef()}
    />,
  );

  const audioEl = getByTestId('audio-player');

  audioEl.dispatchEvent(new window.Event('loadedmetadata'));

  expect(onReady.mock.calls.length).toBe(1);
});

it('Removes event listener on unmount', () => {
  const onReady = jest.fn();

  const { getByTestId, unmount } = render(
    <AudioPlayer
      onReady={onReady}
      src={audioPath}
      ref={React.createRef()}
    />,
  );

  const audioEl = getByTestId('audio-player');

  audioEl.dispatchEvent(new window.Event('loadedmetadata'));

  expect(onReady.mock.calls.length).toBe(1);

  unmount();

  audioEl.dispatchEvent(new window.Event('loadedmetadata'));

  expect(onReady.mock.calls.length).toBe(1);
});

it('Has src attached', () => {
  const onReady = jest.fn();

  const ref = React.createRef();

  const { getByTestId } = render(
    <AudioPlayer
      onReady={onReady}
      src={audioPath}
      ref={ref}
    />,
  );

  const audioEl = getByTestId('audio-player');

  expect(audioEl.src).toEqual(audioPath);
});

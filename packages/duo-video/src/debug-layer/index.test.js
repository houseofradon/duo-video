import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import DebugLayer from '.';

Enzyme.configure({ adapter: new Adapter() });

const audioRef = { current: { currentTime: 10.34234234234 } };
const videoRefs = {
  current: {
    '0-video': {
      current: {
        currentTime: 20.2342342342342,
      },
    },
    '1-video': {
      current: {
        currentTime: 30.234234234,
      },
    },
  },
};

afterEach(cleanup);

it('Rounds numbers', () => {
  const { getByText } = render(<DebugLayer audioRef={audioRef} videoRefs={videoRefs} />);

  expect(getByText(/Audio/i).textContent).toBe('Audio: 10.342');
  expect(getByText(/Video 0/i).textContent).toBe('Video 0: 20.234');
  expect(getByText(/Video 1/i).textContent).toBe('Video 1: 30.234');
});

it('Unmounts', () => {
  const { unmount } = render(<DebugLayer audioRef={audioRef} videoRefs={videoRefs} />);
  unmount();
});

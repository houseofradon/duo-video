import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { act } from 'react-dom/test-utils';
import FrontLayer from '.';

Enzyme.configure({ adapter: new Adapter() });

const videos = {
  current: {
    'test-1': {},
    'test-2': {},
  },
};
const ref = React.createRef();

it('Renders without crashing', () => {
  const component = mount(
    <FrontLayer
      videos={videos}
      readyRender
      currentIndex={0}
      ref={ref}
    />,
  );

  expect(component.exists()).toEqual(true);
});

it('Renders with fragment shader prop', () => {
  const component = mount(
    <FrontLayer
      videos={videos}
      readyRender
      currentIndex={0}
      ref={ref}
      fragmentShader="gl"
    />,
  );

  expect(component.exists()).toEqual(true);
});

// @flow
/* global window */

import React, {
  useEffect, useState, useCallback, useRef, useImperativeHandle,
} from 'react';
import { vertex, fragment } from './shaders';
import {
  createProgram, createBuffer, draw, initTexture, updateTexture,
} from './gl-helpers';

import getRatioSize from './helpers';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate3d(-50%, -50%, 0)',
  width: '100%',
  height: '100%',
};

interface Props{
  videos: Object,
  readyRender: boolean,
  currentIndex: number,
  fragmentShader?: string | typeof undefined,
  videoResolution: Array<number>,
}

const FrontLayer = React.forwardRef<Props, Object>(({
  videos,
  readyRender,
  currentIndex,
  fragmentShader,
  videoResolution,
}: Props, frontLayerRef) => {
  const animFrameRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [gl, setGl] = useState(null);
  const [program, setProgram] = useState(null);
  const [buffers, setBuffers] = useState({
    vertexBuffer: null,
    indicesBuffer: null,
    tCoordinatesBuffer: null,
  });
  const [textures, setTextures] = useState([]);
  const [uniformLocations, setUniformLocations] = useState({
    activeImage: null,
    nextImage: null,
    index: null,
    timer: null,
    resolution: null,
    imageResolution: null,
  });

  const lastIndex = useRef(currentIndex);
  const transitionTimer = useRef(0);
  const isAnimating = useRef(false);

  useImperativeHandle(frontLayerRef, () => ({
    setUniformFloat: (name: string, value: number) => {
      if (program && gl) {
        const loc = gl.getUniformLocation(program, name);
        gl.uniform1f(loc, value);
      }
    },
  }));

  useEffect(() => {
    if (readyRender
      && (lastIndex.current < currentIndex || lastIndex.current > currentIndex)
      && gl) {
      transitionTimer.current = 0;
      isAnimating.current = true;
      gl.uniform1f(uniformLocations.index, currentIndex);
    }

    lastIndex.current = currentIndex;
  }, [currentIndex, gl, uniformLocations, readyRender]);

  const onResize = useCallback(() => {
    if (canvas && gl && program && textures && uniformLocations) {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      const { width, height } = getRatioSize(
        videoResolution[0], videoResolution[1], winWidth, winHeight,
      );

      canvas.width = width;
      canvas.height = height;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewportWidth = width;
      gl.viewportHeight = height;

      gl.uniform2fv(uniformLocations.resolution, [width, height]);
    }
  }, [canvas, gl, program, textures, uniformLocations, videoResolution]);

  const canvasRef = useCallback((el) => {
    if (el) {
      try {
        const glContext: Object = el.getContext('experimental-webgl');
        setGl(glContext);
      } catch (err) {
        throw new Error(err);
      }
      setCanvas(el);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);

  useEffect(() => {
    if (gl && !program) {
      const fragmentShaderFinal = !fragmentShader ? fragment : fragmentShader;
      const programInstance = createProgram(gl, vertex, fragmentShaderFinal);
      setProgram(programInstance);
      const [vertexBuffer, indicesBuffer, tCoordinatesBuffer] = createBuffer(gl);
      setBuffers({
        vertexBuffer,
        indicesBuffer,
        tCoordinatesBuffer,
      });

      const texture0 = initTexture(gl);
      const texture1 = initTexture(gl);

      const activeImageLocation = gl.getUniformLocation(programInstance, 'uActiveImage');
      const nextImageLocation = gl.getUniformLocation(programInstance, 'uNextImage');
      const indexLocation = gl.getUniformLocation(programInstance, 'uIndex');
      const timerLocation = gl.getUniformLocation(programInstance, 'uTransitionTimer');
      const resolutionLocation = gl.getUniformLocation(programInstance, 'uResolution');
      const imageResolutionLocation = gl.getUniformLocation(programInstance, 'uImageResolution');

      gl.uniform1i(activeImageLocation, 0);
      gl.uniform1i(nextImageLocation, 1);
      gl.uniform1f(indexLocation, 0.0);
      gl.uniform1f(timerLocation, 0.0);
      gl.uniform2fv(imageResolutionLocation, videoResolution);

      setUniformLocations({
        activeImage: activeImageLocation,
        nextImage: nextImageLocation,
        index: indexLocation,
        timer: timerLocation,
        resolution: resolutionLocation,
        imageResolution: imageResolutionLocation,
      });

      setTextures([texture0, texture1]);
    }
  }, [gl, fragmentShader, videoResolution]);

  const render = useCallback(() => {
    animFrameRef.current = window.requestAnimationFrame(render);

    let activeIndex = currentIndex;

    if (isAnimating.current) {
      const maxVal = 100;
      transitionTimer.current = Math.min(100, transitionTimer.current + 3.0);
      if (transitionTimer.current > maxVal) {
        transitionTimer.current = maxVal;
      }
      activeIndex = currentIndex === 0 ? 1 : 0;

      if (transitionTimer.current >= maxVal) {
        isAnimating.current = false;
        activeIndex = currentIndex;
        transitionTimer.current = 0;
      }
    }

    const activeVideoKey = `${activeIndex}-video`;
    const nextVideoKey = `${currentIndex}-video`;

    updateTexture(gl, textures[0], videos.current[activeVideoKey].current);
    updateTexture(gl, textures[1], videos.current[nextVideoKey].current);

    if (gl) {
      gl.uniform1f(uniformLocations.timer, transitionTimer.current);
    }
    draw(gl, buffers, program, textures);
  }, [gl, buffers, program, textures, videos, uniformLocations, currentIndex]);

  useEffect(() => {
    const videoKeys = Object.keys(videos.current);
    if (
      gl
      && buffers.vertexBuffer
      && program
      && textures.length > 0
      && videoKeys.length > 0
      && readyRender
    ) {
      animFrameRef.current = window.requestAnimationFrame(render);
    }

    return () => {
      window.cancelAnimationFrame(animFrameRef.current);
    };
  }, [gl, buffers, program, textures, render, videos, readyRender]);

  return (
    <canvas style={style} ref={canvasRef} className="canvas" id="duo-video-canvas" />
  );
});

export default FrontLayer;

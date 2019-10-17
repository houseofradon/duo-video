const initShaders = (gl, vertex, fragment) => {
  const compileShader = (shaderSource, shaderType) => {
    // Create the shader object
    const shader = gl.createShader(shaderType);
    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);
    // Compile the shader
    gl.compileShader(shader);
    // Check if it compiled
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      // eslint-disable-next-line no-throw-literal
      throw `could not compile shader: ${gl.getShaderInfoLog(shader)}`;
    }
    return shader;
  };

  const vertexShader = compileShader(vertex, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(fragment, gl.FRAGMENT_SHADER);

  return [vertexShader, fragmentShader];
};

export const createProgram = (gl, vertexShaderStr, fragmentShaderStr) => {
  // create a program.
  const program = gl.createProgram();

  const [vertexShader, fragmentShader] = initShaders(gl, vertexShaderStr, fragmentShaderStr);

  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link the program.
  gl.linkProgram(program);

  // Check if it linked.
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // eslint-disable-next-line no-throw-literal
    throw `program filed to link: ${gl.getProgramInfoLog(program)}`;
  }

  gl.useProgram(program);

  program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.textureCoordsAttribute = gl.getAttribLocation(program, 'aTextureCoord');
  gl.enableVertexAttribArray(program.textureCoordsAttribute);

  return program;
};

export const createBuffer = (gl) => {
  const planeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVertexPositionBuffer);
  const vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  planeVertexPositionBuffer.itemSize = 3;
  planeVertexPositionBuffer.numItems = 4;

  const planeVertexIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeVertexIndicesBuffer);
  const vertexIndices = [
    0, 1, 2, 0, 2, 3,
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
  planeVertexIndicesBuffer.itemSize = 1;
  planeVertexIndicesBuffer.numItems = 6;

  const planeVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVertexTextureCoordBuffer);
  const textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  planeVertexTextureCoordBuffer.itemSize = 2;
  planeVertexTextureCoordBuffer.numItems = 4;

  return [planeVertexPositionBuffer, planeVertexIndicesBuffer, planeVertexTextureCoordBuffer];
};

export const draw = (gl, buffers, program, textures) => {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  // eslint-disable-next-line no-bitwise
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
  gl.vertexAttribPointer(
    program.vertexPositionAttribute, buffers.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tCoordinatesBuffer);
  gl.vertexAttribPointer(
    program.textureCoordsAttribute, buffers.tCoordinatesBuffer.itemSize, gl.FLOAT, false, 0, 0,
  );

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indicesBuffer);

  gl.drawElements(gl.TRIANGLES, buffers.indicesBuffer.numItems, gl.UNSIGNED_SHORT, 0);
};

export const initTexture = (gl) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);// opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border, srcFormat, srcType,
    pixel);

  // Turn off mips and set  wrapping to clamp to edge so it
  // will work regardless of the dimensions of the video.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return texture;
};

export const updateTexture = (gl, texture, video) => {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
};

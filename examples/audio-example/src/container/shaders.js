export const fragmentDebug = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform vec2 resolution;
  uniform vec2 imageResolution;
  uniform sampler2D uActiveImage;
  uniform sampler2D uNextImage;
  uniform float uTransitionTimer;
  uniform float uIndex;

  varying vec2 vTextureCoord;

  void main(void) {
    
    // vec2 ratio = vec2(
    //     min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    //     min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
    //   );

    // vec2 uv = vec2(
    //     vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    //     vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    //   );

    vec2 uv = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y);

    float mask = step(0.5, uv.y);
    float invertMask = 1.0 - mask;

    vec3 activeTexture = texture2D(uActiveImage, uv).rgb;
    vec3 nextTexture = texture2D(uNextImage, uv).rgb;

    vec3 activeColor = activeTexture * invertMask;
    vec3 nextColor = nextTexture * mask;

    vec3 finalColor = activeColor + nextColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default fragmentDebug;

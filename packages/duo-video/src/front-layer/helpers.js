const getRatioSize = (srcW: number, srcH: number, maxW: number, maxH: number) => {
  let ratio = [maxW / srcW, maxH / srcH];
  ratio = Math.min(ratio[0], ratio[1]);

  return { width: Math.floor(srcW * ratio), height: Math.floor(srcH * ratio) };
};

export default getRatioSize;

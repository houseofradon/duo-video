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

export default playerReducer;

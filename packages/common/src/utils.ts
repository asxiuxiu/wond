import { v4 as uuidv4 } from 'uuid';

export const getUuid = () => {
  return uuidv4();
};

export const compareCoordinates = (coordinates1: number[], coordinates2: number[]): boolean => {
  const minLength = Math.min(coordinates1.length, coordinates2.length);
  let i = 0;
  while (i < minLength) {
    if (coordinates1[i] < coordinates2[i]) {
      return true;
    }
    if (coordinates1[i] > coordinates2[i]) {
      return false;
    }
    i++;
  }

  return coordinates1.length > coordinates2.length;
};

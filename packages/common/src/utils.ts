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

export const mergeSegments = (segments: Array<[number, number]>): Array<[number, number]> => {
  segments.sort((a, b) => a[0] - b[0]);

  const newSegments: Array<[number, number]> = [];

  for (const seg of segments) {
    if (newSegments.length === 0) {
      newSegments.push(seg);
    } else {
      const lastSeg = newSegments[newSegments.length - 1];
      if (lastSeg[1] >= seg[0]) {
        lastSeg[1] = Math.max(lastSeg[1], seg[1]);
      } else {
        newSegments.push(seg);
      }
    }
  }

  return newSegments;
};

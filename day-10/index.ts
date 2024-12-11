import { run, Vec2 } from '../utils/utils.ts';

type DataStruct = {
  heightMap: number[][],
  trailHeads: Vec2[],
};

const parseLines = (lines: string[]): DataStruct => {
  const trailHeads: Vec2[] = [];
  const heightMap = lines.map((line, row) => line.split('').map((c, col) => {
    const h = parseInt(c);

    if (h === 0) {
      trailHeads.push([row, col]);
    }

    return h;
  }));
  return {
    heightMap,
    trailHeads,
  };
};

const getReachablePeaks = (heightMap: number[][], start: Vec2): Vec2[] => {
  const wavefront = [start];
  const foundPeaks: Vec2[] = [];

  const enqueueIfEq = (v: number, r: number, c: number) => {
    const w = heightMap[r]?.[c];

    if (w === v) {
      wavefront.push([r, c]);
    }
  };

  while (wavefront.length > 0) {
    const [r, c] = wavefront.shift()!;
    const v = heightMap[r]?.[c];

    if (v == undefined) {
      continue;
    }

    if (v === 9) {
      foundPeaks.push([r, c]);
    } else {
      enqueueIfEq(v + 1, r - 1, c);
      enqueueIfEq(v + 1, r + 1, c);
      enqueueIfEq(v + 1, r, c - 1);
      enqueueIfEq(v + 1, r, c + 1);
    }
  }

  return foundPeaks;
};

const getUniqueReachablePeaks = (heightMap: number[][], start: Vec2): Vec2[] => {
  const reachablePeaks = getReachablePeaks(heightMap, start);

  const unique = reachablePeaks.reduce((acc, peak) => {
    acc.set(`${peak[0]},${peak[1]}`, peak);
    return acc;
  }, new Map());

  return [...unique.values()];
};

const part1 = (data: DataStruct): number => {
  const { heightMap, trailHeads } = data;
  
  // Score each trailhead and sum
  return trailHeads.map(start => getUniqueReachablePeaks(heightMap, start).length)
    .reduce((acc, v) => acc + v);
};

const part2 = (data: DataStruct): number => {
  const { heightMap, trailHeads } = data;
  
  // Score each trailhead and sum
  return trailHeads.map(start => getReachablePeaks(heightMap, start).length)
    .reduce((acc, v) => acc + v);
};

await run({ parseLines, part1, part2 });

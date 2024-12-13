import { run, Vec2 } from '../utils/utils.ts';

type DataStruct = {
  map: string[][],
};

const ORTHOGONAL_OFFSETS: Vec2[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const parseLines = (lines: string[]): DataStruct => {
  return {
    map: lines.map(line => line.split('')),
  };
};

const getPerimeterCost = (map: string[][], p: Vec2, id: string): number => {
  let cost = 0;
  for (const [r, c] of ORTHOGONAL_OFFSETS) {
    if (map[p[0] + r]?.[p[1] + c] !== id) {
      cost++;
    }
  }

  return cost;
};

const getBulkPerimeterCost = (map: string[][], p: Vec2, id: string): number => {
  const [r, c] = p;

  let cost = 0;
  
  // ..
  // .X
  if (map[r][c - 1] !== id && map[r - 1]?.[c] !== id) {
    cost++;
  }

  // ..
  // X.
  if (map[r][c + 1] !== id && map[r - 1]?.[c] !== id) {
    cost++;
  }

  // X.
  // ..
  if (map[r][c + 1] !== id && map[r + 1]?.[c] !== id) {
    cost++;
  }

  // .X
  // ..
  if (map[r][c - 1] !== id && map[r + 1]?.[c] !== id) {
    cost++;
  }

  // X.
  // XX
  if (map[r - 1]?.[c] === id && map[r]?.[c + 1] === id && map[r - 1]?.[c + 1] !== id) {
    cost++;
  }
  
  // XX
  // X.
  if (map[r + 1]?.[c] === id && map[r]?.[c + 1] === id && map[r + 1]?.[c + 1] !== id) {
    cost++;
  }

  // XX
  // .X
  if (map[r]?.[c - 1] === id && map[r + 1]?.[c] === id && map[r + 1]?.[c - 1] !== id) {
    cost++;
  }

  // .X
  // XX
  if (map[r]?.[c - 1] === id && map[r - 1]?.[c] === id && map[r - 1]?.[c - 1] !== id) {
    cost++;
  }

  return cost;
};

const getTotalCost = (map: string[][], perimeterCostF: (map: string[][], p: Vec2, id: string) => number): number => {
  const width = map[0].length;
  const height = map.length;

  const gardenCosts: number[] = [];

  const visited: boolean[][] = map.map(row => row.map(() => false));

  let nextStart: Vec2 = [0, 0];
  const getNext = (curr: Vec2): Vec2 => {
    let c = curr[1] + 1;
    let r = curr[0];
    if (c >= width) {
      c = 0;
      r++;
    }

    return [r, c];
  };

  while (nextStart[0] < height && nextStart[1] < width) {
    // Skip it
    if (visited[nextStart[0]][nextStart[1]]) {
      nextStart = getNext(nextStart);
      continue;
    }

    // Flood fill the garden
    const c = map[nextStart[0]][nextStart[1]];
    let perimeterCost = 0;
    let area = 0;
    const waveFront = [nextStart];
    while (waveFront.length) {
      const p = waveFront.shift()!;
      if (map[p[0]]?.[p[1]] !== c || (visited[p[0]]?.[p[1]] ?? true)) {
        continue;
      }
      perimeterCost += perimeterCostF(map, p, c);
      visited[p[0]][p[1]] = true;
      area++;

      // Push all neighbours
      for (const [r, c] of ORTHOGONAL_OFFSETS) {
        waveFront.push([p[0] + r, p[1] + c]);
      }
    }

    // Push cost
    const total = area * perimeterCost;
    gardenCosts.push(total);

    // Move on
    nextStart = getNext(nextStart);
  }

  return gardenCosts.reduce((acc, c) => acc + c);
};

const part1 = (data: DataStruct): number => {
  const { map } = data;

  return getTotalCost(map, getPerimeterCost);
};

// I: 224
const part2 = (data: DataStruct): number => {
  const { map } = data;

  return getTotalCost(map, getBulkPerimeterCost);
};

await run({ parseLines, part1, part2 });

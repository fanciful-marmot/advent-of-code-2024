import { DIRECTION, getNextPosition, isInBounds, rowColGet, run, Vec2, vec2ToString } from '../utils/utils.ts';

type DataStruct = {
  corruptions: Vec2[],
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    corruptions: lines.map(line => {
      const c = line.split(',');

      return [parseInt(c[0]), parseInt(c[1])];
    }),
  };
};

const ROWS = 71;
const COLS = 71;

enum FLAGS {
  WALL = 1 << 0,
};

const printMap = (map: number[][], visited: Set<string> = new Set()) => {
  map.forEach((row, r) => {
    console.log(row.map((cell, c) => {
      if (visited.has(`${r},${c}`)) {
        return 'O';
      } else if (cell & FLAGS.WALL) {
        return '#';
      } else {
        return '.';
      }
    }).join(''));
  })
};

const corruptMap = (map: number[][], corruptions: Vec2[], n: number) => {
  // Corrupt the first N positions
  for (let i = 0; i < n; i++) {
    const p = corruptions[i];
    map[p[1]][p[0]] = FLAGS.WALL;
  }
};

const getShortestPathLength = (map: number[][]): number => {
  // Run BFS
  const visited: Set<string> = new Set();
  const waveFront: Array<{ p: Vec2, steps: number }> = [
    {
      p: [0, 0],
      steps: 0,
    }
  ];
  while (waveFront.length) {
    const { p, steps } = waveFront.shift()!;

    if (p[0] == ROWS - 1 && p[1] == COLS - 1) {
      return steps;
    }

    if ((visited.has(vec2ToString(p)))) {
      continue;
    }

    // Push possible neighbors, sort them out later
    const neighbors = [
      DIRECTION.UP,
      DIRECTION.DOWN,
      DIRECTION.LEFT,
      DIRECTION.RIGHT,
    ]
      .map(dir => ({
        p: getNextPosition(p, dir),
        steps: steps + 1,
      }))
      .filter(({ p }) => (
        isInBounds(p, [ROWS, COLS]) &&
        rowColGet(map, p) !== FLAGS.WALL &&
        !(visited.has(vec2ToString(p)))
      ));

    visited.add(vec2ToString(p));
    waveFront.push(...neighbors);
    waveFront.sort((a, b) => a.steps - b.steps);
  }

  return -1;
}

const part1 = (data: DataStruct): number => {
  const map: number[][] = new Array(ROWS).fill(0).map(_ => new Array(COLS).fill(0));

  corruptMap(map, data.corruptions, 1024);

  return getShortestPathLength(map);
};

const part2 = (data: DataStruct): string => {
  const { corruptions } = data;
  // Binary search the list of corruptions to find the first one where
  // there's no path

  const bounds: Vec2 = [0, corruptions.length - 1];

  while (bounds[0] < bounds[1]) {
    const map: number[][] = new Array(ROWS).fill(0).map(_ => new Array(COLS).fill(0));

    const n = Math.floor((bounds[1] - bounds[0]) / 2) + bounds[0];

    corruptMap(map, corruptions, n);

    const steps = getShortestPathLength(map);

    if (steps === -1) {
      // Path is blocked, shift the upper bound
      bounds[1] = n - 1;
    } else {
      // Path wasn't blocked, shift the lower bound
      bounds[0] = n + 1;
    }
  }

  return `${corruptions[bounds[0]]}`;
};

await run({ parseLines, part1, part2 });

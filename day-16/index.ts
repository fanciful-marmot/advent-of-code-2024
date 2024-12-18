import { DIRECTION, getNextPosition, rowColGet, run, v2Eq, Vec2 } from '../utils/utils.ts';

enum FLAGS {
  WALL = 1 << 0,
};

type DataStruct = {
  map: number[][],
  start: Vec2,
  end: Vec2,
};

const parseLines = (lines: string[]): DataStruct => {
  let start: Vec2 = [0, 0];
  let end: Vec2 = [0, 0];

  const map = lines.map((line, row) => (
    line.split('').map((c, col) => {
      switch (c) {
        case '#':
          return FLAGS.WALL;
        case 'S':
          start = [row, col];
          break;
        case 'E':
          end = [row, col];
          break;
      }

      return 0;
    })
  ));

  return {
    map,
    start,
    end,
  };
};

const printMap = (map: number[][], start: Vec2, end: Vec2, visited: Set<string> = new Set()) => {
  console.log(map.map((line, row) => line.map((c, col) => {
    const key = `${row},${col}`;
    if (v2Eq([row, col], start)) {
      return 'S';
    }
    if (v2Eq([row, col], end)) {
      return 'E';
    }
    if (visited.has(key)) {
      return 'O';
    }
    if (c === FLAGS.WALL) {
      return '#';
    }
    return '.';
  }).join('')).join('\n'));
};

const numTurns = (dir: DIRECTION, target: DIRECTION): number => {
  const ccw = [DIRECTION.UP, DIRECTION.LEFT, DIRECTION.DOWN, DIRECTION.RIGHT];

  const ccwTurns = Math.abs(ccw.indexOf(target) - ccw.indexOf(dir));

  return ccwTurns === 3 ? 1 : ccwTurns;
};

const sortByCost = (a: { cost: number }, b: { cost: number }): number => a.cost - b.cost;

// Returns the lowest cost to get to each cell
const getLowestCosts = (map: number[][], s: Vec2, dir: DIRECTION): number[][] => {
  type Node = {p: Vec2, cost: number, d: DIRECTION };
  const waveFront: Node[] = [{ p: s, cost: 0, d: dir }];

  const costs = map.map(row => new Array(row.length).fill(Infinity));
  const visited: Map<string, number> = new Map();

  while (waveFront.length) {
    const { p, cost, d } = waveFront.shift()!;

    // We've already been here using this direction
    const key = `${p[0]},${p[1]}`;
    if ((visited.get(key) ?? 0) & d) {
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
        d: dir,
        p: getNextPosition(p, dir),
        cost: cost + 1000 * numTurns(d, dir) + 1,
      }))
      .filter(({ p, d }) => rowColGet(map, p) !== FLAGS.WALL && !((visited.get(`${p[0]},${p[1]}`) ?? 0) & d));
    
    waveFront.push(...neighbors);
    waveFront.sort(sortByCost);
    visited.set(key, (visited.get(key) ?? 0) | d);
    if (rowColGet(costs, p) > cost) {
      costs[p[0]][p[1]] = cost;
    }
  }

  return costs;
}

const part1 = (data: DataStruct): number => {
  const costs = getLowestCosts(data.map, data.start, DIRECTION.RIGHT);
  return rowColGet(costs, data.end);
};

const part2 = (data: DataStruct): number => {
  const costs = getLowestCosts(data.map, data.start, DIRECTION.RIGHT);

  // Trace backwards from end with decreasing costs
  const waveFront: { p: Vec2, maxCost: number, revDir: DIRECTION | null }[] = [
    // Really hope there's only one entrance to the exit
    { p: data.end, maxCost: rowColGet(costs, data.end), revDir: null }
  ];
  const visited: Set<string> = new Set();

  while (waveFront.length) {
    const { p, maxCost, revDir } = waveFront.shift()!;

    // Push possible neighbors
    const neighbors = [
      DIRECTION.UP,
      DIRECTION.DOWN,
      DIRECTION.LEFT,
      DIRECTION.RIGHT,
    ]
      .map(dir => ({
        p: getNextPosition(p, dir),
        maxCost: revDir == null ? maxCost - 1 : maxCost - 1000 * numTurns(revDir, dir) - 1,
        revDir: dir,
      }))
      .filter(node => rowColGet(costs, node.p) <= node.maxCost);

    waveFront.push(...neighbors);
    visited.add(`${p[0]},${p[1]}`);
  }
  
  return visited.size;
};

await run({ parseLines, part1, part2 });

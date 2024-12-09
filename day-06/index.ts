import { run } from '../utils/utils.ts';

const FLAGS = {
  VISITED: 1 << 0,
  CRATE: 1 << 1,
  MAKE_LOOP: 1 << 2,
  // The direction we were travelling when visiting this cell
  UP: 1 << 3,
  DOWN: 1 << 4,
  LEFT: 1 << 5,
  RIGHT: 1 << 6,
};

enum DIRECTION {
  UP = 1 << 3,
  DOWN = 1 << 4,
  LEFT = 1 << 5,
  RIGHT = 1 << 6,
};

type DataStruct = {
  map: number[][],
  guardPosition: [number, number],
  facing: DIRECTION,
  size: [number, number],
};

const parseLines = (lines: string[]): DataStruct => {
  let guardPosition: [number, number] = [0, 0];
  return {
    map: lines.map((line, row) => line.split('').map((c, col) => {
      switch (c) {
        case '^':
          guardPosition = [row, col];
          return FLAGS.VISITED | FLAGS.UP;
        case '#':
          return FLAGS.CRATE;
        default:
          return 0
      }
    })),
    guardPosition,
    facing: DIRECTION.UP,
    size: [lines.length, lines[0].length],
  };
};

const printMap = (map: number[][]) => {
  for (const row of map) {
    console.log(row.map(cell => {
      if (cell & FLAGS.MAKE_LOOP) {
        return 'O';
      } else if (cell & FLAGS.VISITED) {
        return 'X';
      } else if (cell & FLAGS.CRATE) {
        return '#';
      } else {
        return '.';
      }
    }).join(''));
  }
};

const turnRight = (d: DIRECTION): DIRECTION => {
  switch (d) {
    case DIRECTION.UP: return DIRECTION.RIGHT;
    case DIRECTION.DOWN: return DIRECTION.LEFT;
    case DIRECTION.LEFT: return DIRECTION.UP;
    case DIRECTION.RIGHT: return DIRECTION.DOWN;
  }
};

const getNextPosition = (p: [number, number], facing: DIRECTION): [number, number] => {
  const nextPosition: [number, number] = [p[0], p[1]];
  switch (facing) {
    case DIRECTION.UP:
      nextPosition[0] -= 1;
      break;
    case DIRECTION.DOWN:
      nextPosition[0] += 1;
      break;
    case DIRECTION.LEFT:
      nextPosition[1] -= 1;
      break;
    case DIRECTION.RIGHT:
      nextPosition[1] += 1;
      break;
  }
  return nextPosition;
};

const isInBounds = (size: [number, number], p: [number, number]): boolean => {
  return !(p[0] < 0 || p[0] >= size[0] || p[1] < 0 || p[1] >= size[1]);
};

const simulate = (map: number[][], p: [number, number], facing: DIRECTION, size: [number, number]): { map: number[][], looped: boolean } => {
  // Copy the input structures, we're going to modify them
  map = map.map(row => [...row]);
  p = [p[0], p[1]];

  let looped = false;
  const tick = (): boolean => {
    const nextPosition = getNextPosition(p, facing);

    // Did we exit?
    if (!isInBounds(size, nextPosition)) {
      return true; // done
    }

    const cell = map[nextPosition[0]][nextPosition[1]];

    // Did we connect?
    if (cell & facing) {
      looped = true;
      return true;
    } else if (cell & FLAGS.CRATE) { // Is there a crate in front of us?
      facing = turnRight(facing);
    } else {
      // Step forward
      p = nextPosition;
      // Mark location as visited
      map[p[0]][p[1]] |= FLAGS.VISITED | facing;
    }

    return false;
  };

  while (!tick()) {}
  
  return {
    map,
    looped,
  }
};

const willLoop = (newCrate: [number, number], map: number[][], p: [number, number], facing: DIRECTION, size: [number, number]): boolean => {
  // Copy the input structures, we're going to modify them
  map = map.map(row => [...row]);
  p = [p[0], p[1]];

  map[newCrate[0]][newCrate[1]] |= FLAGS.CRATE;

  return simulate(map, p, facing, size).looped;
};

const part1 = (data: DataStruct): number => {
  const { map } = simulate(data.map, data.guardPosition, data.facing, data.size);
  
  // Count distinct visited locations
  return map.reduce((acc, row) => {
    return acc + row.reduce((acc2, cell) => {
      return acc2 + (cell & FLAGS.VISITED);
    }, 0);
  }, 0);
};

const part2 = (data: DataStruct): number => {
  // Copy the input structures, we're going to modify them
  const map = data.map.map(row => [...row]);
  let guardPosition: [number, number] = [data.guardPosition[0], data.guardPosition[1]];
  let facing = data.facing;
  const { size } = data;

  // Can't put an obstacle here
  const guardStart: [number, number] = [data.guardPosition[0], data.guardPosition[1]];

  // Can't easily use the simulate function. Have to modify it here
  const tick = (): boolean => {
    const nextPosition = getNextPosition(guardPosition, facing);

    // Did we exit?
    if (!isInBounds(size, nextPosition)) {
      return true; // done
    }

    // Move as usual
    // Is there a crate in front of us?
    if (map[nextPosition[0]][nextPosition[1]] & FLAGS.CRATE) {
      facing = turnRight(facing);
    } else {
      // If we'd turned right instead, would that make a loop?
      // Note: Can't place at guard location, can't block our old path since we may not end up here again
      if (
        !(nextPosition[0] === guardStart[0] && nextPosition[1] === guardStart[1]) && // Can't place on guard
        !((map[nextPosition[0]][nextPosition[1]]) & FLAGS.VISITED) && // Don't place if we've been here before
        willLoop(nextPosition, map, guardPosition, turnRight(facing), size)
      ) {
        // Yes, we'd loop
        map[nextPosition[0]][nextPosition[1]] |= FLAGS.MAKE_LOOP;
      }

      // Step forward
      guardPosition = nextPosition;
      // Mark location as visited
      map[guardPosition[0]][guardPosition[1]] |= FLAGS.VISITED | facing;
    }

    return false;
  };

  while (!tick()) {}
  
  // Count distinct visited locations
  return map.reduce((acc, row) => {
    return acc + row.reduce((acc2, cell) => {
      return acc2 + (cell & FLAGS.MAKE_LOOP) / 4;
    }, 0);
  }, 0);
};

// Part 1: 4964
// Part 2: 1740
await run({ parseLines, part1, part2 });

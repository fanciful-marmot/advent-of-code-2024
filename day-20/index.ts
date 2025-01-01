import { rowColGet } from '../utils/utils.ts';
import { DIRECTION, getNextPosition, isInBounds, run, Vec2 } from '../utils/utils.ts';

type DataStruct = {
  map: number[][],
  start: Vec2,
  end: Vec2,
};

enum FLAGS {
  WALL = 1 << 0,
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

const backfillDistances = (map: number[][], end: Vec2): number[][] => {
  const bounds: Vec2 = [map.length, map[0].length];
  // Known shortest times to finish
  const shortestTimes = map.map(row => new Array(row.length).fill(-1));
  // Back fill from end to start
  {
    const waveFront: { p: Vec2, t: number }[] = [{ p: end, t: 0 }];
    while (waveFront.length) {
      const { p, t } = waveFront.shift()!;

      if (rowColGet(shortestTimes, p) != -1) {
        continue;
      }

      const next = [
        DIRECTION.DOWN,
        DIRECTION.RIGHT,
        DIRECTION.LEFT,
        DIRECTION.UP,
      ]
        .map(d => ({
          p: getNextPosition(p, d),
          t: t + 1,
        }))
        .filter(({ p }) => isInBounds(p, bounds) && rowColGet(map, p) !== FLAGS.WALL);
      
      shortestTimes[p[0]][p[1]] = t;

      waveFront.push(...next);
    }
  }

  return shortestTimes;
};

const solve = (map: number[][], shortestTimes: number[][], cheatDuration: number): { savings: number, cheatStart: Vec2, cheatEnd: Vec2 }[] => {
  const bounds: Vec2 = [map.length, map[0].length];

  const cheats = [];
  // Check all starting positions, check all cheats within duration manhattan distance
  for (let r = 0; r < bounds[0]; r++) {
    for (let c = 0; c < bounds[1]; c++) {
      const start: Vec2 = [r, c];
      
      // Ensure we're a valid start
      const startTime = rowColGet(shortestTimes, start);
      if (startTime <= 0) {
        continue;
      }

      // Find potential ends
      for (let rdelta = -cheatDuration; rdelta <= cheatDuration; rdelta++) {
        for (let cdelta = -cheatDuration; cdelta <= cheatDuration; cdelta++) {
          const end: Vec2 = [r + rdelta, c + cdelta];
          const manhattan = Math.abs(rdelta) + Math.abs(cdelta);
          if (
            // Check manhattan distance
            manhattan > cheatDuration ||
            // Ignore 0 length paths
            manhattan === 0 ||
            // Ignore out of bounds
            !isInBounds(end, bounds) ||
            // Check that we're not in a wall
            rowColGet(map, end) === FLAGS.WALL
          ) {
            continue;
          }

          const endTime = rowColGet(shortestTimes, end);
          const cheatSavings = (startTime - endTime) - manhattan;
          if (cheatSavings > 0) {
            cheats.push({ savings: cheatSavings, cheatStart: start, cheatEnd: end });
          }
        }
      }
    }
  }

  return cheats;
};

const part1 = (data: DataStruct): number => {
  const savingsCap = 100;

  const { map, end } = data;
  const shortestTimes = backfillDistances(map, end);
  const cheats = solve(map, shortestTimes, 2);

  return cheats.filter(({ savings }) => savings >= savingsCap).length;
};

const part2 = (data: DataStruct): number => {
  const savingsCap = 100;

  const { map, end } = data;
  const shortestTimes = backfillDistances(map, end);

  const cheats = solve(map, shortestTimes, 20);

  return cheats.filter(({ savings }) => savings >= savingsCap).length;
};

await run({ parseLines, part1, part2 });

import { run } from '../utils/utils.ts';

type DataStruct = {
  stones: number[]
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    stones: lines[0].split(' ').map(c => parseInt(c)),
  };
};

const blink = (stones: number[]): number[] => {
  const newStones: number[] = [];

  for (let i = 0; i < stones.length; i++) {
    const stone = stones[i];
    const numDigits = Math.floor(Math.log10(stone)) + 1;

    if (stone === 0) {
      newStones.push(1);
    } else if (numDigits % 2 === 0) {
      const left = Math.floor(stone / (10 ** (numDigits / 2)));
      const right = stone % (10 ** (numDigits / 2));
      newStones.push(left, right);
    } else {
      newStones.push(stone * 2024);
    }
  }

  return newStones;
};

const part1 = (data: DataStruct): number => {
  let { stones } = data;

  for (let i = 0; i < 25; i++) {
    stones = blink(stones);
  }

  return stones.length;
};

const part2 = (data: DataStruct): number => {
  const { stones } = data;

  // stone => (blinks => count)
  const cache = new Map<number, Map<number, number>>();

  const countStonesAfterBlinks = (stone: number, blinks: number): number => {
    // Check cache
    {
      const stoneCache = cache.get(stone);
      if (stoneCache?.has(blinks)) {
        return stoneCache.get(blinks)!;
      }
    }

    let count;
    const nextLevel = blink([stone]);
    if (blinks === 1) {
      // Base case
      count = nextLevel.length;
    } else {
      // Recurse
      count = nextLevel.reduce((acc, s) => {
        return acc + countStonesAfterBlinks(s, blinks - 1);
      }, 0);
    }

    // Insert into cache
    const stoneCache = cache.get(stone) ?? new Map();
    stoneCache.set(blinks, count);
    cache.set(stone, stoneCache);

    return count;
  };

  const total = stones.reduce((acc, s) => {
    return acc + countStonesAfterBlinks(s, 75);
  }, 0);

  return total;
};

await run({ parseLines, part1, part2 });

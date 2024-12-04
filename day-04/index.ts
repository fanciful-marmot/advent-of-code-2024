import { run } from '../utils/utils.ts';

type DataStruct = {
  grid: string[][]
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    grid: lines.map(line => line.split('')),
  };
};

const XMAS = 'XMAS'.split('');
const countXMAS = (grid: DataStruct['grid'], row: number, col: number): number => {
  let count = 0;

  // Forward
  count += XMAS.every((char, i) => grid[row][col + i] === char) ? 1 : 0;
  // Backward
  count += XMAS.every((char, i) => grid[row][col - i] === char) ? 1 : 0;
  // Up
  count += XMAS.every((char, i) => grid[row - i]?.[col] === char) ? 1 : 0;
  // Down
  count += XMAS.every((char, i) => grid[row + i]?.[col] === char) ? 1 : 0;
  // UR
  count += XMAS.every((char, i) => grid[row - i]?.[col + i] === char) ? 1 : 0;
  // DR
  count += XMAS.every((char, i) => grid[row + i]?.[col + i] === char) ? 1 : 0;
  // DL
  count += XMAS.every((char, i) => grid[row + i]?.[col - i] === char) ? 1 : 0;
  // UL
  count += XMAS.every((char, i) => grid[row - i]?.[col - i] === char) ? 1 : 0;

  return count;
};

const countMAS = (grid: DataStruct['grid'], row: number, col: number): number => {
  if (grid[row][col] !== 'A') {
    return 0;
  }

  const TL = grid[row - 1]?.[col - 1] ?? '.';
  const TR = grid[row - 1]?.[col + 1] ?? '.';
  const BL = grid[row + 1]?.[col - 1] ?? '.';
  const BR = grid[row + 1]?.[col + 1] ?? '.';

  if (
    ((TL === 'M' && BR == 'S') || (TL == 'S' && BR == 'M')) &&
    ((TR === 'M' && BL == 'S') || (TR == 'S' && BL == 'M'))
  ) {
    return 1;
  }

  return 0;
};

const part1 = (data: DataStruct): number => {
  const { grid } = data;
  let count = 0;
  const columns = grid[0].length;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < columns; c++) {
      count += countXMAS(grid, r, c);
    }
  }

  return count;
};

const part2 = (data: DataStruct): number => {
  const { grid } = data;
  let count = 0;
  const columns = grid[0].length;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < columns; c++) {
      count += countMAS(grid, r, c);
    }
  }

  return count;
};

await run({ parseLines, part1, part2 });

import { run } from '../utils/utils.ts';

type Report = {
  levels: number[];
};

type DataStruct = {
  reports: Report[],
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    reports: lines.map(line => ({
      levels: line.split(' ').map(v => parseInt(v)),
    }))
  };
};

const isSafe = (levels: number[]): boolean => {
  let safe = true;
  const increasing = levels[0] < levels[1];
  levels.reduce((prev, curr) => {
    if (!safe) return curr;

    if (Math.abs(prev - curr) < 1 || Math.abs(prev - curr) > 3) {
      safe = false;
    } else if (increasing && prev > curr) {
      safe = false;
    } else if (!increasing && prev < curr) {
      safe = false;
    }

    return curr;
  });

  return safe;
};

const part1 = (data: DataStruct): number => {
  const { reports } = data;

  return reports.reduce((acc, report) => isSafe(report.levels) ? acc + 1 : acc, 0);
};

const part2 = (data: DataStruct): number => {
  const isRobustlySafe = (levels: number[]): boolean => {
    if (isSafe(levels)) {
      return true;
    }

    for (let i = 0; i < levels.length; i++) {
      const newLevels = [...levels];
      newLevels.splice(i, 1);
      if (isSafe(newLevels)) {
        return true;
      }
    }

    return false;
  };
  
  const { reports } = data;

  return reports.reduce((acc, report) => isRobustlySafe(report.levels) ? acc + 1 : acc, 0);
};

await run({ parseLines, part1, part2 });

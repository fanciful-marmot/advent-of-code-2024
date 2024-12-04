import { run, numericalSort } from '../utils/utils.ts';

type DataStruct = {
  leftList: number[],
  rightList: number[],
};

const parseLines = (lines: string[]): DataStruct => {
  const leftList: number[] = [];
  const rightList: number[] = [];

  lines.forEach(line => {
    const ids = line.split('   ');
    leftList.push(parseInt(ids[0]));
    rightList.push(parseInt(ids[1]));
  });

  numericalSort(leftList);
  numericalSort(rightList);

  return { leftList, rightList };
};

const part1 = (data: DataStruct): number => {
  return data.leftList.reduce((sum, v, i) => sum + Math.abs(v - data.rightList[i]), 0);
};

const part2 = (data: DataStruct): number => {
  const { leftList, rightList } = data;

  // Be dumb. Doesn't take advantage of sorting
  let similarity: number = 0;

  for (const v of leftList) {
    similarity += v * rightList.reduce((acc, vR) => v === vR ? acc + 1 : acc, 0);
  }

  return similarity;
};

await run({ parseLines, part1, part2 });

import { run } from '../utils/utils.ts';

type DataStruct = {
  chars: string[],
};

const parseLines = (lines: string[]): DataStruct => {
  return { 
    chars: lines.reduce((acc: string[], line) => acc.concat(line.split('')), []),
  };
};

const part1 = (data: DataStruct): number => {
  const { chars } = data;

  const line = chars.join('');

  const regex = /mul\((?<X>\d{1,3}),(?<Y>\d{1,3})\)/g;

  let result = regex.exec(line);
  let total = 0;
  while (result) {
    const X = parseInt(result.groups!['X']);
    const Y = parseInt(result.groups!['Y']);
    
    total += X * Y;

    result = regex.exec(line);
  }

  return total;
};

const part2 = (data: DataStruct): number => {
  const { chars } = data;

  const line = chars.join('');

  const regex = /(?:do\(\)|don't\(\)|mul\((?<X>\d{1,3}),(?<Y>\d{1,3})\))/g;
  
  let result = regex.exec(line);
  let enabled = true;
  let total = 0;
  while (result) {
    if (result[0] === 'don\'t()') {
      enabled = false;
    } else if (result[0] === 'do()') {
      enabled = true;
    } else if (enabled) {
      const X = parseInt(result.groups!['X']);
      const Y = parseInt(result.groups!['Y']);
      
      total += X * Y;
    }

    result = regex.exec(line);
  }

  return total;
};

await run({ parseLines, part1, part2 });

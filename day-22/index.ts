import { run } from '../utils/utils.ts';

type DataStruct = {
  secretNumbers: number[],
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    secretNumbers: lines.map(line => parseInt(line)),
  };
};

const mix = (n: bigint, secret: bigint): bigint => n ^ secret;

const prune = (n: bigint): bigint => n % 16777216n;

const next = (s: bigint): bigint => {
  let n = mix(s, s * 64n);
  n = prune(n);
  
  n = mix(n, BigInt(Math.floor(Number(n) / 32)));
  n = prune(n);

  n = mix(n, n * 2048n);
  n = prune(n);

  return n;
};

const getNextN = (s: bigint, n: bigint): bigint => {
  for (let i = 0; i < n; i++) {
    s = next(s);
    // console.log(s);
  }
  return s;
};

const part1 = (data: DataStruct): bigint => {
  return data.secretNumbers.reduce((acc, s) => {
    return acc + getNextN(BigInt(s), 2000n);
  }, 0n);
};

const part2 = (data: DataStruct): number => {
  return 2;
};

await run({ parseLines, part1, part2 });

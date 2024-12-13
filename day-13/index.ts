import { isInBounds, run, Vec2, isInt } from '../utils/utils.ts';

type Machine = {
  A: Vec2,
  B: Vec2,
  P: Vec2,
}

type DataStruct = {
  machines: Machine[],
};

const parseLines = (lines: string[]): DataStruct => {
  const buttonRegex = /X\+(?<X>\d+), Y\+(?<Y>\d+)/;
  const prizeRegex = /X\=(?<X>\d+), Y\=(?<Y>\d+)/;

  const machines: Machine[] = [];

  for (let i = 0; i < lines.length; i += 4) {
    const aLine = lines[i];
    const bLine = lines[i + 1];
    const pLine = lines[i + 2];

    const aMatch = aLine.match(buttonRegex);
    const bMatch = bLine.match(buttonRegex);
    const pMatch = pLine.match(prizeRegex);

    machines.push({
      A: [parseInt(aMatch!.groups!['X']), parseInt(aMatch!.groups!['Y'])],
      B: [parseInt(bMatch!.groups!['X']), parseInt(bMatch!.groups!['Y'])],
      P: [parseInt(pMatch!.groups!['X']), parseInt(pMatch!.groups!['Y'])],
    })
  }
  return {
    machines,
  };
};

const cost = (s: Vec2): number => s[0] * 3 + s[1];

const solve = ({A, B, P}: Machine): Vec2 | null => {
  // TODO: handle overlapping
  const b = (A[0] * P[1] - A[1] * P[0]) / (A[0] * B[1] - A[1] * B[0]);
  const a1 = (P[0] - b * B[0]) / A[0];
  const a2 = (P[1] - b * B[1]) / A[1];

  if (a1 !== a2) {
    return null;
  }

  if (!isInt(a1) || !isInt(b)) {
    return null;
  }

  if (!isInBounds([a1 * A[0] + b * B[0], a1 * A[1] + b * B[1]], [P[0] + 1, P[1] + 1])) {
    return null;
  }

  return [a1, b];
};

const part1 = (data: DataStruct): number => {
  const { machines } = data;

  return machines.map(m => solve(m))
    .filter(s => !!s)
    .reduce((acc, s) => acc + cost(s!), 0);
};

const part2 = (data: DataStruct): number => {
  const { machines } = data;

  return machines.map(m => solve({
    ...m,
    P: [m.P[0] + 10000000000000, m.P[1] + 10000000000000],
  }))
    .filter(s => !!s)
    .reduce((acc, s) => acc + cost(s!), 0);
};

await run({ parseLines, part1, part2 });

import { run } from '../utils/utils.ts';

enum Operator {
  ADD,
  MUL,
  CAT,
};

type Calibration = {
  value: bigint,
  equation: bigint[],
};

type DataStruct = {
  calibrations: Calibration[],
};

const parseLines = (lines: string[]): DataStruct => {
  const calibrations = lines.map(line => {
    const parts = line.split(':');
    const value = BigInt(parts[0]);
    const equation = parts[1].trim().split(' ')
      .map(chunk => BigInt(chunk));

    return { value, equation };
  });
  return { calibrations };
};

const evaluate = (eq: bigint[], ops: Operator[]): bigint => {
  let value = eq[0];

  for (let i = 1; i < eq.length; i++) {
    switch (ops[i - 1]) {
      case Operator.ADD:
        value += BigInt(eq[i]);
        break;
      case Operator.MUL:
        value *= BigInt(eq[i]);
        break;
      case Operator.CAT:
        value = BigInt(`${value}${eq[i]}`);
        break;
    }
  }

  return value;
};

const bitsToAddMul = (n: number, len: number): Operator[] => {
  const ops: Operator[] = new Array(len);
  for (let i = 0; i < len; i++) {
    const op = n & 1 ? Operator.MUL : Operator.ADD;
    n = n >> 1; // Strip the bit off
    ops[i] = op;
  }

  return ops;
};

const ternaryToAddMulCat = (n: string, len: number): Operator[] => {
  const ops: Operator[] = [];
  for (let i = 0; i < len; i++) {
    let op;
    switch (n[i - (len - n.length)]) {
      case '1':
        op = Operator.MUL;
        break;
      case '2':
        op = Operator.CAT;
        break;
      default:
        op = Operator.ADD;
        break;
    }
    ops.push(op);
  }

  return ops;
}

const isValidAddMul = (c: Calibration): boolean => {
  const numOps = c.equation.length - 1;
  const maxOpValue = 2 ** numOps - 1;

  for (let opsBitString = 0; opsBitString <= maxOpValue; opsBitString++) {
    if (BigInt(c.value) === evaluate(c.equation, bitsToAddMul(opsBitString, numOps))) {
      return true;
    }
  }

  return false;
};

const isValidAddMulCat = (c: Calibration): boolean => {
  const numOps = c.equation.length - 1;
  const maxOpValue = 3 ** numOps - 1;
  const value = c.value;

  for (let opsBitString = 0; opsBitString <= maxOpValue; opsBitString++) {
    if (value === evaluate(c.equation, ternaryToAddMulCat(Number(opsBitString).toString(3), numOps))) {
      return true;
    }
  }

  return false;
};

const part1 = (data: DataStruct): bigint => {
  return data.calibrations
    .filter(isValidAddMul)
    .reduce((acc, c) => acc + c.value, 0n);
};

// Too low: 498861199828415
const part2 = (data: DataStruct): bigint => {
  return data.calibrations
    .filter(c => isValidAddMulCat(c))
    .reduce((acc, c) => acc + c.value, 0n);
};

await run({ parseLines, part1, part2 });

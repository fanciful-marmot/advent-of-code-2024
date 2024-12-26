import { run } from '../utils/utils.ts';

enum OpCode {
  ADV = 0,
  BXL,
  BST,
  JNZ,
  BXC,
  OUT,
  BDV,
  CDV,
};

type Computer = {
  A: number,
  B: number,
  C: number,

  ip: number,
  program: number[],
  output: number[],
};

type DataStruct = {
  computer: Computer,
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    computer: {
      A: parseInt(lines[0].split(':')[1].trim()),
      B: parseInt(lines[1].split(':')[1].trim()),
      C: parseInt(lines[2].split(':')[1].trim()),
      ip: 0,
      program: lines[4].split(':')[1].trim().split(',').map(c => parseInt(c)),
      output: [],
    },
  };
};

const tick = (c: Computer): Computer => {
  let { A, B, C, ip, program, output } = c;
  const op = program[ip] as OpCode;
  const arg = program[ip + 1];

  const combo = (x: number) => {
    switch (x) {
      case 4: return A;
      case 5: return B;
      case 6: return C;
      case 7: throw new Error('Invalid combo operand 7');
      default: return x;
    }
  };

  ip += 2;

  switch (op) {
    case OpCode.ADV:
      A = Math.floor(A / 2 ** combo(arg));
      break;
    case OpCode.BXL:
      B ^= arg;
      break;
    case OpCode.BST:
      B = combo(arg) % 8;
      break;
    case OpCode.JNZ:
      if (A !== 0) {
        ip = arg;
      }
      break;
    case OpCode.BXC:
      B = B ^ C;
      break;
    case OpCode.OUT:
      output = [...output, Math.abs(combo(arg) % 8)];
      break;
    case OpCode.BDV:
      B = Math.floor(A / 2 ** combo(arg));
      break;
    case OpCode.CDV:
      C = Math.floor(A / 2 ** combo(arg));
      break;
  }

  return {
    A, B, C, ip, program, output
  }
};

const getOutput = (c: Computer): number[] => {
  let computer = c;
  while (computer.ip < computer.program.length) {
    computer = tick(computer);
  }

  return computer.output;
};

// Ops
// 2 4 => B = A % 8
// 1 2 => B ^= 2
// 7 5 => C = floor(A / 2 ** B)
// 4 5 => B = B ^ C
// 0 3 => A = floor(A / 2 ** 3)
// 1 7 => B ^= 7
// 5 5 => OUT(B)
// 3 0 => A !== 0 RESTART
// One run
// B <-- bottom 3 bits of A
// B ^= 010
// C = A >> B
// B ^= C
// A = A >> 3
// B ^= 7
// OUT (B)
// This is highly specific to the input
// The target program is 16 instructions long
// Each run shifts A 3 bits to the right and reruns
// until A is 0
// So A must be at most 3 * 16 = 48 bits long
const reconstruct = () => {
  // Let's start by finding all ways of producing the last 2 outputs
  const target = '2,4,1,2,7,5,4,5,0,3,1,7,5,5,3,0';
  const program = target.split(',').map(c => parseInt(c));
  // const targetOutCount = (target.length + 1) / 2;

  let candidates: Array<{
    bits: number,
    outputCount: number,
    output: string,
  }> = [
    {
      bits: 5,
      outputCount: 1,
      output: '0',
    }
  ];

  for (let i = 0; i < 15; i++) {
    const newCandidates = [];
    for (const candidate of candidates) {
      // const rootNumber = candidate.bits << 3;
      const rootNumber = candidate.bits * 8; // (64-bit leftshift by 3)
      // Try all 8 possible next numbers
      for (let next = 0; next < 8; next++) {
        // const bits = rootNumber | next;
        const bits = rootNumber + next; // (64-bit)
        const out = getOutput({
          A: bits,
          B: 0,
          C: 0,
          ip: 0,
          program,
          output: [],
        }).join(',');

        if (target.endsWith(out)) {
          newCandidates.push({
            bits,
            outputCount: (out.length + 1) / 2,
            output: out,
          });
        }
      }
    }

    candidates = newCandidates;
  }

  return candidates.sort((a, b) => a.bits - b.bits).map(c => c.bits)[0];
};

const part1 = (data: DataStruct): string => {
  const output = getOutput(data.computer);
  return output.join(',');
};

const part2 = (_data: DataStruct): number => {
  return reconstruct();
};

await run({ parseLines, part1, part2 });

import { run, v2Eq, Vec2 } from '../utils/utils.ts';

type DataStruct = {
  codes: string[],
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    codes: lines,
  };
};

const getNumericMoveSequence = (start: Vec2, end: Vec2, vertFirst: boolean = false): string[] => {
  if (v2Eq(start, end)) {
    return [];
  }
  // 789
  // 456
  // 123
  // X0A
  if (start[0] === 3 && end[0] === 3) {
    // We're in the last row, just move left/right
    return [
      start[1] > end[1] ? '<' : '>'
    ];
  } else if (start[0] === 3 && end[1] === 0) {
    // We're in the end row, targeting first column. Move up, target as usual
    return [
      '^',
      ...getNumericMoveSequence([start[0] - 1, start[1]], end, true),
    ]
  } else if (end[0] === 3 && start[1] === 0) {
    // We're targeting the end row, starting in first col. 
    // Move just above the target, then down
    return [
      ...getNumericMoveSequence(start, [end[0] - 1, end[1]], false),
      'v',
    ]
  } else {
    // Get manhattan sequence
    const vert = end[0] - start[0];
    const hor = end[1] - start[1];
    // How much left/right
    const lr = new Array(Math.abs(hor)).fill(hor < 0 ? '<' : '>');
    // How much up/down
    const ud = new Array(Math.abs(vert)).fill(vert < 0 ? '^' : 'v')
    
    return vertFirst ? [...ud, ...lr] : [...lr, ...ud];
  }
};

const numericToCoordinate = (c: string): Vec2 => {
  if (c === 'A') {
    return [3, 2];
  }
  const num = parseInt(c);
  if (num === 0) {
    return [3, 1];
  } else {
    return [
      2 - Math.floor((num - 1) / 3),
      (num - 1) % 3,
    ];
  }
};

const getDirMoveSequence = (start: Vec2, end: Vec2, vertFirst: boolean = false): string[] => {
  if (v2Eq(start, end)) {
    return [];
  }
  // X^A
  // <v>
  if (start[0] === 1 && start[1] === 0 && end[0] === 0) {
    // We're bottom left, targeting upper row
    return ['>', ...getDirMoveSequence([1, 1], end, false)];
  } else if (start[0] === 0 && end[0] === 1 && end[1] === 0) {
    // We're targeting bottom left from top row
    return [...getDirMoveSequence(start, [1, 1], true), '<'];
  } else {
    // Get manhattan sequence
    const vert = end[0] - start[0];
    const hor = end[1] - start[1];
    // How much left/right
    const lr = new Array(Math.abs(hor)).fill(hor < 0 ? '<' : '>');
    // How much up/down
    const ud = new Array(Math.abs(vert)).fill(vert < 0 ? '^' : 'v')
    
    return vertFirst ? [...ud, ...lr] : [...lr, ...ud];
  }
};

const dirToCoordinate = (c: string): Vec2 => {
  switch (c) {
    case 'A': return [0, 2];
    case '^': return [0, 1];
    case 'v': return [1, 1];
    case '<': return [1, 0];
    case '>': return [1, 2];
    default: throw new Error(`Unknonw dir "${c}"`);
  }
};

const getHumanSequenceForCode = (code: string, numIntermediaries: number = 2): string => {
  const firstRobotSequences = code.split('').reduce((acc, c, i) => {
    const start = i == 0 ? numericToCoordinate('A') : numericToCoordinate(code.charAt(i - 1));
    const end = numericToCoordinate(c);

    const vertFirst = [...getNumericMoveSequence(start, end, true), 'A'].join('');
    const vertLast = [...getNumericMoveSequence(start, end, false), 'A'].join('');

    // Take every sequence we have so far, append new sequences
    const sequences = new Set<string>();
    if (acc.size) {
      for (const s of acc) {
        sequences.add(`${s}${vertFirst}`);
        sequences.add(`${s}${vertLast}`);
      }
    } else {
      sequences.add(vertFirst);
      sequences.add(vertLast);
    }
    return sequences;
  }, new Set<string>());

  let intermediarySequences = new Set(firstRobotSequences);
  for (let i = 0; i < numIntermediaries; i++) {
    let next = new Set<string>();
    for (const seq of intermediarySequences) {
      next = next.union(
        seq.split('').reduce((acc, c, i) => {
          const start = i == 0 ? dirToCoordinate('A') : dirToCoordinate(seq.charAt(i - 1));
          const end = dirToCoordinate(c);
  
          const vertFirst = [...getDirMoveSequence(start, end, true), 'A'].join('');
          const vertLast = [...getDirMoveSequence(start, end, false), 'A'].join('');
  
          // Take every sequence we have so far, append new sequences
          const sequences = new Set<string>();
          if (acc.size) {
            for (const s of acc) {
              sequences.add(`${s}${vertFirst}`);
              sequences.add(`${s}${vertLast}`);
            }
          } else {
            sequences.add(vertFirst);
            sequences.add(vertLast);
          }
          return sequences;
        }, new Set<string>())
      );
    }
    intermediarySequences = next;
  }

  const finalSequences = [...intermediarySequences.values()];
  finalSequences.sort((a, b) => a.length - b.length);

  return finalSequences[0];
};

const part1 = (data: DataStruct): number => {
  return data.codes.reduce((acc, code) => {
    const seq = getHumanSequenceForCode(code);
    const num = parseInt(code);

    return acc + seq.length * num;
  }, 0);
};



const part2 = (data: DataStruct): number => {
  return 2;
};

await run({ parseLines, part1, part2 });

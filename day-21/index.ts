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

const getDirPadSequencesForNumeric = (code: string): string[] => {
  const dirPadSequences = code.split('').reduce((acc, c, i) => {
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

  return [...new Set(dirPadSequences)];
};

// seq is assumed to be a 2 letter sequence indicating a start and end
const getDirPadSequenceLengthAfterLayers = (seq: string, layers: number, cache: Cache): number => {
  if (layers === 1) {
    return patternCache.get(seq)![0].length;
  }

  // Check the cache
  const result = cache.get(layers)?.get(seq);
  if (result) {
    return result;
  }

  // Find the min length
  const len = Math.min(...patternCache.get(seq)!.map(subSeq => {
    // Assume we start from 'A', find all pairs we have to move between
    const pairs = subSeq.split('').map((c, i, arr) => {
      if (i === 0) {
        return 'A' + c;
      }
      return arr[i-1] + c;
    });

    return pairs.reduce((acc, p) => {
      return acc + getDirPadSequenceLengthAfterLayers(p, layers - 1, cache);
    }, 0);
  }));

  const layerCache = cache.get(layers) ?? new Map();
  layerCache.set(seq, len);
  cache.set(layers, layerCache);

  return len;
};

type Cache = Map<number, Map<string, number>>; // layer -> fullSeq -> number
const patternCache: Map<string, string[]> = new Map();
const chars = '^v<>A';
chars.split('')
  .forEach(c1 => {
    chars.split('')
      .forEach(c2 => {
        const p = c1 + c2;
        if (c1 === c2) {
          patternCache.set(p, ['A']);
        } else {
          patternCache.set(p, [... new Set([
            [...getDirMoveSequence(dirToCoordinate(c1), dirToCoordinate(c2), false), 'A'].join(''),
            [...getDirMoveSequence(dirToCoordinate(c1), dirToCoordinate(c2), true), 'A'].join(''),
          ])]);
        }
      })
  });

const solveLength = (code: string, layers: number): number => {
  const dirPadSequences = getDirPadSequencesForNumeric(code);

  const minSquenceLength = dirPadSequences.reduce((minLen, seq) => {
    // Assume we start from 'A', find all pairs we have to move between
    const pairs = seq.split('').map((c, i, arr) => {
      if (i === 0) {
        return 'A' + c;
      }
      return arr[i-1] + c;
    });

    const cache = new Map();
    const length = pairs.reduce((acc, p) => {
      return acc + getDirPadSequenceLengthAfterLayers(p, layers, cache);
    }, 0);
    return Math.min(length, minLen);
  }, Infinity);


  return minSquenceLength;
};

const part1 = (data: DataStruct): number => {
  return data.codes.reduce((acc, code) => {
    const num = parseInt(code);
    return acc + solveLength(code, 2) * num;
  }, 0);
};

const part2 = (data: DataStruct): number => {
  return data.codes.reduce((acc, code) => {
    const num = parseInt(code);
    return acc + solveLength(code, 25) * num;
  }, 0);
};

await run({ parseLines, part1, part2 });

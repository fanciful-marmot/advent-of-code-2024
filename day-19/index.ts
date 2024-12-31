import { run } from '../utils/utils.ts';

type DataStruct = {
  towels: string[],
  designs: string[],
};

const parseLines = (lines: string[]): DataStruct => {
  return {
    towels: lines[0].split(', '),
    designs: lines.slice(2),
  };
};

const getPatternCounts = (design: string, towels: string[], cache: Map<string, number>): number => {
  if (cache.has(design)) {
    return cache.get(design)!;
  }

  const counts = towels.filter(t => design.startsWith(t))
    .map(t => {
      const suffix = design.slice(t.length);

      return getPatternCounts(suffix, towels, cache);
    })
    .filter(count => count > 0)
    .reduce((acc, c) => acc + c, 0);
  
  cache.set(design, counts);
  
  return counts;
};

let counts: number[];
const part1 = (data: DataStruct): number => {
  const { towels, designs } = data;

  // Setup cache
  const cache = new Map<string, number>();
  towels.forEach(towel => {
    // Naively find if this towel covers any sub patterns
    // Even this is shockingly slow on the input
    let subCount = 0;
    const exclusions = new Set<string>();
    const waveFront: string[][] = [...towels]
      .filter(subT => towel.startsWith(subT))
      .map(subT => [subT]);
    const visited = new Set<string>();
    while (waveFront.length) {
      const path = waveFront.shift()!;

      const key = path.join(',');
      const p = path.join('');
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      if (p === towel) {
        subCount += 1;
      } else {
        exclusions.add(p);
      }

      const next = [...towels]
        .map(subT => [...path, subT])
        .filter(p => towel.startsWith(p.join('')));
      waveFront.push(...next);
    }
    
    cache.set(towel, subCount)
  });

  counts = designs.map(d => {
    return getPatternCounts(d, towels, cache);
  });

  return counts.filter(n => n > 0).length;
};

const part2 = (_data: DataStruct): number => {
  return counts.reduce((acc, v) => acc + v);
};

await run({ parseLines, part1, part2 });

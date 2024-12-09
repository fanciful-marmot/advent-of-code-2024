import { run, Vec2, isInBounds, gcd } from '../utils/utils.ts';

type DataStruct = {
  antennas: Map<string, Vec2[]>,
  size: Vec2,
};

const parseLines = (lines: string[]): DataStruct => {
  const antennas = new Map();

  lines.forEach((line, row) => {
    line.split('').forEach((c, col) => {
      if (c === '.') {
        return;
      }

      const antenna = antennas.get(c) ?? [];
      antenna.push([row, col]);
      antennas.set(c, antenna);
    });
  })

  return {
    antennas,
    size: [lines.length, lines[0].length],
  };
};

const getAntinodes = (a1: Vec2, a2: Vec2, bounds: Vec2): Vec2[] => {
  const delta: Vec2 = [a2[0] - a1[0], a2[1] - a1[1]];

  const antinodes: Vec2[] = [
    [a1[0] - delta[0], a1[1] - delta[1]],
    [a2[0] + delta[0], a2[1] + delta[1]],
  ];

  return antinodes.filter(an => isInBounds(an, bounds));
};

const getResonantAntinodes = (a1: Vec2, a2: Vec2, bounds: Vec2): Vec2[] => {
  // Vectro from a1 to a2
  const delta: Vec2 = [a2[0] - a1[0], a2[1] - a1[1]];

  // Make the step size as small as possible
  const divisor = gcd(delta[0], delta[1]);
  delta[0] /= divisor;
  delta[1] /= divisor;

  const antinodes: Vec2[] = [];
  // Count away from a1
  {
    let an: Vec2 = [a1[0] - delta[0], a1[1] - delta[1]];
    let i = 1;
    while (isInBounds(an, bounds)) {
      antinodes.push(an);
      i++;
      an = [a1[0] - i * delta[0], a1[1] - i * delta[1]];
    }
  }

  // Count away from a2
  {
    let an: Vec2 = [a2[0] + delta[0], a2[1] + delta[1]];
    let i = 1;
    while (isInBounds(an, bounds)) {
      antinodes.push(an);
      i++;
      an = [a2[0] + i * delta[0], a2[1] + i * delta[1]];
    }
  }

  // Count between a1 and 2
  {
    let an: Vec2 = [a1[0] + delta[0], a1[1] + delta[1]];
    let i = 1;
    while (a2[0] - an[0] > 0 && a2[1] - an[1] > 0) {
      antinodes.push(an);
      i++;
      an = [a1[0] + i * delta[0], a1[1] + i * delta[1]];
    }
  }

  // Count a1 and a2
  antinodes.push(a1, a2);

  return antinodes;
};

const part1 = (data: DataStruct): number => {
  const { antennas, size } = data;

  // Store antinodes in a set of their locations encoded as strings
  // Done to ensure we don't double count
  const antinodes: Set<string> = new Set();

  for (const positions of antennas.values()) {
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        getAntinodes(positions[i], positions[j], size).forEach(an => {
          antinodes.add(`${an[0]},${an[1]}`);
        })
      }
    }
  }

  return antinodes.size;
};

const part2 = (data: DataStruct): number => {
  const { antennas, size } = data;
  
  // Store antinodes in a set of their locations encoded as strings
  // Done to ensure we don't double count
  const antinodes: Set<string> = new Set();

  for (const positions of antennas.values()) {
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        getResonantAntinodes(positions[i], positions[j], size).forEach(an => {
          antinodes.add(`${an[0]},${an[1]}`);
        })
      }
    }
  }

  return antinodes.size;
};

await run({ parseLines, part1, part2 });

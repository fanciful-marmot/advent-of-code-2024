import { run, Vec2 } from '../utils/utils.ts';

type Robot = {
  p: Vec2,
  v: Vec2,
}

type DataStruct = {
  robots: Robot[],
};

const parseLines = (lines: string[]): DataStruct => {
  const robots = lines.map(line => {
    const parts = line.split(' ');
    const p = parts[0].slice(2).split(',').map(x => parseInt(x));
    const v = parts[1].slice(2).split(',').map(x => parseInt(x));

    return {
      p,
      v,
    } as Robot;
  });

  return {
    robots,
  };
};

// const fieldSize: Vec2 = [11, 7];
const fieldSize: Vec2 = [101, 103];

const simulate = (r: Robot, ticks: number, field: Vec2): Robot => {
  const p = [
    (r.p[0] + r.v[0] * ticks) % field[0],
    (r.p[1] + r.v[1] * ticks) % field[1],
  ];
  return {
    p: [
      p[0] < 0 ? p[0] + field[0] : p[0],
      p[1] < 0 ? p[1] + field[1] : p[1],
    ],
    v: [r.v[0], r.v[1]],
  };
}

const part1 = (data: DataStruct): number => {
  const quadrants = data.robots
    .map(r => simulate(r, 100, fieldSize))
    .reduce((acc, r) => {
      const lrDivide = Math.floor(fieldSize[0] / 2);
      const tbDivide = Math.floor(fieldSize[1] / 2);
      if (r.p[0] === lrDivide || r.p[1] === tbDivide) {
        return acc;
      }

      const q = (r.p[0] < lrDivide ? 0 : 1) +
        (r.p[1] < tbDivide ? 0 : 2);
      acc[q].push(r);

      return acc;
    }, { 0: [], 1: [], 2: [], 3: [] } as { [key: number]: Robot[]});

  return quadrants[0].length * quadrants[1].length * quadrants[2].length * quadrants[3].length;
};

const isCandidate = (field: number[][]): boolean => {
  // NOTE: This worked but was an incorrect assumption
  // Count the number of horizontal runs.
  // Assuming a general shape of
  //      .
  //     . .
  //    .   .
  //   ..   .. <-- looking for these
  //   .     .
  //  ..     ..

  // NOTE: Actual shape
  // 1111111111111111111111111111111
  // 1.............................1
  // 1.............................1
  // 1.............................1
  // 1.............................1
  // 1..............1..............1
  // 1.............111.............1
  // 1............11111............1
  // 1...........1111111...........1
  // 1..........111111111..........1
  // 1............11111............1
  // 1...........1111111...........1
  // 1..........111111111..........1
  // 1.........11111111111.........1
  // 1........1111111111111........1
  // 1..........111111111..........1
  // 1.........11111111111.........1
  // 1........1111111111111........1
  // 1.......111111111111111.......1
  // 1......11111111111111111......1
  // 1........1111111111111........1
  // 1.......111111111111111.......1
  // 1......11111111111111111......1
  // 1.....1111111111111111111.....1
  // 1....111111111111111111111....1
  // 1.............111.............1
  // 1.............111.............1
  // 1.............111.............1
  // 1.............................1
  // 1.............................1
  // 1.............................1
  // 1.............................1
  // 1111111111111111111111111111111
  const minLength = 5;
  const minNum = 10;
  const numRuns = (row: number[]) => {
    let runs = 0;
    for (let i = 2; i < row.length; i++) {
      if (row[i - minLength] === 0 && row.slice(i - minLength + 1, i + 1).every(v => v !== 0)) {
        runs++;
      }
    }
    return runs;
  };

  return field.reduce((acc, row) => acc + numRuns(row), 0) > minNum;
}

const part2 = (data: DataStruct): number => {
  const printField = (field: number[][]) => {
    console.log(
      field.map(row => {
        return row.map(c => c == 0 ? '.' : c).join('');
      }).join('\n')
    );
    console.log(seconds);
  };

  let seconds = 0;
  let found = false;
  while (!found) {
    seconds += 1;
    const robots = data.robots
      .map(r => simulate(r, seconds, fieldSize));

    const field = new Array(fieldSize[1]).fill(0)
      .map(() => new Array(fieldSize[0]).fill(0));

    for (const r of robots) {
      field[r.p[1]][r.p[0]]++;
    }

    if (isCandidate(field)) {
      printField(field);
      found = confirm('Done?');
    }
  }

  return seconds;
};

await run({ parseLines, part1, part2 });

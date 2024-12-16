import { DIRECTION, getNextPosition, rowColGet, run, Vec2 } from '../utils/utils.ts';

const FLAGS = {
  BOX: 1 << 0,
  WALL: 1 << 1,
};

type DataStruct = {
  map: number[][],
  robot: Vec2,
  instructions: DIRECTION[],
};

const parseLines = (lines: string[]): DataStruct => {
  const map: number[][] = [];
  let robot: Vec2 = [0, 0];
  
  // Parse map
  let i = 0;
  {
    while (lines[i].length) {
      map.push(lines[i].split('').map((c, j) => {
        switch (c) {
          case '#':
            return FLAGS.WALL;
          case 'O':
            return FLAGS.BOX;
          case '@':
            robot = [i, j];
            /* falls through */
          default:
            return 0;
        }
      }));

      i++;
    }
  }

  // Parse instructions
  const instructions: DIRECTION[] = [];
  for (i += 1; i < lines.length; i++) {
    lines[i].split('')
      .forEach(c => {
        switch (c) {
          case '^':
            instructions.push(DIRECTION.UP);
            break;
          case 'v':
            instructions.push(DIRECTION.DOWN);
            break;
          case '<':
            instructions.push(DIRECTION.LEFT);
            break;
          default:
            instructions.push(DIRECTION.RIGHT);
            break;
        }
      });
  }

  return {
    map,
    instructions,
    robot,
  };
};

const apply = (map: number[][], robot: Vec2, direction: DIRECTION) => {
  const nextP = getNextPosition(robot, direction);

  switch (rowColGet(map, nextP)) {
    case FLAGS.WALL:
      break; // We're blocked, do nothing
    case FLAGS.BOX: {
      // Try to push box(es)
      let endOfChain = nextP;
      while (rowColGet(map, endOfChain) === FLAGS.BOX) {
        endOfChain = getNextPosition(endOfChain, direction);
      }

      // Move everything one square
      if (rowColGet(map, endOfChain) === 0) {
        map[nextP[0]][nextP[1]] = 0; // No longer occupied
        map[endOfChain[0]][endOfChain[1]] = FLAGS.BOX;
        // Update robot
        robot[0] = nextP[0];
        robot[1] = nextP[1];
      }
      break;
    }
    default:
      // unblocked, continue forward
      robot[0] = nextP[0];
      robot[1] = nextP[1];
      break;
  }
};

const printMap = (map: number[][], robot: Vec2) => {
  console.log(map.map((line, row) => line.map((c, col) => {
    if (row === robot[0] && col === robot[1]) {
      return '@';
    }
    if (c === FLAGS.WALL) {
      return '#';
    }
    if (c === FLAGS.BOX) {
      return 'O';
    }
    return '.';
  }).join('')).join('\n'));
};

const isLeftBoxCoord = (map: number[][], box: Vec2): boolean => {
  const c = rowColGet(map, box);
  if (c !== FLAGS.BOX) {
    console.log(box);
    printMap(map, [0, 0]);
    throw new Error('Tried to find box chain without starting at box');
  }

  let endOfChain = getNextPosition(box, DIRECTION.LEFT);
  while (rowColGet(map, endOfChain) === FLAGS.BOX) {
    endOfChain = getNextPosition(endOfChain, DIRECTION.LEFT);
  }

  return (box[1] - (endOfChain[1] + 1)) % 2 === 0;
};

const part1 = (data: DataStruct): number => {
  // Shallow copy, since we'll modify it
  const map = data.map.map(row => [...row]);
  const robot: Vec2 = [data.robot[0], data.robot[1]];

  for (const instruction of data.instructions) {
    apply(map, robot, instruction);
  }

  return map
    .map((line, row) => (
      line.map((c, col) => (
        c === FLAGS.BOX ? 100 * row + col : 0
      )).reduce((acc, v) => acc + v)
    ))
    .reduce((acc, v) => acc + v);
};

const makeDoubleWidth = (map: number[][]): number[][] => {
  return map.map(row => {
    const newRow = new Array(row.length * 2).fill(0);

    for (let c = 0; c < row.length; c++) {
      switch (row[c]) {
        case FLAGS.BOX:
        case FLAGS.WALL:
          newRow[c * 2] = row[c];
          newRow[c * 2 + 1] = row[c];
          break;
        default:
          break;
      }
    }

    return newRow;
  });
};

const canMoveBox = (map: number[][], boxLeft: Vec2, dir: DIRECTION.UP | DIRECTION.DOWN): boolean => {
  const nextPL = getNextPosition(boxLeft, dir);
  const nextPR = getNextPosition([boxLeft[0], boxLeft[1] + 1], dir);
  const nextLC = rowColGet(map, nextPL);
  const nextRC = rowColGet(map, nextPR);

  // Have we hit a wall?
  if (nextLC === FLAGS.WALL || nextRC === FLAGS.WALL) {
    return false
  }

  // Check left path if box
  if (nextLC === FLAGS.BOX && !canMoveBox(map, [nextPL[0], isLeftBoxCoord(map, nextPL) ? nextPL[1] : nextPL[1] - 1], dir)) {
    return false;
  }

  // Check right path if box
  if (nextRC === FLAGS.BOX && !canMoveBox(map, [nextPR[0], isLeftBoxCoord(map, nextPR) ? nextPR[1] : nextPR[1] - 1], dir)) {
    return false;
  }

  // We're clear to move
  return true;
};

// Assumed that we've checked it's possible
const moveBox = (map: number[][], boxLeft: Vec2, dir: DIRECTION.UP | DIRECTION.DOWN) => {
  const nextPL = getNextPosition(boxLeft, dir);
  const nextPR = getNextPosition([boxLeft[0], boxLeft[1] + 1], dir);
  const nextLC = rowColGet(map, nextPL);

  // Left side
  if (nextLC === FLAGS.BOX) {
    // Move the box ahead of us
    moveBox(map, [nextPL[0], isLeftBoxCoord(map, nextPL) ? nextPL[1] : nextPL[1] - 1], dir);
  }
  
  // Right side
  const nextRC = rowColGet(map, nextPR);
  if (nextRC === FLAGS.BOX) {
    // Move the box ahead of us
    moveBox(map, [nextPR[0], isLeftBoxCoord(map, nextPR) ? nextPR[1] : nextPR[1] - 1], dir);
  }

  // Clear oldP
  map[boxLeft[0]][boxLeft[1]] = 0;
  map[boxLeft[0]][boxLeft[1] + 1] = 0;
  // Write newP
  map[nextPL[0]][nextPL[1]] = FLAGS.BOX;
  map[nextPR[0]][nextPR[1]] = FLAGS.BOX;
};

const applyDoubleWide = (map: number[][], robot: Vec2, dir: DIRECTION) => {
  if (dir === DIRECTION.LEFT || dir === DIRECTION.RIGHT) {
    apply(map, robot, dir);
    return;
  }

  const nextP = getNextPosition(robot, dir);
  switch (rowColGet(map, nextP)) {
    case FLAGS.BOX: {
      // We're going up/down. This is more complicated...
      const isLeftCoord = isLeftBoxCoord(map, nextP);
      const box: Vec2 = isLeftCoord ? nextP : [nextP[0], nextP[1] - 1];
      if (canMoveBox(map, box, dir)) {
        moveBox(map, box, dir);
        robot[0] = nextP[0];
        robot[1] = nextP[1];
      }
      break;
    }
    default:
      // Otherwise, things are simple
      apply(map, robot, dir);
      break;
  }
};

const part2 = (data: DataStruct): number => {
  const map = makeDoubleWidth(data.map);
  const robot: Vec2 = [data.robot[0], data.robot[1] * 2];

  for (const instruction of data.instructions) {
    applyDoubleWide(map, robot, instruction);
  }

  return map
    .map((line, row) => (
      line.map((c, col) => (
        c === FLAGS.BOX && isLeftBoxCoord(map, [row, col]) ? 100 * row + col : 0
      )).reduce((acc, v) => acc + v)
    ))
    .reduce((acc, v) => acc + v);
};

await run({ parseLines, part1, part2 });

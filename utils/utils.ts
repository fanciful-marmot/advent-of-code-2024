export const getInput = async (): Promise<string[]> => {
  if (Deno.args.length !== 1) {
    throw new Error(`Expected filename as only argument but received ${Deno.args.length} arguments`);
  }

  const filename = Deno.args[0];

  return (await Deno.readTextFile(filename)).split('\n');
}

type RunParams<T> = {
  parseLines: (lines: string[]) => T,
  part1: (data: T) => number | bigint | string,
  part2: (data: T) => number | bigint | string,
};
export async function run<T>(params: RunParams<T>): Promise<void> {
  const { parseLines, part1, part2 } = params;
  
  const lines = await getInput();

  const data = parseLines(lines);
  
  console.log(`Part 1: ${part1(data)}`);
  console.log(`Part 2: ${part2(data)}`);
};

export const numericalSort = (array: number[]): void => {
  array.sort((a, b) => a - b);
};

export const gcd = (a: number, b: number): number => {
  if (b === 0) {
    return a
  }
  
  return gcd(b, a % b)
};

export type Vec2 = [number, number];

export const v2Eq = (v: Vec2, w: Vec2): boolean => v[0] === w[0] && v[1] === w[1];

export const isInBounds = (p: Vec2, bounds: Vec2): boolean => {
  return !(p[0] < 0 || p[0] >= bounds[0] || p[1] < 0 || p[1] >= bounds[1])
};

export const isInt = (x: number): boolean => Math.round(x) === x;

export enum DIRECTION {
  UP = 1 << 0,
  DOWN = 1 << 1,
  LEFT = 1 << 2,
  RIGHT = 1 << 3,
};

export const getNextPosition = (p: Vec2, dir: DIRECTION): Vec2 => {
  const nextPosition: Vec2 = [p[0], p[1]];
  switch (dir) {
    case DIRECTION.UP:
      nextPosition[0] -= 1;
      break;
    case DIRECTION.DOWN:
      nextPosition[0] += 1;
      break;
    case DIRECTION.LEFT:
      nextPosition[1] -= 1;
      break;
    case DIRECTION.RIGHT:
      nextPosition[1] += 1;
      break;
  }
  return nextPosition;
};

export const rowColGet = <T>(map: T[][], p: Vec2): T => {
  return map[p[0]][p[1]];
};

export const vec2ToString = (v: Vec2) => `${v[0]},${v[1]}`;

export const numArrayEq = (a1: number[], a2: number[]): boolean => {
  return a1.length === a2.length && a1.every((a, i) => a2[i] === a);
};

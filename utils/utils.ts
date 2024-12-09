export const getInput = async (): Promise<string[]> => {
  if (Deno.args.length !== 1) {
    throw new Error(`Expected filename as only argument but received ${Deno.args.length} arguments`);
  }

  const filename = Deno.args[0];

  return (await Deno.readTextFile(filename)).split('\n');
}

type RunParams<T> = {
  parseLines: (lines: string[]) => T,
  part1: (data: T) => number | bigint,
  part2: (data: T) => number | bigint,
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

export const isInBounds = (p: Vec2, bounds: Vec2): boolean => {
  return !(p[0] < 0 || p[0] >= bounds[0] || p[1] < 0 || p[1] >= bounds[1])
};

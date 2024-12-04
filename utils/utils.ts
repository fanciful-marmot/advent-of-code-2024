export const getInput = async (): Promise<string[]> => {
  if (Deno.args.length !== 1) {
    throw new Error(`Expected filename as only argument but received ${Deno.args.length} arguments`);
  }

  const filename = Deno.args[0];

  return (await Deno.readTextFile(filename)).split('\n');
}

type RunParams<T> = {
  parseLines: (lines: string[]) => T,
  part1: (data: T) => number,
  part2: (data: T) => number,
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

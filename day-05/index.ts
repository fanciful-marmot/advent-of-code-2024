import { run } from '../utils/utils.ts';

type DataStruct = {
  precedenceRules: Map<number, number[]>, // Key must come before value
  updates: number[][],
};

const parseLines = (lines: string[]): DataStruct => {
  const precedenceRules = new Map();
  let i = 0;
  let line = lines[0];
  do {
    const rule = line.split('|');
    const key = parseInt(rule[0]);
    const value = parseInt(rule[1]);
    precedenceRules.set(key, [...(precedenceRules.get(key) ?? []), value]);
    i++;
    line = lines[i];
  } while(line.length > 1);

  // Skip blank line
  i++
  const updates = [];
  for (; i < lines.length; i++) {
    updates.push(lines[i].split(',').map(n => parseInt(n)));
  }

  return { precedenceRules, updates }
};

const isOrdered = (update: number[], rules: DataStruct['precedenceRules']): boolean => {
  const seenPages = new Set();

  return update.every(value => {
    if (rules.has(value)) {
      // Have we violated the rule?
      if (rules.get(value)!.some(v => seenPages.has(v))) {
        return false;
      }

      // Either it's ahead of us or the other page isn't there. Either way we're good
    }

    seenPages.add(value);
    return true;
  })
};

const part1 = (data: DataStruct): number => {
  const { precedenceRules, updates } = data;

  return updates
    .filter(update => isOrdered(update, precedenceRules))
    .reduce((acc, update) => {
      return acc + update[Math.floor(update.length / 2)];
    }, 0);
};

const reorder = (update: number[], rules: DataStruct['precedenceRules']): number[] => {
  const reordered = [...update];
  let seenPages = new Map();

  for (let i = 0; i < reordered.length; i++) {
    const value = reordered[i];

    // Have we violated the rule?
    const rule = rules.get(value);
    if (rule && rule.some(v => seenPages.has(v))) {
      // Fix it
      // Find earliest page we violated
      const indexViolations = rule.map(p => ({ page: p, index: seenPages.get(p) }))
        .filter(mapping => mapping.index != undefined);
      indexViolations.sort((a, b) => a.index - b.index);
      const earliest = indexViolations[0];

      // Swap current with earliest
      reordered[i] = earliest.page;
      reordered[earliest.index] = value;

      // Have to reevaluate
      i = earliest.index - 1;
      // Clear seen pages ahead
      const newSeenPages = new Map();
      for (const [page, index] of seenPages) {
        if (index <= i) {
          newSeenPages.set(page, index);
        }
      }
      seenPages = newSeenPages;
    } else {
      seenPages.set(value, i);
    }
  }

  // Confirm
  if (!isOrdered(reordered, rules)) {
    update.forEach(p => {
      const rule = rules.get(p);
      if (rule) {
        console.log(p, '|', rule);
      }
    })
    console.log(update);
    console.log(reordered);
    throw new Error();
  }

  return reordered;
}

const part2 = (data: DataStruct): number => {
  const { precedenceRules, updates } = data;

  const incorrectUpdates = updates
    .filter(update => !isOrdered(update, precedenceRules))
    .map(update => reorder(update, precedenceRules));

  return incorrectUpdates
    .reduce((acc, update) => {
      return acc + update[Math.floor(update.length / 2)];
    }, 0);
};

await run({ parseLines, part1, part2 });

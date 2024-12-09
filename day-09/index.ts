import { run, Vec2 } from '../utils/utils.ts';

type DataStruct = {
  expandedDisk: number[],
  freeBlocks: Vec2[],
  fileBlocks: Vec2[],
};

const parseLines = (lines: string[]): DataStruct => {
  const compactDisk = lines[0].split('').map(c => parseInt(c));

  const diskSize = compactDisk.reduce((acc, v) => acc + v);

  const expandedDisk = new Array(diskSize);
  const freeBlocks: Vec2[] = [];
  const fileBlocks: Vec2[] = [];

  for (let i = 0, diskWriter = 0; i < compactDisk.length; i++) {
    const isFile = i % 2 === 0;
    const expandedValue = isFile ? Math.floor(i / 2) : -1;
    const value = compactDisk[i];

    if (value > 0) {
      if (isFile) {
        fileBlocks.push([diskWriter, value])
      } else {
        freeBlocks.push([diskWriter, value]);
      }
    }

    expandedDisk.fill(expandedValue, diskWriter, diskWriter + value);
    diskWriter += value;
  }

  return {
    expandedDisk,
    freeBlocks,
    fileBlocks,
  };
};

const checksum = (expandedDisk: number[]): number => {
  return expandedDisk.reduce((acc, v, i) => {
    if (v > -1) {
      return acc + v * i;
    }

    return acc;
  }, 0);
};

const insertFreeBlock = (blocks: Vec2[], freeBlock: Vec2) => {
  let insertionIndex = blocks.findIndex(b => b[0] > freeBlock[0]);

  // Do we need to merge left?
  const leftBlock = blocks[insertionIndex - 1];
  if (leftBlock && leftBlock[0] + leftBlock[1] === freeBlock[0]) {
    // Need to merge
    // Expand free block
    freeBlock[0] = leftBlock[0];
    freeBlock[1] += leftBlock[1];
    // Delete neighbour
    blocks.splice(insertionIndex - 1, 1);
    // Adjust index
    insertionIndex -= 1;
  }

  // Do we need to merge right?
  const rightBlock = blocks[insertionIndex + 1];
  if (rightBlock && freeBlock[0] + freeBlock[1] === rightBlock[0]) {
    // Need to merge
    // Expand free block
    freeBlock[1] += rightBlock[1];
    // Delete neighbour
    blocks.splice(insertionIndex + 1, 1);
    // Don't need to adjust index
  }

  // Insert
  blocks.splice(insertionIndex, 0, freeBlock);
};

// const printExpandedDisk = (disk: number[]) => {
//   console.log(
//     disk
//       .map(n => n === -1 ? '.' : n)
//       .join('')
//   )
// }

const part1 = (data: DataStruct): number => {
  const expandedDisk = [...data.expandedDisk];

  // Rearrange
  let p = 0; //
  let q = expandedDisk.length - 1;
  while (expandedDisk[p] !== -1) { p++ }
  while (expandedDisk[q] === -1) { q-- }
  while (p < q) {
    // Swap
    expandedDisk[p] = expandedDisk[q];
    expandedDisk[q] = -1;

    // Find next empty spot
    while (expandedDisk[p] !== -1) { p++ }

    // Find next file spot
    while (expandedDisk[q] === -1) { q-- }
  }

  return checksum(expandedDisk);
};

const part2 = (data: DataStruct): number => {
  const expandedDisk = [...data.expandedDisk];
  const freeBlocks = [...data.freeBlocks];
  const fileBlocks = [...data.fileBlocks];
  fileBlocks.reverse();

  for (const fileBlock of fileBlocks) {
    // Find earliest free block before current file
    const freeBlockIndex = freeBlocks.findIndex(freeBlock => freeBlock[0] < fileBlock[0] && freeBlock[1] >= fileBlock[1]);
    if (freeBlockIndex < 0) {
      continue; // No available slot, move on
    }

    // Take the block out. We'll reinsert later if needed
    const freeBlock = freeBlocks.splice(freeBlockIndex, 1)[0];
    // Write the file to the free space
    expandedDisk.copyWithin(freeBlock[0], fileBlock[0], fileBlock[0] + fileBlock[1]);
    // Write empty space to where the file was
    expandedDisk.fill(-1, fileBlock[0], fileBlock[0] + fileBlock[1]);
    
    // Re-insert the empty block if there's any space left
    if (fileBlock[1] < freeBlock[1]) {
      insertFreeBlock(freeBlocks, [freeBlock[0] + fileBlock[1], freeBlock[1] - fileBlock[1]]);
    }

    // Insert free block where the file was
    insertFreeBlock(freeBlocks, [fileBlock[0], fileBlock[1]]);
  }

  return checksum(expandedDisk);
};

await run({ parseLines, part1, part2 });

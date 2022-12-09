import { DailySolution, handlerBase } from '../../handler';
import { splitToLines } from '../../util';

function countVisible(toCheck: number[], from: number): number {
  let count = 0;
  for (const tree of toCheck) {
    count += 1;
    if (tree >= from) {
      break;
    }
  }
  return count;
}

export class Day8 extends DailySolution {
  private readonly grid: number[][];
  constructor(input: string) {
    super(input);
    this.grid = splitToLines(input).map(line => line.split('').map(char => Number(char)));
  }

  public get part1Solution(): number | undefined {
    // All perimeter trees are visible
    const perimeterSize = (this.grid.length + this.grid[0].length - 2) * 2;
    let visible = perimeterSize;
    for (let i = 1; i < this.grid.length - 1; i++) {
      const rowsAbove = this.grid.slice(0, i);
      const rowsBelow = this.grid.slice(i + 1);
      for (let j = 1; j < this.grid[i].length - 1; j++) {
        const tree = this.grid[i][j];
        const tallestLeft = Math.max(...this.grid[i].slice(0, j)) < tree;
        const tallestRight = Math.max(...this.grid[i].slice(j + 1)) < tree;
        const tallestAbove = Math.max(...rowsAbove.map((row) => row[j])) < tree;
        const tallestBelow = Math.max(...rowsBelow.map((row) => row[j])) < tree;

        if (tallestLeft || tallestRight || tallestAbove || tallestBelow) {
          visible += 1;
        }
      }
    }

    return visible;
  }

  public get part2Solution(): number | undefined {
    const scenicScore: number[][] = [];
    for (let i = 0; i < this.grid.length; i++) {
      scenicScore[i] = [];
      const rowsAbove = this.grid.slice(0, i);
      const rowsBelow = this.grid.slice(i + 1);
      for (let j = 0; j < this.grid[i].length; j++) {
        const tree = this.grid[i][j];
        const leftDisance = countVisible(this.grid[i].slice(0, j).reverse(), tree);
        const rightDistance = countVisible(this.grid[i].slice(j + 1), tree);
        const aboveDistance = countVisible(rowsAbove.map((row) => row[j]).reverse(), tree);
        const belowDistance = countVisible(rowsBelow.map((row) => row[j]), tree);
        scenicScore[i][j] = leftDisance * rightDistance * aboveDistance * belowDistance;
      }
    }
    return Math.max(...scenicScore.flatMap((row) => row));
  }
}

export const Solver = Day8;
export const handler = handlerBase(Solver);

import { AsyncDailySolution, handlerBase } from '../../handler';
import { splitToLines } from '../../util';

type GridData = readonly string[][];
type Point = readonly [number, number];
type PathEntry = readonly [Point, number];

function isSamePoint(a: Point, b: Point): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export class Map {
  private readonly data: GridData;
  public readonly start: Point;
  public readonly end: Point;
  public readonly allLowest: Point[];

  constructor(data: string[][]) {
    this.start = Map.findCoordinate(data, 'S')[0];
    this.end = Map.findCoordinate(data, 'E')[0];
    data[this.start[0]][this.start[1]] = 'a';
    data[this.end[0]][this.end[1]] = 'z';
    this.allLowest = Map.findCoordinate(data, 'a');
    this.data = data;
  }

  async startToEndCost(): Promise<number> {
    const cost = await this.evaluate(this.start);
    if (!cost) { throw new Error('No path found :('); }
    return cost;
  }

  async lowestStartingCost(): Promise<number> {
    const distances = await Promise.all(this.allLowest.map(point => this.evaluate(point)));
    const lowest = distances.reduce((min, dist) => {
      if (dist === undefined) return min;
      if (min === undefined) return dist;
      return dist <= min ? dist : min;
    }, undefined);
    if (!lowest) {
      throw new Error('No valid paths found! :(');
    }
    return lowest;
  }

  private async evaluate(from: Point): Promise<number | undefined> {
    const q: PathEntry[] = [[from, 0]];
    const seen: Point[] = [];
    while (q.length) {
      const [point, d] = q.shift()!;
      if (seen.some((a) => isSamePoint(point, a))) {
        continue;
      }
      seen.push(point);
      if (isSamePoint(point, this.end)) {
        return d;
      }
      for (const diff of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
        const newPoint: Point = [point[0] + diff[0], point[1] + diff[1]];
        if (!this.withinGrid(newPoint)) {
          continue;
        }
        if (this.canMove(point, newPoint)) {
          q.push([newPoint, d + 1]);
        }
      }
    }
    return undefined;
  }

  private at(point: Point): string {
    return this.data[point[0]][point[1]];
  }

  private moveCost(from: Point, to: Point): number {
    const fromChar = this.at(from).charCodeAt(0);
    const toChar = this.at(to).charCodeAt(0);
    return fromChar - toChar;
  }

  private canMove(from: Point, to: Point): boolean {
    return this.moveCost(from, to) >= -1;
  }

  private withinGrid(point: Point): boolean {
    return point[0] >= 0 &&
      point[0] < this.data.length &&
      point[1] >= 0 &&
      point[1] < this.data[0].length;
  }

  private static findCoordinate(data: GridData, of: string): Point[] {
    const indicies: Point[] = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (data[i][j] === of) {
          indicies.push([i, j]);
        }
      }
    }
    return indicies;
  }
}

export class Day12 extends AsyncDailySolution {
  private readonly map: Map;

  constructor(input: string) {
    super(input);
    const rows = splitToLines(this.rawInput);
    const grid = rows.map((row) => row.split(''));
    this.map = new Map(grid);
  }

  public async part1Solution(): Promise<number | undefined> {
    return this.map.startToEndCost();
  }

  public async part2Solution(): Promise<number | undefined> {
    return this.map.lowestStartingCost();
  }
}

export const Solver = Day12;
export const handler = handlerBase(Solver);

import { DailySolution, handlerBase } from '../../handler';
import { splitToLines } from '../../util';

const enum Direction {
  UP = 'U',
  DOWN = 'D',
  RIGHT = 'R',
  LEFT = 'L',
}

function getDirection(str: string): Direction {
  switch (str) {
    case 'U': return Direction.UP;
    case 'D': return Direction.DOWN;
    case 'R': return Direction.RIGHT;
    case 'L': return Direction.LEFT;
  }
  throw new Error(`Invalid direction: ${str}`);
}

class Movement {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly direction: Direction, public readonly count: number) { }

  toString() {
    return `${this.direction} ${this.count}`;
  }
}

class Point {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly x: number, public readonly y: number) { }

  move(movement: Movement): Point {
    switch (movement.direction) {
      case Direction.UP: return new Point(this.x, this.y + movement.count);
      case Direction.DOWN: return new Point(this.x, this.y - movement.count);
      case Direction.LEFT: return new Point(this.x - movement.count, this.y);
      case Direction.RIGHT: return new Point(this.x + movement.count, this.y);
    }
  }

  isAdjacent(other: Point): boolean {
    return (Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1);
  }

  toString() {
    return `(${this.x},${this.y})`;
  }
}

class Rope {
  private _knots: Point[];
  private _tailLocations: Point[];

  constructor(knots: number) {
    this._knots = [...Array(knots)].map(() => new Point(0, 0));
    this._tailLocations = [];
  }

  private calculateKnot(pos: Point, prevKnot: Point): Point {
    let xDirection: Direction | undefined;
    let yDirection: Direction | undefined;
    if (prevKnot.x > pos.x) {
      xDirection = Direction.RIGHT;
    } else if (prevKnot.x < pos.x) {
      xDirection = Direction.LEFT;
    }
    if (prevKnot.y > pos.y) {
      yDirection = Direction.UP;
    } else if (prevKnot.y < pos.y) {
      yDirection = Direction.DOWN;
    }

    let newTail = pos;
    if (xDirection) { newTail = newTail.move(new Movement(xDirection, 1)); }
    if (yDirection) { newTail = newTail.move(new Movement(yDirection, 1)); }
    return newTail;
  }

  move(movement: Movement): void {
    for (let i = 0; i < movement.count; i++) {
      this._knots[0] = this._knots[0].move(new Movement(movement.direction, 1));
      for (let knot = 1; knot < this._knots.length; knot++) {
        const prevKnot = this._knots[knot - 1];
        const currKnot = this._knots[knot];
        if (!prevKnot.isAdjacent(currKnot)) {
          const newKnot = this.calculateKnot(currKnot, prevKnot);
          this._knots[knot] = newKnot;
        }
      }
      this._tailLocations.push(this._knots.at(-1)!);
    }
  }

  get tailLocations() {
    return [...this._tailLocations];
  }
}

export class Solver extends DailySolution {
  private readonly movements: Movement[];
  constructor(input: string) {
    super(input);
    this.movements = splitToLines(this.rawInput)
      .map(line => line.split(' '))
      .map(([direction, count]) => new Movement(getDirection(direction), Number(count)));
  }

  public get part1Solution(): number | undefined {
    const rope = new Rope(2);
    this.movements.forEach((movement) => rope.move(movement));
    const allLocations = new Set(rope.tailLocations.map(point => point.toString()));
    return allLocations.size;
  }

  public get part2Solution(): number | undefined {
    const rope = new Rope(10);
    this.movements.forEach((movement) => rope.move(movement));
    const allLocations = new Set(rope.tailLocations.map(point => point.toString()));
    return allLocations.size;
  }
}

export const handler = handlerBase(Solver);

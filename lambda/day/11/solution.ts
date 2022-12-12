import { DailySolution, handlerBase } from '../../handler';

enum Operator {
  MUL = '*',
  ADD = '+',
}

function parseOperator(str?: string): Operator {
  switch (str) {
    case '*': return Operator.MUL;
    case '+': return Operator.ADD;
    default: throw new Error(`Invalid operator: ${str}`);
  }
}

class Operation {
  public readonly operator: Operator;
  public readonly operand: number | 'old';

  constructor(operator: Operator, operand: number | string) {
    this.operator = operator;
    if (typeof (operand) === 'number') {
      this.operand = operand;
    } else if (!isNaN(Number(operand))) {
      this.operand = Number(operand);
    } else if (operand === 'old') {
      this.operand = 'old';
    } else {
      throw new Error(`Unsupported operand: ${operand}`);
    }
  }

  apply(worry: number): number {
    const operand = this.operand === 'old' ? worry : this.operand;
    switch (this.operator) {
      case Operator.MUL:
        return worry * operand;
      case Operator.ADD:
        return worry + operand;
    }
  }

  toString() {
    if (this.operator === Operator.MUL) {
      return `is multiplied by ${this.operand === 'old' ? 'itself' : this.operand}`;
    }
    return `increases by ${this.operand}`;
  }
}

type TestResult = { passes: boolean, index: number };
class Test {
  public readonly divisor: number;
  public readonly passIdx: number;
  public readonly failIdx: number;

  constructor(divisor: number, passIdx: number, failIdx: number) {
    this.divisor = divisor;
    this.passIdx = passIdx;
    this.failIdx = failIdx;
  }

  apply(worry: number): TestResult {
    const passes = worry % this.divisor === 0;
    return {
      passes,
      index: passes ? this.passIdx : this.failIdx,
    };
  }
}

class Monkey {
  public number: number;
  private items: number[];
  public operation: Operation;
  public test: Test;
  private _inspectedCount = 0;
  private restless: boolean;

  private static monkeyNumber = /Monkey (?<number>\d+):/;
  private static operation = /new = old (?<operator>[*+]) (?<operand>\d+|old)/;
  private static testDivisor = /divisible by (?<divisor>\d+)/;
  private static testResult = /throw to monkey (?<monkey>\d+)/;

  constructor(
    number: number,
    startingItems: number[],
    operation: Operation,
    test: Test,
    restless?: boolean
  ) {
    this.number = number;
    this.items = [...startingItems];
    this.operation = operation;
    this.test = test;
    this.restless = restless ?? false;
  }

  playTurn(mod: number, allMonkeys: Monkey[]) {
    while (this.items.length) {
      let worry = this.items.shift()!;
      worry = this.inspect(worry);
      if (!this.restless) {
        worry = this.putDown(worry);
      }
      worry = worry % mod;
      const idx = this.pass(worry);

      const toMonkey = allMonkeys.find((monkey) => monkey.number === idx);
      if (!toMonkey) { throw new Error(`Missing Monkey ${idx}`); }
      toMonkey.items.push(worry);
    }
  }

  inspect(worry: number): number {
    this._inspectedCount += 1;
    const newWorry = this.operation.apply(worry);
    return newWorry;
  }

  putDown(worry: number): number {
    const newWorry = Math.floor(worry / 3);
    return newWorry;
  }

  pass(worry: number): number {
    const { passes, index } = this.test.apply(worry);
    const divisor = this.test.divisor;
    return index;
  }

  get inspectedCount(): number {
    return this._inspectedCount;
  }

  get heldItems(): number[] {
    return [...this.items];
  }

  public static fromDescription(desc: string, restless?: boolean): Monkey {
    const lines = desc.split('\n').map((line) => line.trim());
    const number = Number(lines[0].match(this.monkeyNumber)?.groups?.number);
    const startingItems = lines[1].split(':')[1]
      .trim()
      .split(',')
      .map((item) => Number(item.trim()));
    const operation = lines[2].match(this.operation);
    if (!operation) throw new Error(`Invalid operation: ${lines[2]}`);
    const operator = parseOperator(operation?.groups?.operator);
    const operand = operation?.groups?.operand;

    const test = lines[3].match(this.testDivisor)?.groups;
    if (!test) throw new Error(`Invalid test: ${lines[3]}`);
    const divisor = Number(test.divisor);
    const passIdx = Number(lines[4].match(this.testResult)?.groups?.monkey);
    const failIdx = Number(lines[5].match(this.testResult)?.groups?.monkey);

    return new Monkey(
      number,
      startingItems,
      new Operation(operator, operand!),
      new Test(divisor, passIdx, failIdx),
      restless
    );
  }
}

function playRounds(count: number, monkeys: Monkey[]) {
  let mod = 1;
  for (const monkey of monkeys) {
    mod *= monkey.test.divisor;
  }

  for (let i = 0; i < count; i++) {
    for (const monkey of monkeys) {
      monkey.playTurn(mod, monkeys);
    }
  }
}

export class Day11 extends DailySolution {
  // eslint-disable-next-line no-useless-constructor
  constructor(input: string) {
    super(input);
  }

  public get part1Solution(): number | undefined {
    const monkeys = this.rawInput.split('\n\n').map((desc) => Monkey.fromDescription(desc));
    playRounds(20, monkeys);
    const topInspected = monkeys.sort((a, b) => b.inspectedCount - a.inspectedCount);
    return topInspected[0].inspectedCount * topInspected[1].inspectedCount;
  }

  public get part2Solution(): number | undefined {
    const monkeys = this.rawInput.split('\n\n').map((desc) => Monkey.fromDescription(desc, true));
    playRounds(10_000, monkeys);
    const topInspected = monkeys.sort((a, b) => b.inspectedCount - a.inspectedCount);
    return topInspected[0].inspectedCount * topInspected[1].inspectedCount;
  }
}

export const Solver = Day11;
export const handler = handlerBase(Solver);

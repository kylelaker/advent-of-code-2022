import { DailySolution, handlerBase } from '../../handler';
import { splitToLines } from '../../util';

enum InstructionType {
  NOOP = 'noop',
  ADDX = 'addx',
}

abstract class Instruction {
  public abstract get cycles(): number;
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly type: InstructionType) { }
}

class NoopInstruction extends Instruction {
  public readonly cycles = 1;
  constructor() {
    super(InstructionType.NOOP);
  }

  toString() {
    return 'noop';
  }
}

class AddxInstruction extends Instruction {
  public readonly cycles = 2;
  public readonly value: number;

  constructor(value: number) {
    super(InstructionType.ADDX);
    this.value = value;
  }

  toString() {
    return `addx ${this.value}`;
  }
}

function isNoop(instr: Instruction): instr is NoopInstruction {
  return instr.type === InstructionType.NOOP;
}
function isAddx(instr: Instruction): instr is AddxInstruction {
  return instr.type === InstructionType.ADDX;
}
function parseInstrunctions(lines: string[]): Instruction[] {
  return lines.map((line) => {
    if (line === 'noop') {
      return new NoopInstruction();
    }
    if (line.startsWith('addx')) {
      return new AddxInstruction(Number(line.split(' ')[1]));
    }
    throw new Error(`Unsupported instruction: ${line}`);
  });
}

class Cycle {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly number: number, public readonly value: number) { }
}

class Cpu {
  private readonly cycles: Cycle[] = [];
  private _programCounter = 0;

  constructor() {
    this.cycles.push(new Cycle(1, 1));
  }

  private get currentCycle(): Cycle {
    return this.cycles.at(-1)!;
  }

  public signalAt(cycle: number) {
    return this.valueAt(cycle) * cycle;
  }

  public valueAt(cycle: number) {
    return this.cycles[cycle - 1].value;
  }

  public programCounter() {
    return this._programCounter;
  }

  public get cycleCount() {
    return this.cycles.length;
  }

  execute(instruction: Instruction): Cycle[] {
    const last = this.currentCycle;
    const newCycles = [];
    newCycles.push(new Cycle(last.number + 1, last.value));
    if (isAddx(instruction)) {
      newCycles.push(new Cycle(last.number + 2, last.value + instruction.value));
    }
    this._programCounter += 1;
    this.cycles.push(...newCycles);
    return newCycles;
  }
}

class Crt {
  private display: string[][];

  constructor() {
    this.display = [...Array(6)].map(() => [...Array(40)].map(() => '.'));
    this.display[0][0] = '#';
  }

  evaluate(cycles: Cycle[]) {
    for (const cycle of cycles) {
      const rowIdx = Math.floor((cycle.number - 1) / 40);
      const colIdx = (cycle.number - 1) % 40;
      const spritePos = [cycle.value - 1, cycle.value, cycle.value + 1];
      const match = spritePos.some(pos => pos === colIdx);
      if (!match) continue;
      this.display[rowIdx][colIdx] = '#';
    }
  }

  toString() {
    return '\n' + this.display.map((line) => line.join('')).join('\n');
  }
}

class Device {
  public readonly cpu: Cpu;
  public readonly crt: Crt;

  constructor() {
    this.cpu = new Cpu();
    this.crt = new Crt();
  }

  execute(instruction: Instruction) {
    const cycles = this.cpu.execute(instruction);
    this.crt.evaluate(cycles);
  }
}

export class Day10 extends DailySolution {
  private readonly instructions: Instruction[];
  constructor(input: string) {
    super(input);
    this.instructions = parseInstrunctions(splitToLines(this.rawInput));
  }

  public get part1Solution(): number | undefined {
    const device = new Device();
    this.instructions.forEach((instr) => device.execute(instr));
    const { cpu } = device;
    return cpu.signalAt(20) +
      cpu.signalAt(60) +
      cpu.signalAt(100) +
      cpu.signalAt(140) +
      cpu.signalAt(180) +
      cpu.signalAt(220);
  }

  public get part2Solution(): string | undefined {
    const device = new Device();
    this.instructions.forEach((instr) => device.execute(instr));
    return device.crt.toString();
  }
}

export const Solver = Day10;
export const handler = handlerBase(Solver);

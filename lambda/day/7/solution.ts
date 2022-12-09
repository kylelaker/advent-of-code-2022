import { DailySolution, handlerBase } from '../../handler';
import { splitToLines } from '../../util';

abstract class FileSystemNode {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly name: string) { }

  abstract get size(): number;
}

class File extends FileSystemNode {
  constructor(public readonly name: string, public readonly size: number) { super(name); }

  toJSON() {
    return { name: this.name, size: this.size, type: 'File' };
  }
}

type FileSystemQuery = (node: FileSystemNode) => boolean;

class Directory extends FileSystemNode {
  private readonly children: FileSystemNode[] = [];
  // eslint-disable-next-line no-use-before-define
  private readonly parent: Directory;

  constructor(name: string, parent?: Directory) {
    super(name);
    this.parent = parent ?? this;
  }

  addChild(node: FileSystemNode) {
    this.children.push(node);
  }

  get isRoot(): boolean {
    return this.parent === this;
  }

  get size(): number {
    return this.children.reduce((acc, curr) => acc + curr.size, 0);
  }

  get(name: string): FileSystemNode | undefined {
    if (name === '..') {
      return this.parent;
    }
    return this.children.find((child) => child.name === name);
  }

  toJSON() {
    return { name: this.name, children: this.children, size: this.size, type: 'Directory' };
  }

  private depthTraversal(): FileSystemNode[] {
    return this.children.flatMap((node) => {
      return [node, ...(node instanceof Directory ? node.depthTraversal() : [])];
    });
  }

  query(query: FileSystemQuery): FileSystemNode[] {
    return this.depthTraversal().filter((node) => query(node));
  }
}

class FileSystem extends FileSystemNode {
  private readonly root: Directory;
  constructor() {
    super('');
    this.root = new Directory('/');
  }

  get size(): number {
    return this.root.size;
  }

  public static fromCommands(input: string[]): FileSystem {
    const fileSystem = new FileSystem();
    let directory: Directory = fileSystem.root;
    for (const line of input) {
      if (line.startsWith('$ cd')) {
        const name = line.split(' ').at(-1) ?? '/';
        if (name === '/') { directory = fileSystem.root; continue; }
        const result = directory.get(name);
        if (!result || !(result instanceof Directory)) {
          throw new Error(`not a directory: ${name}`);
        }
        directory = result;
      } else if (line.startsWith('$ ls')) {
        continue;
      } else if (line.startsWith('dir')) {
        const dir = new Directory(line.split(' ')[1], directory);
        directory.addChild(dir);
      } else {
        const data = line.split(' ');
        const file = new File(data[1], Number(data[0]));
        directory.addChild(file);
      }
    }
    return fileSystem;
  }

  query(query: FileSystemQuery): FileSystemNode[] {
    return this.root.query(query);
  }
}

export class Day7 extends DailySolution {
  private readonly filesystem: FileSystem;

  constructor(input: string) {
    super(input);
    this.filesystem = FileSystem.fromCommands(splitToLines(this.rawInput));
  }

  public get part1Solution(): number | undefined {
    return this.filesystem
      .query((node) => node instanceof Directory && node.size < 100_000)
      .reduce((sum, { size }) => sum + size, 0);
  }

  public get part2Solution(): number | undefined {
    const totalSpace = 70_000_000;
    const required = 30_000_000;
    const available = totalSpace - this.filesystem.size;
    const toDelete = required - available;
    return this.filesystem
      .query((node) => node instanceof Directory)
      .reduce((min, { size }) => size < toDelete ? min : Math.min(min, size), this.filesystem.size);
  }
}

export const Solver = Day7;
export const handler = handlerBase(Solver);

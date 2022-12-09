import { Solver } from './solution';
import path from 'path';
import fs from 'fs';

function readTestData(name: string): string {
  return fs.readFileSync(path.join(__dirname, '__inputs__', `${name}.txt`)).toString('utf8');
}
const sample = new Solver(readTestData('sample'));
const input = new Solver(readTestData('personal'));

describe('Day 9, Part 1', () => {
  it('returns the correct result for sample input', () => {
    expect(sample.part1Solution).toBe(13);
  });

  it('returns the correct result for personal input', () => {
    expect(input.part1Solution).toBe(6026);
  });
});

describe('Day 9, Part 2', () => {
  it('returns the correct result for sample input', () => {
    expect(sample.part2Solution).toBe(1);
  });

  it('return the correct result for the additional input', () => {
    const input = 'R 5\nU 8\nL 8\nD 3\nR 17\nD 10\nL 25\nU 20';
    expect(new Solver(input).part2Solution).toBe(36);
  });

  it('return the correct result for personal input', () => {
    expect(input.part2Solution).toBe(2273);
  });
});

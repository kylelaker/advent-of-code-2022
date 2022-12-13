import middy from '@middy/core';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import {
  formatAsyncSolution,
  formatError,
  formatSolution,
  INVALID_INPUT,
  UNEXPECTED_ERROR,
} from './responses';
const tracer = new Tracer();
const logger = new Logger();

export const middlewares = [
  injectLambdaContext(logger, { logEvent: true }),
  captureLambdaHandler(tracer),
];

export interface DailySolutionConstructor {
  // eslint-disable-next-line no-use-before-define
  new(input: string): DailySolution | AsyncDailySolution;
}

/**
 * Handle solving a specific day's challenge.
 *
 * This class should be specialized with the solution for each day. The implementation
 * should be returned by `part1Solution` and `part2Solution` respectively. These methods
 * are not abstract; by default they return `undefined` until the solution is
 * implemented.
 */
export abstract class DailySolution {
  /**
   * The input that was provided by the user.
   */
  public readonly rawInput: string;

  constructor(input: string) {
    this.rawInput = input;
  }

  /**
   * The solution to the first part of the day's challenge.
   */
  public get part1Solution(): number | string | undefined {
    return undefined;
  }

  /**
   * The solution to the second part of the day's challenge.
   */
  public get part2Solution(): number | string | undefined {
    return undefined;
  }
}

export abstract class AsyncDailySolution {
  /**
   * The input that was provided by the user.
   */
  public readonly rawInput: string;

  constructor(input: string) {
    this.rawInput = input;
  }

  /**
   * The solution to the first part of the day's challenge.
   */
  public async part1Solution(): Promise<number | string | undefined> {
    return undefined;
  }

  /**
   * The solution to the second part of the day's challenge.
   */
  public async part2Solution(): Promise<number | string | undefined> {
    return undefined;
  }
}

/**
 * Wrap the daily solution in a function suitable to act as a Lambda function handler.
 *
 * This will properly pass the HTTP request body to the `input` parameter of the
 * given {@link DailySolution}'s constructor and will properly initialize the instance.
 * Additionally, middleware are added to support logging and tracing.
 */
export function handlerBase(Solver: DailySolutionConstructor): APIGatewayProxyHandlerV2 {
  const fn: APIGatewayProxyHandlerV2 = async(event, context) => {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify(INVALID_INPUT),
      };
    }
    try {
      const solver = new Solver(event.body);
      if (solver instanceof DailySolution) {
        return {
          statusCode: 200,
          body: JSON.stringify(
            formatSolution(solver.rawInput, solver.part1Solution, solver.part2Solution)
          ),
        };
      }
      if (solver instanceof AsyncDailySolution) {
        return {
          statusCode: 200,
          body: JSON.stringify(
            await formatAsyncSolution(
              solver.rawInput,
              solver.part1Solution(),
              solver.part2Solution()
            )
          ),
        };
      }
      return {
        statusCode: 500,
        body: JSON.stringify(formatError('Internal error')),
      };
    } catch (err) {
      logger.error('Unexpected error in solution', err as Error);
      return {
        statusCode: 500,
        body: JSON.stringify(UNEXPECTED_ERROR),
      };
    }
  };
  return middy(fn).use(middlewares);
}

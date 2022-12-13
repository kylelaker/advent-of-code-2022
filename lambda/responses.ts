type ErrorResponse = {
  type: 'Error';
  message: string;
};

type SuccessResponse = {
  type: 'Solution';
  input: string;
  solution: {
    part1?: number | string;
    part2?: number | string;
  };
};

export type Response = ErrorResponse | SuccessResponse;

export function formatError(message: string): ErrorResponse {
  return { type: 'Error', message };
}
export const NOT_IMPLEMENTED = formatError('This challenge has not been implemented yet');
export const INVALID_INPUT = formatError('The provided input is invalid or missing');
export const UNEXPECTED_ERROR = formatError(
  'An unexpected error occurred while calculating the solution'
);

export async function formatAsyncSolution(
  input: string,
  part1: Promise<number | string | undefined>,
  part2: Promise<number | string | undefined>
): Promise<SuccessResponse> {
  const p1 = await part1;
  const p2 = await part2;
  return {
    type: 'Solution',
    input,
    solution: {
      part1: p1,
      part2: p2,
    },
  };
}

export function formatSolution(
  input: string,
  part1?: number | string,
  part2?: number | string
): SuccessResponse {
  return {
    type: 'Solution',
    input,
    solution: {
      part1,
      part2,
    },
  };
}

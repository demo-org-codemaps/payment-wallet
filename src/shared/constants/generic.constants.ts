export const SERVER_RESPONSES: Record<string, Record<string, string>> = {
  OK: {
    code: 'OK',
    message: 'Your request has been processed successfully',
  },
  SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong, Please try again later!',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Something is amiss, Please try with different parameters',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested resource could not be found but may be available again in the future',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this operation',
  },
};

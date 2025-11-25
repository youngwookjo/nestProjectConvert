import type { ErrorRequestHandler } from 'express';
import { ApiError } from '@errors/ApiError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError;

  const status = isApiError ? err.status : 500;
  const code = isApiError ? err.code : 'INTERNAL';
  const message = err instanceof Error ? err.message : 'Internal server error';
  const details = isApiError ? err.details : undefined;

  const payload: Record<string, any> = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  console.error('[Error]', err);
  return res.status(status).json(payload);
};

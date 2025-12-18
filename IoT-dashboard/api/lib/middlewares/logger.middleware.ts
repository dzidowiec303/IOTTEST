import { Request, Response, NextFunction } from 'express';

const loggerMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  const start = Date.now();
  console.log(`[MY LOGGER] ${request.method} ${request.url} - start at ${new Date().toISOString()}`);

  response.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[MY LOGGER] ${request.method} ${request.url} - ${response.statusCode} - ${duration}ms`
    );
  });

  next();
};

export default loggerMiddleware;
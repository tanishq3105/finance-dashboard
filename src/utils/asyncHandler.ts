import { Request as ExpressRequest, Response, NextFunction } from "express";

type AsyncRequestHandler = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;
const asyncHandler = (requestHandler: AsyncRequestHandler) => {
  return (req: ExpressRequest, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export { asyncHandler };

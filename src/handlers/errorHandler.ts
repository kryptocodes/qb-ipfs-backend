import { Response } from "express";

export const errorHandler = (
  res: Response,
  statusCode: number,
  errorMessage: string
) => {
  return res.status(statusCode).send({ status:statusCode , message: errorMessage });
};
  
/// <reference path="../../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import { IUser } from "../modules/models/user.model";

export const auth = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  let token =
    request.headers["x-access-token"] ||
    request.headers["authorization"];

  if (token && typeof token === "string") {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    try {
      jwt.verify(
        token,
        config.jwtSecret,
        (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
          if (err) {
            return response.status(400).send("Invalid token.");
          }
          const user: IUser = decoded as IUser;
          request.user = user; // teraz TS nie wyrzuci błędu
          next();
        }
      );
    } catch (ex) {
      return response.status(400).send("Invalid token.");
    }
  } else {
    return response.status(401).send("Access denied. No token provided.");
  }
};

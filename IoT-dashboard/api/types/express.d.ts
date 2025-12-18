import { IUser } from "../lib/modules/models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
export interface IUser {
   _id?: string;
   email: string;
   login: string;
   role?: string;
   active?: boolean;
   isAdmin?: boolean;
}

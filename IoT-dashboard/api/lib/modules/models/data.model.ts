export interface IRoom {
    temperature: number;
    brightness: number;
    humidity: number;
    roomId: number;
    userId: string;
    readingDate?: Date;
}

export type Query<T> = {
    [key: string]: T;
};
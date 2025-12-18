import { Schema, model } from 'mongoose';
import { IRoom } from "../models/data.model";

export const RoomSchema: Schema = new Schema({
    temperature: { type: Number, required: true },
    brightness: { type: Number, required: true },
    humidity: { type: Number, required: true },
    roomId: { type: Number, required: true },
    userId: { type: String, required: true },
    readingDate: { type: Date, default: Date.now }
});

export default model<IRoom>('Room', RoomSchema);
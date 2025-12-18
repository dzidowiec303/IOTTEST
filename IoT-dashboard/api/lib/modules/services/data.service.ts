import RoomModel from "../schemas/data.schema";
import { IRoom } from "../models/data.model";

export default class RoomService {
  public async createRoom(roomParams: IRoom) {
    try {
      const roomModel = new RoomModel(roomParams);
      await roomModel.save();
    } catch (error) {
      console.error("Błąd podczas tworzenia danych pokoju:", error);
      throw new Error("Błąd podczas tworzenia danych pokoju");
    }
  }

  public async queryByRoomId(roomId: number) {
    try {
      const data = await RoomModel.find({ roomId });
      return data;
    } catch (error) {
      throw new Error(`Query failed: ${error}`);
    }
  }

  public async getLatestByRoomId(roomId: number) {
    try {
      const latestEntry = await RoomModel.find({ roomId })
        .limit(1)
        .sort({ readingDate: -1 });
      return latestEntry.length ? latestEntry[0] : null;
    } catch (error) {
      throw new Error(`Get failed: ${error}`);
    }
  }

  public async getAllRoomsLatest(supportedRoomsNum: number) {
    try {
      const latestData: IRoom[] = [];
      await Promise.all(
        Array.from({ length: supportedRoomsNum }, async (_, i) => {
          try {
            const latestEntry = await RoomModel.find({ roomId: i })
              .limit(1)
              .sort({ readingDate: -1 });
            if (latestEntry.length) {
              latestData.push(latestEntry[0]);
            }
          } catch (error) {
            console.error(
              `Błąd podczas pobierania danych dla pokoju ${i}: ${error.message}`
            );
          }
        })
      );
      return latestData;
    } catch (error) {
      throw new Error(`getAllRoomsLatest failed: ${error}`);
    }
  }

  public async deleteByRoomId(roomId: number) {
    try {
      await RoomModel.deleteMany({ roomId });
    } catch (error) {
      throw new Error(`Delete failed: ${error}`);
    }
  }

  public async deleteRoomDataInRange(roomId: number, from: Date, to: Date) {
    try {
      await RoomModel.deleteMany({
        roomId,
        readingDate: { $gte: from, $lte: to },
      });
    } catch (error) {
      throw new Error(`Delete in range failed: ${error}`);
    }
  }

  public async getLastHourDataByRoomId(
    roomId: number,
    minutes: number = 60
  ) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    console.log(`[DEBUG] Now: ${new Date().toISOString()}`);
    console.log(`[DEBUG] Since: ${since.toISOString()}`);

    return RoomModel.find(
      {
        roomId,
        readingDate: { $gte: since },
      }
    )
      .sort({ readingDate: 1 })
      .lean();
  }

}

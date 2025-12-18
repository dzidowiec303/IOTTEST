import Controller from "../interfaces/controller.interface";
import { Request, Response, NextFunction, Router } from "express";

import RoomService from "../modules/services/data.service";

import { config } from "../config";

import Joi = require("joi");
import { auth } from "../middlewares/auth.middleware";

class RoomController implements Controller {
  public path = "/api/room";
  public router = Router();

  constructor(private roomService: RoomService) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/latest`,
      auth,
      this.getLatestReadingsFromAllRooms
    );

    this.router.get(
      `${this.path}/debug/:id`,
      this.debugRoomData
    );

    this.router.get(
      `${this.path}/:id/hour`,
      auth,
      this.getLastHourDataByRoom
    );

    this.router.get(
      `${this.path}/:id/latest`,
      auth,
      this.getLatestDataFromRoom
    );

    this.router.post(`${this.path}/:id`, auth, this.addRoomData);

    this.router.get(
      `${this.path}/:id`,
      auth,
      this.getAllRoomData
    );

    this.router.delete(
      `${this.path}/:id`,
      auth,
      this.deleteElementFromRoom
    );

    this.router.delete(
      `${this.path}/:id/range`,
      auth,
      this.deleteDataInRange
    );
  }

  private getLastHourDataByRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const roomId = Number(id);
      if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }

      const data = await this.roomService.getLastHourDataByRoomId(
        roomId,
        60
      );

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  private deleteDataInRange = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = request.params;
      const roomIdNum = Number(id);
      if (isNaN(roomIdNum)) {
        return response.status(400).json({ message: "Invalid room ID" });
      }

      const { fromDate, toDate } = request.body;

      if (!fromDate || !toDate) {
        return response
          .status(400)
          .json({ message: "Missing fromDate or toDate in request body." });
      }

      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return response
          .status(400)
          .json({ message: "Invalid date format for fromDate or toDate." });
      }

      await this.roomService.deleteRoomDataInRange(roomIdNum, from, to);

      response.status(200).json({
        message: `Data for room ${roomIdNum} deleted from ${from.toISOString()} to ${to.toISOString()}.`,
      });
    } catch (error) {
      next(error);
    }
  };

  private getAllRoomData = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = request.params;
      const roomId = Number(id);
      if (isNaN(roomId)) {
        return response.status(400).json({ message: "Invalid room ID" });
      }
      const allData = await this.roomService.queryByRoomId(roomId);
      response.status(200).json(allData);
    } catch (error) {
      next(error);
    }
  };

  private addRoomData = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { room } = request.body;
    const { id } = request.params;

    const roomId = parseInt(id, 10);
    if (isNaN(roomId)) {
      return response.status(400).json({ error: "Invalid room ID" });
    }

    const schema = Joi.object({
      room: Joi.object({
        temperature: Joi.number().required(),
        brightness: Joi.number().min(0).max(100).required(),
        humidity: Joi.number().required(),
        userId: Joi.string().required(),
      }).required(),
      roomId: Joi.number()
        .integer()
        .positive()
        .valid(parseInt(id, 10))
        .required(),
    });

    try {
      const validatedData = await schema.validateAsync({ room, roomId });

      const data = {
        temperature: validatedData.room.temperature,
        brightness: validatedData.room.brightness,
        humidity: validatedData.room.humidity,
        roomId: validatedData.roomId,
        userId: validatedData.room.userId,
        readingDate: new Date(),
      };

      await this.roomService.createRoom(data);
      response.status(201).json(data);
    } catch (error: any) {
      console.error(`Validation Error: ${error.message}`);
      response
        .status(400)
        .json({ error: "Invalid input data.", details: error.message });
    }
  };

  private getLatestDataFromRoom = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = request.params;
      const roomIdNum = Number(id);
      if (isNaN(roomIdNum)) {
        return response.status(400).json({ message: "Invalid room ID" });
      }
      const latestData = await this.roomService.getLatestByRoomId(roomIdNum);
      if (!latestData) {
        return response.status(404).json({ message: "Data not found" });
      }
      response.status(200).json(latestData);
    } catch (error) {
      next(error);
    }
  };

  private getLatestReadingsFromAllRooms = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const latestData = await this.roomService.getAllRoomsLatest(
        config.supportedDevicesNum
      );
      response.status(200).json(latestData);
    } catch (error) {
      next(error);
    }
  };

  private deleteElementFromRoom = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = request.params;
      const roomIdNum = Number(id);
      if (isNaN(roomIdNum)) {
        return response.status(400).json({ message: "Invalid room ID" });
      }
      await this.roomService.deleteByRoomId(roomIdNum);
      response
        .status(200)
        .json({ message: `Data for room ${roomIdNum} deleted.` });
    } catch (error) {
      next(error);
    }
  }

  private debugRoomData = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = request.params;
      const roomIdNum = Number(id);

      if (isNaN(roomIdNum)) {
        return response.status(400).json({ error: "Invalid room ID" });
      }

      const data = await this.roomService.queryByRoomId(roomIdNum);

      response.status(200).json({
        roomId: roomIdNum,
        count: data.length,
        documents: data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default RoomController;

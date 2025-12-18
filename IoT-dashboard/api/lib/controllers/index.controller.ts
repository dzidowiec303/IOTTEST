import Controller from "../interfaces/controller.interface";
import { Request, Response, Router } from "express";
import path from "path";
import mongoose from "mongoose";

import { Server } from "socket.io";

class IndexController implements Controller {
    public path = "/*";
    public router = Router();

    constructor(private io: Server) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.serveIndex);

        this.router.get("/test-db-connection", this.testDbConnection);
    }

    private serveIndex = async (request: Request, response: Response) => {
        // If the unmatched request is for an API path, return JSON 404
        if (request.path.startsWith("/api")) {
            return response.status(404).json({ message: "API route not found" });
        }

        response.sendFile(path.join(__dirname, "..", "public", "index.html"));
    };

    private testDbConnection = async (request: Request, response: Response) => {
        const state = mongoose.connection.readyState;
        /*
              0 = disconnected
              1 = connected
              2 = connecting
              3 = disconnecting
            */
        if (state === 1) {
            response.status(200).send("MongoDB is connected!");
        } else {
            response.status(500).send("MongoDB is NOT connected!");
        }
    };
}

export default IndexController;

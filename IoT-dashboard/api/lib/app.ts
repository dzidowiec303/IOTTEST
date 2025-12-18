import express from 'express';
import { config } from './config';
import Controller from "./interfaces/controller.interface";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import loggerMiddleware from './middlewares/logger.middleware';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

class App {
    public app: express.Application;
    public server: http.Server;
    public io: Server;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.app.use(cors({
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
            credentials: true,
        }));

        this.server = http.createServer(this.app);

        this.io = new Server(this.server, {
            cors: {
                origin: 'http://localhost:5173',
            },
        });

        this.initializeMiddlewares();
        this.initializeControllers(controllers);

        this.connectToDatabase();
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParser.json());
        this.app.use(loggerMiddleware);

        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token');
            next();
        });
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });

        // Error handler - musi być na końcu
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Error:', err);
            res.status(err.status || 500).json({
                error: err.message || 'Internal Server Error',
                message: err.message || 'Internal Server Error',
            });
        });
    }

    public listen(): void {
        this.server.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
}
export default App;
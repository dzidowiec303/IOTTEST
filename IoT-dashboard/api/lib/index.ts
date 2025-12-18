import App from "./app";
import UserController from "./controllers/user.controller";
import RoomController from "./controllers/data.controller";
import IndexController from "./controllers/index.controller";

import UserService from "./modules/services/user.service";
import PasswordService from "./modules/services/password.service";
import TokenService from "./modules/services/token.service";
import { EmailService } from "./modules/services/email.service";
import RoomService from "./modules/services/data.service";

const userService = new UserService();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const emailService = new EmailService();
const roomService = new RoomService();

import express from "express";
import http from "http";
import { Server } from "socket.io";

const expressApp = express();
const server = http.createServer(expressApp);
const io = new Server(server, {
    cors: { origin: "*" },
});

const app: App = new App([
    new UserController(userService, passwordService, tokenService, emailService),
    new RoomController(roomService),
    new IndexController(io), // Must be last because it has wildcard path "/*"
]);

app.listen();

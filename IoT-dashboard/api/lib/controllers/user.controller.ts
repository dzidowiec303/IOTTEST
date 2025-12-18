import Controller from "../interfaces/controller.interface";
import { Request, Response, NextFunction, Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";

import { EmailService } from "../modules/services/email.service";

class UserController implements Controller {
    public path = "/api/user";
    public router = Router();

    constructor(
        private userService: UserService,
        private passwordService: PasswordService,
        private tokenService: TokenService,
        private emailService: EmailService
    ) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.delete(
            `${this.path}/logout/:userId`,
            auth,
            this.removeHashSession
        );
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
    }

    private resetPassword = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { emailOrName } = request.body;

        if (!emailOrName) {
            return response
                .status(400)
                .json({ error: "Email or username is required" });
        }

        try {
            const user = await this.userService.getByEmailOrName(emailOrName);
            if (!user) {
                return response.status(404).json({ error: "User not found" });
            }

            const newPassword = this.generateRandomPassword();

            const hashedPassword = await this.passwordService.hashPassword(
                newPassword
            );

            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword,
            });

            await this.emailService.sendResetPasswordEmail(user.email, newPassword);

            response
                .status(200)
                .json({ message: "New password has been sent to your email" });
        } catch (error) {
            console.error(`Reset Password Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };

    private generateRandomPassword(length = 10): string {
        const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    private authenticate = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { login, password } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            const isAuthorized = await this.passwordService.authorize(
                user._id,
                password
            );
            if (!isAuthorized) {
                return response.status(401).json({ error: "Unauthorized" });
            }

            const token = await this.tokenService.create(user);
            const tokenData = this.tokenService.getToken(token);
            response.status(200).json({
                token: tokenData.token,
                userId: user._id,
            });
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: "Unauthorized" });
        }
    };

    private createNewOrUpdate = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const userData = request.body;
        console.log("userData", userData);
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(
                    userData.password
                );
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword,
                });
            }
            response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: "Bad request", value: error.message });
        }
    };

    private removeHashSession = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { userId } = request.params;
        try {
            const result = await this.tokenService.remove(userId);
            console.log("aaa", result);
            response.status(200).json(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: "Unauthorized" });
        }
    };
}

export default UserController;

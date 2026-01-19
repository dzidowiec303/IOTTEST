import Controller from "../interfaces/controller.interface";
import { Request, Response, NextFunction, Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { admin } from "../middlewares/admin.middleware";
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import { config } from "../config";

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
        this.router.post(`${this.path}/admin/create`, admin, this.createUserByAdmin);
        this.router.delete(
            `${this.path}/logout/:userId`,
            auth,
            this.removeHashSession
        );
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
        this.router.get(`${this.path}/all`, admin, this.getAllUsers);
        this.router.get(`${this.path}/:id`, admin, this.getUserById);
        this.router.delete(`${this.path}/:id`, admin, this.deleteUserById);
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
            // Check if it's superadmin
            const isSuperAdmin = login === config.superAdminLogin && password === config.superAdminPassword;

            let user = await this.userService.getByEmailOrName(login);
            
            if (isSuperAdmin) {
                // Create or get superadmin user
                if (!user) {
                    user = await this.userService.createNewOrUpdate({
                        email: config.superAdminLogin + "@admin.local",
                        login: config.superAdminLogin,
                        role: "admin",
                        isAdmin: true,
                        active: true,
                    });
                    const hashedPassword = await this.passwordService.hashPassword(password);
                    await this.passwordService.createOrUpdate({
                        userId: user._id,
                        password: hashedPassword,
                    });
                } else {
                    // Update to admin if needed
                    if (!user.isAdmin) {
                        user = await this.userService.createNewOrUpdate({
                            _id: user._id,
                            email: user.email,
                            login: user.login,
                            role: "admin",
                            isAdmin: true,
                            active: true,
                        });
                    }
                }
                const token = await this.tokenService.create(user);
                const tokenData = this.tokenService.getToken(token);
                return response.status(200).json({
                    token: tokenData.token,
                    userId: user._id,
                });
            }

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
            // Wymuś, że zwykli użytkownicy NIE mogą być adminem
            // Tylko superadmin może tworzyć adminów
            if (userData.isAdmin === true) {
                userData.isAdmin = false;
            }
            userData.role = 'user'; // Zwykli użytkownicy zawsze są "user"
            
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

    private getAllUsers = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const users = await this.userService.getAll();
            response.status(200).json(users);
        } catch (error) {
            console.error(`Get All Users Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };

    private getUserById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { id } = request.params;
        try {
            const user = await this.userService.getById(id);
            if (!user) {
                return response.status(404).json({ error: "User not found" });
            }
            response.status(200).json(user);
        } catch (error) {
            console.error(`Get User By ID Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };

    private deleteUserById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { id } = request.params;
        try {
            const result = await this.userService.deleteById(id);
            if (!result) {
                return response.status(404).json({ error: "User not found" });
            }
            response.status(200).json({ message: "User deleted successfully", user: result });
        } catch (error) {
            console.error(`Delete User Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };

    private createUserByAdmin = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { email, password, login, isAdmin } = request.body;

        // Validate required fields
        if (!email || !password || !login) {
            return response.status(400).json({
                error: "Email, password, and login are required",
            });
        }

        try {
            // Check if user already exists
            const existingUser = await this.userService.getByEmailOrName(email);
            if (existingUser) {
                return response.status(400).json({ error: "User already exists" });
            }

            // Create new user with admin control
            const user = await this.userService.createNewOrUpdate({
                email,
                login,
                role: isAdmin ? "admin" : "user",
                isAdmin: isAdmin ? true : false,
                active: true,
            });

            // Hash and store password
            const hashedPassword = await this.passwordService.hashPassword(password);
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword,
            });

            response.status(201).json({
                message: "User created successfully",
                user: {
                    _id: user._id,
                    email: user.email,
                    login: user.login,
                    role: user.role,
                    isAdmin: user.isAdmin,
                    active: user.active,
                },
            });
        } catch (error) {
            console.error(`Create User By Admin Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default UserController;

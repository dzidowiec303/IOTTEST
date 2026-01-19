import Controller from "../interfaces/controller.interface";
import { Request, Response, NextFunction, Router } from "express";
import { admin } from "../middlewares/admin.middleware";
import AuditService from "../modules/services/audit.service";

class AuditController implements Controller {
    public path = "/api/audit";
    public router = Router();

    constructor(private auditService: AuditService) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/logs`, admin, this.getLogs);
        this.router.get(`${this.path}/logs/action/:action`, admin, this.getLogsByAction);
        this.router.get(`${this.path}/logs/user/:userId`, admin, this.getLogsByUserId);
    }

    private getLogs = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const limit = request.query.limit ? parseInt(request.query.limit as string) : 100;
            const skip = request.query.skip ? parseInt(request.query.skip as string) : 0;
            
            const logs = await this.auditService.getAll(limit, skip);
            response.status(200).json(logs);
        } catch (error) {
            console.error(`Get Logs Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };

    private getLogsByAction = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { action } = request.params;
        try {
            const limit = request.query.limit ? parseInt(request.query.limit as string) : 100;
            const skip = request.query.skip ? parseInt(request.query.skip as string) : 0;
            
            const logs = await this.auditService.getByAction(action, limit, skip);
            response.status(200).json(logs);
        } catch (error) {
            console.error(`Get Logs By Action Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };

    private getLogsByUserId = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { userId } = request.params;
        try {
            const limit = request.query.limit ? parseInt(request.query.limit as string) : 100;
            const skip = request.query.skip ? parseInt(request.query.skip as string) : 0;
            
            const logs = await this.auditService.getByUserId(userId, limit, skip);
            response.status(200).json(logs);
        } catch (error) {
            console.error(`Get Logs By User ID Error: ${error.message}`);
            response.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default AuditController;

import "dotenv/config";
export const config = {
    port: Number(process.env.PORT) || 3100,
    supportedDevicesNum: 17,
    databaseUrl: process.env.MONGODB_URI!, 
    jwtSecret: process.env.JWT_SECRET!,
    superAdminLogin: process.env.SUPER_ADMIN_LOGIN || "admin",
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || "admin123",
};

import prisma from "../db/index.js";

export const healthCheck = async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            success: true,
            message: "MindCare API and database are working",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
};


export const testUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
            },
        });

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });

    } catch (error) {
        console.error("User query error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to read users",
        });
    }
};
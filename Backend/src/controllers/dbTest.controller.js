import prisma from "../db/index.js";

export const createTestUser = async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                passwordHash: "TEST_HASH",
                role: req.body.role || "STUDENT",
                status: "ACTIVE",
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Test user created",
            user,
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create test user",
            error: error.message
        });
    }
};
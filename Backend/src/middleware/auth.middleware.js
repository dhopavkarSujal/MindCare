import supabase from "../db/supabase.js";
import prisma from "../db/prisma.js";

export async function authMiddleware(req, res, next) {
  try {
    // ==========================================
    // 1. Authorization Header
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is required.",
      });
    }

    // ==========================================
    // 2. Bearer Token
    // ==========================================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header must use Bearer token.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing.",
      });
    }

    // ==========================================
    // 3. Verify Token with Supabase
    // ==========================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    // ==========================================
    // 4. Validate Email
    // ==========================================

    if (!user.email) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email is missing.",
      });
    }

    const email = user.email.trim().toLowerCase();

    // ==========================================
    // 5. First find by Supabase Auth ID
    // ==========================================

    let dbUser = await prisma.user.findUnique({
      where: {
        supabaseAuthId: user.id,
      },
    });

    // ==========================================
    // 6. If not found, find by email
    // ==========================================

    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    // ==========================================
    // 7. Existing application user found
    // ==========================================

    if (dbUser) {

      // ------------------------------------------
      // Security check:
      // If this Prisma user is already linked to
      // another Supabase account, do not relink it.
      // ------------------------------------------

      if (
        dbUser.supabaseAuthId &&
        dbUser.supabaseAuthId !== user.id
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This application account is already linked to another authentication account.",
        });
      }

      // ------------------------------------------
      // Link existing Prisma user to Supabase
      // ------------------------------------------

      if (!dbUser.supabaseAuthId) {
        dbUser = await prisma.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            supabaseAuthId: user.id,
            email,
          },
        });
      }
    }

    // ==========================================
    // 8. No application user exists
    // ==========================================

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          supabaseAuthId: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null,
        },
      });
    }

    // ==========================================
    // 9. Attach authenticated user
    // ==========================================

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      supabaseUser: user,
    };

    next();

  } catch (error) {

    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication service error.",
    });
  }
}
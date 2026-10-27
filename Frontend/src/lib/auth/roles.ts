import { safeInternalPath } from "@/lib/auth/navigation";

export type MindCareRole = "STUDENT" | "COUNSELOR" | "ADMIN";

export function parseMindCareRole(value: unknown): MindCareRole | null {
  return value === "STUDENT" || value === "COUNSELOR" || value === "ADMIN"
    ? value
    : null;
}

export function getRoleHomePath(role: MindCareRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COUNSELOR":
      return "/counselor";
    case "STUDENT":
      return "/dashboard";
  }
}

/**
 * Honour a return path only when it belongs to the authenticated role.
 * A student cannot use ?next=/admin and a staff account does not end up
 * inside the student app shell because of an old redirect cookie.
 */
export function getRoleDestination(
  role: MindCareRole,
  candidate?: string | null,
): string {
  const fallback = getRoleHomePath(role);
  const path = safeInternalPath(candidate, fallback);

  if (role === "ADMIN") {
    return path === "/admin" || path.startsWith("/admin/") ? path : fallback;
  }

  if (role === "COUNSELOR") {
    return path === "/counselor" || path.startsWith("/counselor/")
      ? path
      : fallback;
  }

  // Staff-only pages must never be selected as a student's return path.
  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/counselor" ||
    path.startsWith("/counselor/")
  ) {
    return fallback;
  }

  return path;
}

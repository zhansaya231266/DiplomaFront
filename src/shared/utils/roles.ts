export type AppRole = "SuperAdmin" | "Admin" | "Employee";

export const normalizeRole = (role?: string | null): AppRole => {
  const normalized = role?.trim().toLowerCase();

  if (
    normalized === "sysadmin" ||
    normalized === "superadmin" ||
    normalized === "super_admin"
  ) {
    return "SuperAdmin";
  }

  if (normalized === "admin") {
    return "Admin";
  }

  return "Employee";
};

export type AppRole = "SuperAdmin" | "Admin" | "Employee";

export const normalizeRole = (role?: string | null): AppRole => {
  const normalized = role?.trim().toLowerCase();
  const compact = normalized?.replace(/^role[_-]?/, "").replace(/[^a-z]/g, "");

  if (
    normalized === "sysadmin" ||
    normalized === "sys_admin" ||
    normalized === "system_admin" ||
    normalized === "systemadmin" ||
    normalized === "superadmin" ||
    normalized === "super_admin" ||
    compact === "sysadmin" ||
    compact === "systemadmin" ||
    compact === "superadmin"
  ) {
    return "SuperAdmin";
  }

  if (
    normalized === "admin" ||
    normalized === "org_admin" ||
    normalized === "organization_admin" ||
    compact === "admin" ||
    compact === "orgadmin" ||
    compact === "organizationadmin"
  ) {
    return "Admin";
  }

  return "Employee";
};

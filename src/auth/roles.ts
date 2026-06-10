import type { Role } from "./types";

export const canWrite = (role: Role): boolean => role !== "guest";

export const canManageUsers = (role: Role): boolean => role === "admin";

export const canManageOrderStatuses = (role: Role): boolean => role === "admin";

export const canWriteBusinessRecords = (role: Role): boolean => role !== "guest";

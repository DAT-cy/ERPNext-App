import { logoutERP, getLoggedUser, getSid as getSidFromConfig } from '../../../config/auth';
import type { LoggedUser } from "../../home/model/home.types";

export async function logout(): Promise<void> {
  await logoutERP();
}

export async function getSid(): Promise<string | null> {
  return getSidFromConfig();
}

export async function getCurrentUser(): Promise<LoggedUser> {
  return getLoggedUser();
}
  
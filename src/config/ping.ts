// src/api/ping.ts
import { api } from "./api";

export async function pingERP(): Promise<{ message: string }> {
  const { data } = await api.get("/api/method/ping");
  return data;
}

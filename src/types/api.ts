export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  username: string;
  displayName?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  displayName?: string;
}

export type Priority = "Rendah" | "Medium" | "Tinggi";
export type Kategori = "Tugas" | "Organisasi" | "Kepanitiaan";
export type ScheduleStatus = "Belum Selesai" | "Selesai";

export interface Schedule {
  id: number;
  user_id: number;
  judul: string;
  kategori: Kategori;
  prioritas: Priority;
  status: ScheduleStatus;
  deadline: string;
  reminder_level: number;
}

export interface ScheduleInput {
  judul: string;
  kategori: Kategori;
  prioritas: Priority;
  status: ScheduleStatus;
  deadline: string;
}

export interface IntegrationStatus {
  googleLinked: boolean;
  telegramLinked: boolean;
}

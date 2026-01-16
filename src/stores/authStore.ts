import { create } from "zustand";

export type Role = "FILIAL" | "SEDE";

type AuthState = {
  role: Role | null;
  userName: string | null;
  filialId?: string | null;
  login: (role: Role, userName: string, filialId?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  userName: null,
  filialId: null,
  login: (role, userName, filialId) =>
    set({ role, userName, filialId: role === "FILIAL" ? filialId ?? null : null }),
  logout: () => set({ role: null, userName: null, filialId: null })
}));

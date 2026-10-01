import { createContext } from "react";
import type { AuthContextData } from "@/types";

/**
 * O objeto de contexto vive num módulo separado (sem componentes) para que o
 * Fast Refresh não recrie a instância do contexto ao editar o AuthProvider,
 * o que quebraria o useAuth em tempo de execução.
 */
export const AuthContext = createContext<AuthContextData | null>(null);

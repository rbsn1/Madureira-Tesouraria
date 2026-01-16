import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [role, setRole] = useState<"FILIAL" | "SEDE">("FILIAL");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(role, role === "FILIAL" ? "Maria Filial" : "Equipe Sede", "filial-1");
    navigate(role === "FILIAL" ? "/filial/dashboard" : "/sede/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border-muted/60 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Landmark className="h-6 w-6" />
          </div>
          <CardTitle>Sistema de Prestação de Contas</CardTitle>
          <p className="text-sm text-muted-foreground">Acesse com o perfil desejado.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Input placeholder="Seu usuário" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input type="password" placeholder="••••••" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entrar como</label>
              <Select value={role} onValueChange={(value) => setRole(value as "FILIAL" | "SEDE")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILIAL">Filial</SelectItem>
                  <SelectItem value="SEDE">Sede</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

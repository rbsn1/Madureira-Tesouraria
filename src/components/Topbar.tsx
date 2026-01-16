import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";

const themeKey = "ui-theme";

export function Topbar({ title }: { title: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const navigate = useNavigate();
  const { role, userName, logout } = useAuthStore();

  useEffect(() => {
    const stored = localStorage.getItem(themeKey) as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(themeKey, next);
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-muted/60 bg-background/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">Controle mensal de repasses e auditoria.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Notificações">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{userName ?? "Visitante"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>{role ?? "Sem perfil"}</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

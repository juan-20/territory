"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { clearToken } from "@/hooks/useToken";
import { toast } from "sonner";

export default function Header() {
  const router = useRouter();
  const links = [
    { to: "/", label: "Home" },
    { to: "/territories", label: "Quadras" },
  ];

  const handleLogout = () => {
    clearToken();
    toast.success("Sessão encerrada");
    router.refresh(); // Ensure middleware sees the token is gone
    router.push("/auth");
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}

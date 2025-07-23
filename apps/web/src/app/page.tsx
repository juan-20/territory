"use client"
import { useQuery } from "convex/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { api } from "@territory/backend/convex/_generated/api";
import { Map, Users, ClipboardList, BarChart } from "lucide-react";

const features = [
  {
    title: "Gerenciamento de Quadras",
    description: "Organize e gerencie suas quadras de território de forma eficiente",
    icon: Map,
    href: "/territories",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: (
      <div className="flex items-center gap-2">
        <span>Controle de Publicadores</span>
        <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600">
          Em Breve
        </span>
      </div>
    ),
    description: "Acompanhe quem está com cada quadra e por quanto tempo",
    icon: Users,
    href: "#",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Designações",
    description: "Faça designações de quadras e acompanhe o progresso",
    icon: ClipboardList,
    href: "/territories",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: (
      <div className="flex items-center gap-2">
        <span>Controle de Publicadores</span>
        <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600">
          Em Breve
        </span>
      </div>
    ),
    description: "Visualize estatísticas e relatórios do trabalho no território",
    icon: BarChart,
    href: "/territories",
    color: "bg-orange-500/10 text-orange-500",
  },
];

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Sistema de Gerenciamento de Território
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              Simplifique a organização do ministério de campo com nosso sistema integrado de gerenciamento de território
            </p>
            <Link
              href="/territories"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Começar
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Recursos Principais</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full p-6 transition-all hover:shadow-lg">
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="border-t py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h2 className="mb-2 font-medium">Status do Sistema</h2>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {healthCheck === undefined ? "Verificando..." : healthCheck === "OK" ? "Conectado" : "Erro"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

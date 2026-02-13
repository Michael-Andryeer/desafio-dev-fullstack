import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="container mx-auto flex h-16 items-center gap-6 px-4">
          <span className="text-lg font-bold">NewSun Energy</span>
          <Link
            to="/simular"
            className="text-sm font-medium text-muted-foreground transition-colors
  hover:text-foreground [&.active]:text-foreground"
          >
            Simular
          </Link>
          <Link
            to="/listagem"
            className="text-sm font-medium text-muted-foreground transition-colors
  hover:text-foreground [&.active]:text-foreground"
          >
            Listagem
          </Link>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
}

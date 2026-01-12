import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 AI Tools Hub. Discover the best AI tools for your workflow.</p>
        </div>
      </footer>
    </div>
  );
}

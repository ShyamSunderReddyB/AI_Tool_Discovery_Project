import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      <div className="relative text-center px-4 animate-slide-up">
        <h1 className="text-8xl md:text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Tools
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

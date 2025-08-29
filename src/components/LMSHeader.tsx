import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";

const LMSHeader = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">SaiU LMS</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">
            Features
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-smooth">
            About
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-smooth">
            Contact
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
          <Button variant="hero" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LMSHeader;
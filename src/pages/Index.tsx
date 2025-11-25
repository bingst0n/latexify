import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style>{`
        @keyframes gridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 40px 0;
          }
        }
      `}</style>
      
      <header className="border-b border-border/40 px-6 py-4 relative z-10">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <NavLink to="/" className="text-xl md:text-2xl font-bold text-foreground tracking-tight hover:text-foreground/80 transition-colors">
            LaTeXify
          </NavLink>
          <div className="flex items-center gap-12 text-xs md:text-sm">
            <NavLink to="/editor" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              Simple Equation Editor
            </NavLink>
            <NavLink to="/ai" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              AI Tool
            </NavLink>
          </div>
        </nav>
      </header>
      
      <div className="flex flex-1 items-center justify-center px-4 relative z-10">
      <div className="max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
            LaTeXify
          </h1>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full"></div>
        </div>
        
        <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto">
          A simple tool that converts messy math—images, screenshots, handwritten notes, 
          or rough text—into clean, ready-to-use LaTeX. Drop something in, and LaTeXify 
          turns it into structured equations you can paste directly into papers, homework, 
          or research.
        </p>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg group"
          >
            Start AI Tool
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Convert • Simplify • LaTeXify</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Index;

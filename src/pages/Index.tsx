import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
            Start Tool
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Convert • Simplify • LaTeXify</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const Index = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Auto-play carousel
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  // Placeholder images
  const images = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1635070041409-e63e783d3f49?w=500&h=500&fit=crop",
  ];
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
      
      <div className="flex flex-1 items-center relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero Section */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                LaTeXify
              </h1>
              <div className="h-1 w-24 bg-accent rounded-full"></div>
            </div>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
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

            <div className="pt-4 text-sm text-muted-foreground">
              <p>Convert • Simplify • LaTeXify</p>
            </div>
          </div>

          {/* Right side - Image Carousel */}
          <div className="flex flex-col items-center gap-4">
            <Carousel setApi={setApi} className="w-full max-w-md">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-border/40">
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Dot Indicators */}
            <div className="flex gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === current 
                      ? "bg-primary w-6" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

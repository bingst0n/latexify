import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Header } from "@/components/Header";

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

  const images = [
    "/images/slide1.png",
    "/images/slide2.png",
    "/images/slide3.png",
    "/images/slide4.png",
  ];
  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style>{`
        @keyframes gridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 25px 0;
          }
        }
      `}</style>
      
      <div className="relative z-10">
        <Header />
      </div>
      
      <div className="flex flex-1 items-center relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Image Carousel */}
          <div className="flex flex-col items-center gap-4">
            <Carousel setApi={setApi} className="w-full max-w-xl">
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

          {/* Right side - Hero Section */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                LaTeXify
              </h1>
              <div className="h-1 w-24 bg-accent rounded-full"></div>
            </div>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              Convert messy math—images, screenshots, handwritten notes, 
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

            <div className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>Convert • Simplify • LaTeXify</p>
              <p className="text-xs">Open source under the MIT License</p>
              <a 
                href="https://github.com/bingst0n/latexify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-foreground/70 hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { Header } from "@/components/Header";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import katex from "katex";
import "katex/dist/katex.min.css";
import { toPng } from "html-to-image";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const EDITOR_CACHE_KEY = "latexify_editor_cache";

interface ParsedLine {
  type: "math" | "comment" | "empty";
  content: string;
  lineNumber: number;
}

const BACKGROUND_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Light Gray", value: "#f5f5f5" },
  { name: "Cream", value: "#fffef0" },
  { name: "Light Blue", value: "#f0f8ff" },
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#1a1a1a" },
  { name: "App Background", value: "transparent" },
];

const Editor = () => {
  const [code, setCode] = useState(`% Welcome to LaTeXify Simple Equation Editor
% Each line is rendered as display math
% Lines starting with % are comments

E = mc^2

\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}

\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}

\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}`);

  const [bgColor, setBgColor] = useState("#ffffff");
  const [spacing, setSpacing] = useState(0); // 0-24 range, default 0px (tightest)
  const [projectName, setProjectName] = useState("Untitled Project");
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load project from URL param or restore from cache
  useEffect(() => {
    const id = searchParams.get('id');
    
    if (id) {
      // Load project from database
      const loadProject = async () => {
        try {
          const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("id", id)
            .single();
          
          if (error) throw error;
          if (data) {
            setProjectId(data.id);
            setCode(data.code);
            setProjectName(data.name);
            setBgColor(data.bg_color || "#ffffff");
            setSpacing(data.spacing || 0);
          }
        } catch (err) {
          console.error("Failed to load project:", err);
          toast({
            title: "Failed to load project",
            description: "The project could not be found.",
            variant: "destructive",
          });
        }
      };
      loadProject();
    } else {
      // Restore from cache if no project ID
      const cached = localStorage.getItem(EDITOR_CACHE_KEY);
      if (cached) {
        try {
          const { code: cachedCode, projectName: cachedName, bgColor: cachedBg, spacing: cachedSpacing } = JSON.parse(cached);
          if (cachedCode) setCode(cachedCode);
          if (cachedName) setProjectName(cachedName);
          if (cachedBg) setBgColor(cachedBg);
          if (cachedSpacing !== undefined) setSpacing(cachedSpacing);
          localStorage.removeItem(EDITOR_CACHE_KEY);
        } catch (e) {
          console.error("Failed to restore editor cache:", e);
        }
      }
    }
  }, [searchParams, toast]);

  // Cache and redirect to sign in
  const handleSignInRedirect = () => {
    localStorage.setItem(EDITOR_CACHE_KEY, JSON.stringify({
      code,
      projectName,
      bgColor,
      spacing,
    }));
    navigate("/auth?redirect=/editor");
  };

  const lineCount = code.split("\n").length;

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update({
            name: projectName,
            code: code,
            bg_color: bgColor,
            spacing: spacing,
          })
          .eq("id", projectId);

        if (error) throw error;

        toast({
          title: "Project updated",
          description: `"${projectName}" has been saved.`,
        });
      } else {
        // Insert new project
        const { data, error } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: projectName,
            code: code,
            bg_color: bgColor,
            spacing: spacing,
          })
          .select()
          .single();

        if (error) throw error;
        
        // Set the project ID so future saves update instead of insert
        if (data) {
          setProjectId(data.id);
          // Update URL without reload
          navigate(`/editor?id=${data.id}`, { replace: true });
        }

        toast({
          title: "Project saved",
          description: `"${projectName}" has been saved to My Stuff.`,
        });
      }
    } catch (err) {
      console.error("Failed to save project:", err);
      toast({
        title: "Failed to save",
        description: "There was an error saving your project.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle resize drag
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp between 20% and 80%
      const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
      setEditorWidth(clampedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const parsedLines = useMemo((): ParsedLine[] => {
    return code.split("\n").map((line, index) => {
      const trimmed = line.trim();
      if (trimmed === "") {
        return { type: "empty", content: "", lineNumber: index + 1 };
      }
      if (trimmed.startsWith("%")) {
        return { type: "comment", content: trimmed.slice(1).trim(), lineNumber: index + 1 };
      }
      return { type: "math", content: line, lineNumber: index + 1 };
    });
  }, [code]);

  const renderMath = (latex: string): string => {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        errorColor: "#ef4444",
      });
    } catch {
      return `<span class="text-destructive">Error rendering: ${latex}</span>`;
    }
  };

  const isDarkBg = bgColor === "#000000" || bgColor === "#1a1a1a";
  const isTransparentBg = bgColor === "transparent";

  const handleDownload = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: isTransparentBg ? "#ffffff" : bgColor,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "latexify-equations.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Project Title Bar */}
      <div className="px-4 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="max-w-xs h-8 text-sm font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          placeholder="Project name..."
        />
        {user ? (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            <button onClick={handleSignInRedirect} className="text-primary hover:underline">Sign in</button> to save your work
          </p>
        )}
      </div>

      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* Editor Panel */}
        <div 
          className="border-r border-border flex flex-col"
          style={{ width: `${editorWidth}%` }}
        >
          <div className="px-4 py-2 border-b border-border bg-muted/30 h-10 flex items-center">
            <h2 className="text-sm font-medium text-muted-foreground">Editor</h2>
          </div>
          <div className="flex-1 relative flex overflow-hidden">
            {/* Line Numbers */}
            <div
              ref={lineNumbersRef}
              className="w-12 bg-muted/30 border-r border-border overflow-hidden select-none flex-shrink-0"
            >
              <div className="p-4 pr-2 font-mono text-sm text-muted-foreground text-right leading-[1.5rem] whitespace-pre">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
            </div>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              className="flex-1 p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none leading-[1.5rem] whitespace-pre overflow-x-auto"
              spellCheck={false}
              placeholder="Enter LaTeX expressions, one per line..."
              wrap="off"
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-border hover:bg-primary/50 cursor-col-resize flex-shrink-0 transition-colors ${
            isDragging ? "bg-primary" : ""
          }`}
          onMouseDown={handleMouseDown}
          style={{ cursor: "col-resize" }}
        />

        {/* Preview Panel */}
        <div 
          className="flex flex-col"
          style={{ width: `${100 - editorWidth}%` }}
        >
          <div className="px-4 py-2 border-b border-border bg-muted/30 h-10 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
            <div className="flex items-center gap-3">
              {/* Background Color */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-6 h-6 rounded border border-border shadow-sm"
                    style={{ backgroundColor: bgColor }}
                    title="Background color"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUND_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBgColor(color.value)}
                        className={`w-8 h-8 rounded border-2 ${
                          bgColor === color.value ? "border-primary" : "border-border"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Spacing Slider */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted">
                    Spacing
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Equation Spacing</label>
                    <Slider
                      value={[spacing]}
                      onValueChange={(v) => setSpacing(v[0])}
                      min={-16}
                      max={24}
                      step={1}
                    />
                  </div>
                </PopoverContent>
              </Popover>

              {/* Download Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2"
                title="Download as PNG"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={previewRef}
            className="flex-1 overflow-auto p-6 flex flex-col"
            style={{ backgroundColor: bgColor }}
          >
            {parsedLines.map((line, index) => {
              if (line.type === "empty") {
                return <div key={index} className="h-4" />;
              }
              if (line.type === "comment") {
                return (
                  <div 
                    key={index} 
                    className="text-sm italic"
                    style={{ 
                      color: isDarkBg ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    {line.content}
                  </div>
                );
              }
              return (
                <div
                  key={index}
                  style={{ 
                    marginTop: `${spacing}px`,
                    color: isDarkBg ? "#ffffff" : "#000000",
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMath(line.content) }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;

import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, RotateCcw, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  name: string;
  code: string;
  bg_color: string;
  spacing: number;
  created_at: string;
  deleted_at: string | null;
}

const MyStuff = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // Fetch active projects
      const { data: active, error: activeError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (activeError) throw activeError;
      setProjects(active || []);

      // Fetch trashed projects
      const { data: trashed, error: trashedError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (trashedError) throw trashedError;
      setTrashedProjects(trashed || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToTrash = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      
      const project = projects.find((p) => p.id === id);
      if (project) {
        setProjects(projects.filter((p) => p.id !== id));
        setTrashedProjects([{ ...project, deleted_at: new Date().toISOString() }, ...trashedProjects]);
      }
      
      toast({
        title: "Moved to trash",
        description: `"${name}" has been moved to trash.`,
      });
    } catch (err) {
      console.error("Failed to move to trash:", err);
      toast({
        title: "Failed to delete",
        description: "There was an error moving your project to trash.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: null })
        .eq("id", id);
      if (error) throw error;
      
      const project = trashedProjects.find((p) => p.id === id);
      if (project) {
        setTrashedProjects(trashedProjects.filter((p) => p.id !== id));
        setProjects([{ ...project, deleted_at: null }, ...projects]);
      }
      
      toast({
        title: "Project restored",
        description: `"${name}" has been restored.`,
      });
    } catch (err) {
      console.error("Failed to restore project:", err);
      toast({
        title: "Failed to restore",
        description: "There was an error restoring your project.",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setTrashedProjects(trashedProjects.filter((p) => p.id !== id));
      toast({
        title: "Permanently deleted",
        description: `"${name}" has been permanently deleted.`,
      });
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast({
        title: "Failed to delete",
        description: "There was an error deleting your project.",
        variant: "destructive",
      });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("user_id", user?.id)
        .not("deleted_at", "is", null);
      if (error) throw error;
      setTrashedProjects([]);
      toast({
        title: "Trash emptied",
        description: "All trashed projects have been permanently deleted.",
      });
    } catch (err) {
      console.error("Failed to empty trash:", err);
      toast({
        title: "Failed to empty trash",
        description: "There was an error emptying the trash.",
        variant: "destructive",
      });
    }
  };

  const getPreviewLines = (code: string) => {
    return code.split("\n").filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith("%");
    }).slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">My Stuff</h1>
            <p className="text-muted-foreground">
              <a href="/auth" className="text-primary hover:underline">Sign in</a> to view your saved projects.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Stuff</h1>
          
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Tabs defaultValue="projects">
              <TabsList className="mb-6">
                <TabsTrigger value="projects" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Projects ({projects.length})
                </TabsTrigger>
                <TabsTrigger value="trash" className="gap-2">
                  <Trash className="h-4 w-4" />
                  Trash ({trashedProjects.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="projects">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No saved projects yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/editor")}
                      className="mt-2"
                    >
                      Create your first project
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group relative"
                        onClick={() => navigate(`/editor?id=${project.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium truncate pr-8">{project.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToTrash(project.id, project.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono space-y-1 overflow-hidden">
                          {getPreviewLines(project.code).map((line, i) => (
                            <p key={i} className="truncate">{line}</p>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trash">
                {trashedProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Trash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Trash is empty.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleEmptyTrash}
                      >
                        Empty Trash
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trashedProjects.map((project) => (
                        <div
                          key={project.id}
                          className="border border-border rounded-lg p-4 opacity-60 group relative"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium truncate pr-16">{project.name}</h3>
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleRestore(project.id, project.name)}
                                title="Restore"
                              >
                                <RotateCcw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handlePermanentDelete(project.id, project.name)}
                                title="Delete permanently"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono space-y-1 overflow-hidden">
                            {getPreviewLines(project.code).map((line, i) => (
                              <p key={i} className="truncate">{line}</p>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Deleted {project.deleted_at && new Date(project.deleted_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStuff;

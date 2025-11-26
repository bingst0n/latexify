import { User, Sparkles, Settings, LogOut, FolderOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border/40 px-6 py-4 bg-background">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="text-xl md:text-2xl font-bold text-foreground tracking-tight hover:text-foreground/80 transition-colors">
            LaTeXify
          </NavLink>
          <div className="flex items-center gap-6 text-xs md:text-sm">
            <NavLink to="/editor" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              Simple Equation Editor
            </NavLink>
            <NavLink to="/ai" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              AI Tool
            </NavLink>
          </div>
        </div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <User className="h-4 w-4 text-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/my-stuff')} className="cursor-pointer">
                <FolderOpen className="mr-2 h-4 w-4" />
                My Stuff
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/upgrade')} className="cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavLink to="/auth" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition-colors font-medium">
            Sign In
          </NavLink>
        )}
      </nav>
    </header>
  );
};

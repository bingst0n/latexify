import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link!');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
        </nav>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSignUp 
                ? 'Sign up to start converting math to LaTeX' 
                : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-primary hover:underline"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

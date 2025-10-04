import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeftIcon, Grid2x2PlusIcon, AtSignIcon, LockIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@aismartcart.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if using default admin credentials
    if (email !== 'admin@aismartcart.com' || password !== 'admin123') {
      toast({
        title: "Invalid admin credentials",
        description: "Please use the default admin email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If admin user doesn't exist, create it
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: 'admin',
                first_name: 'Admin',
                last_name: 'User'
              }
            }
          });
          
          if (signUpError) throw signUpError;
          
          toast({
            title: "Admin account created",
            description: "Please check your email to confirm your account",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome Admin",
          description: "Successfully signed in",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 flex items-center gap-2">
          <Grid2x2PlusIcon className="size-6" />
          <p className="text-xl font-semibold">AI SmartCart</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Secure admin access with advanced authentication and role-based permissions.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold">
              ~ System Administrator
            </footer>
          </blockquote>
        </div>
      </div>
      
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(var(--foreground)/.06)_0,hsla(0,0%,55%,.02)_50%,hsl(var(--foreground)/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
        </div>
        
        <Button variant="ghost" className="absolute top-7 left-5" asChild>
          <a href="/">
            <ChevronLeftIcon className='size-4 me-2' />
            Home
          </a>
        </Button>
        
        <div className="mx-auto space-y-6 sm:w-sm">
          <div className="flex items-center gap-2 lg:hidden">
            <Grid2x2PlusIcon className="size-6" />
            <p className="text-xl font-semibold">AI SmartCart</p>
          </div>
          
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="size-8 text-primary" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              Admin Access
            </h1>
            <p className="text-muted-foreground text-base">
              Secure login for system administrators
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Admin Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="admin@aismartcart.com"
                  className="peer ps-9"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <AtSignIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="admin123"
                  className="peer ps-9"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <LockIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Default Admin Credentials:</strong><br />
                Email: admin@aismartcart.com<br />
                Password: admin123
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="size-4 me-2 animate-spin" />}
              <Shield className="size-4 me-2" />
              Sign In as Admin
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Need admin access?{' '}
              <a
                href="#"
                className="hover:text-primary underline underline-offset-4"
              >
                Contact System Administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
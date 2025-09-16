import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Zap, TrendingUp, Shield } from "lucide-react";
import heroImage from "@/assets/hero-supermarket.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="AI-powered supermarket with smart product detection technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 gradient-secondary opacity-60 z-10" />

      {/* Hero content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Status badge */}
        <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
          <Zap className="w-4 h-4 mr-2" />
          AI-Powered Detection Active
        </Badge>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
          Supermarket Management
          <span className="block text-4xl md:text-6xl mt-2">
            with AI Product Detection
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Revolutionary retail management system that uses computer vision to automatically detect products, 
          streamline inventory, and enhance the shopping experience.
        </p>

         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <TrendingUp className="h-5 w-5" />
            View Dashboard
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="gap-2"
            onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Camera className="h-5 w-5" />
            Manage Inventory
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-card transition-smooth hover:shadow-elegant">
            <Camera className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Real-time Detection</h3>
            <p className="text-sm text-muted-foreground">
              Instantly recognize products using advanced computer vision without barcodes
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-card transition-smooth hover:shadow-elegant">
            <TrendingUp className="w-12 h-12 text-accent mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Smart Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Get insights on inventory trends, sales patterns, and customer behavior
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-card transition-smooth hover:shadow-elegant">
            <Shield className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Error Reduction</h3>
            <p className="text-sm text-muted-foreground">
              Minimize human error and ensure accurate billing and inventory management
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
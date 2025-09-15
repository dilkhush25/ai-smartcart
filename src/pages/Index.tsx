import { HeroSection } from "@/components/HeroSection";
import { Dashboard } from "@/components/Dashboard";
import { ProductDetectionDemo } from "@/components/ProductDetectionDemo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <Dashboard />
      <ProductDetectionDemo />
    </div>
  );
};

export default Index;

import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ProductDetectionDemo } from "@/components/ProductDetectionDemo";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <HeroSection />
      <section id="detection-demo">
        <ProductDetectionDemo />
      </section>
      <Footer />
    </div>
  );
};

export default Index;

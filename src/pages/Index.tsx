import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ProductDetectionDemo } from "@/components/ProductDetectionDemo";
import { Footer } from "@/components/Footer";
import SectionWithMockup from "@/components/ui/section-with-mockup";
import featureMockup1 from "@/assets/feature-mockup-1.jpg";
import featureMockup2 from "@/assets/feature-mockup-2.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <HeroSection />
      <section id="detection-demo">
        <ProductDetectionDemo />
      </section>
      <SectionWithMockup
        title={
          <>
            Intelligence,
            <br />
            delivered instantly.
          </>
        }
        description={
          <>
            Experience real-time product detection powered by AI.
            <br />
            Get instant ingredient analysis and smart shopping
            <br />
            recommendations tailored to your needs.
          </>
        }
        primaryImageSrc={featureMockup1}
        secondaryImageSrc={featureMockup2}
      />
      <Footer />
    </div>
  );
};

export default Index;

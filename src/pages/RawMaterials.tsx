import { Navigation } from "@/components/Navigation";
import { RawMaterialBot } from "@/components/RawMaterialBot";
import { Footer } from "@/components/Footer";

const RawMaterials = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Raw Materials Assistant
          </h1>
          <RawMaterialBot />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RawMaterials;
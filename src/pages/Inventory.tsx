import { Navigation } from "@/components/Navigation";
import { InventoryManagement } from "@/components/InventoryManagement";
import { Footer } from "@/components/Footer";

const Inventory = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Inventory Management
          </h1>
          <InventoryManagement />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Inventory;
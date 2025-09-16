import { HeroSection } from "@/components/HeroSection";
import { Dashboard } from "@/components/Dashboard";
import { ProductDetectionDemo } from "@/components/ProductDetectionDemo";
import { InventoryManagement } from "@/components/InventoryManagement";
import { RawMaterialBot } from "@/components/RawMaterialBot";
import { CheckoutSystem } from "@/components/CheckoutSystem";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeroSection />
      <section id="dashboard">
        <Dashboard />
      </section>
      <section id="detection-demo">
        <ProductDetectionDemo />
      </section>
      <section id="inventory">
        <InventoryManagement />
      </section>
      <section id="raw-material-bot">
        <RawMaterialBot />
      </section>
      <section id="checkout">
        <CheckoutSystem />
      </section>
      <section id="invoices">
        <InvoiceGenerator />
      </section>
      <Footer />
    </div>
  );
};

export default Index;

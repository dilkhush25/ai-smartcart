import { Navigation } from "@/components/Navigation";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { Footer } from "@/components/Footer";

const Invoices = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Invoice Generator
          </h1>
          <InvoiceGenerator />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Invoices;
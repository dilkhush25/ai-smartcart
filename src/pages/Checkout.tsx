import { Navigation } from "@/components/Navigation";
import { CheckoutSystem } from "@/components/CheckoutSystem";
import { Footer } from "@/components/Footer";

const Checkout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Checkout System
          </h1>
          <CheckoutSystem />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
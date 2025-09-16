import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <span>Created by</span>
          <span className="mx-2 font-semibold text-primary">TheDilkhush</span>
          <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
        </div>
      </div>
    </footer>
  );
};
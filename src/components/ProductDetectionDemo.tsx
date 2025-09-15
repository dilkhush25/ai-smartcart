import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Camera, Play, Pause, RotateCcw, Zap, Package } from "lucide-react";

export const ProductDetectionDemo = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const sampleProducts = [
    { name: "Coca Cola 330ml", confidence: 97.8, price: "$1.99", category: "Beverages" },
    { name: "Organic Bananas 1kg", confidence: 94.2, price: "$2.49", category: "Fresh Produce" },
    { name: "White Bread Loaf", confidence: 96.5, price: "$1.79", category: "Bakery" },
    { name: "Milk Carton 1L", confidence: 93.1, price: "$3.29", category: "Dairy" },
    { name: "Chocolate Bar 100g", confidence: 98.9, price: "$2.99", category: "Confectionery" }
  ];

  const startDetection = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDetectedProducts([]);
    
    toast({
      title: "AI Detection Started",
      description: "Scanning products using computer vision...",
    });

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Simulate detected products
          const randomProducts = sampleProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 4) + 2);
          setDetectedProducts(randomProducts);
          
          toast({
            title: "Detection Complete",
            description: `Successfully identified ${randomProducts.length} products!`,
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const resetDemo = () => {
    setDetectedProducts([]);
    setScanProgress(0);
    setIsScanning(false);
    toast({
      title: "Demo Reset",
      description: "Ready for new product detection session.",
    });
  };

  return (
    <section id="detection-demo" className="py-20 px-6 bg-gradient-accent">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            AI Detection Demo
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience how our computer vision technology identifies products in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera view simulation */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-6">
                {/* Simulated camera view */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-pulse">
                        <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                        <p className="text-lg font-medium text-primary">Scanning Products...</p>
                      </div>
                      <div className="mt-6 w-full max-w-xs mx-auto">
                        <Progress value={scanProgress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">{scanProgress}% Complete</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">Ready to scan products</p>
                    </div>
                  )}
                </div>

                {/* Detection overlay */}
                {detectedProducts.length > 0 && !isScanning && (
                  <div className="absolute inset-4 border-2 border-primary rounded animate-pulse">
                    <div className="absolute -top-8 left-0">
                      <Badge className="bg-primary text-primary-foreground">
                        {detectedProducts.length} Products Detected
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <Button 
                  onClick={startDetection} 
                  disabled={isScanning}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isScanning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Detection
                    </>
                  )}
                </Button>
                <Button 
                  onClick={resetDemo} 
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detection results */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Detection Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detectedProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No products detected yet</p>
                  <p className="text-sm">Start the camera to see AI detection in action</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {detectedProducts.map((product, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg bg-muted/30 border border-border/50 transition-smooth hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-foreground">{product.name}</h3>
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          {product.confidence}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{product.category}</span>
                        <span className="font-bold text-primary">{product.price}</span>
                      </div>
                      <Progress value={product.confidence} className="h-1 mt-2" />
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-muted-foreground">Total Items:</span>
                      <span className="text-foreground">{detectedProducts.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-muted-foreground">Avg Confidence:</span>
                      <span className="text-accent">
                        {detectedProducts.length > 0 
                          ? (detectedProducts.reduce((acc, p) => acc + p.confidence, 0) / detectedProducts.length).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
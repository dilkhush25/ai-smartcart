import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Scan, 
  TrendingUp, 
  Users, 
  Camera, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

export const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const metrics = [
    {
      title: "Products Detected",
      value: "2,847",
      change: "+12%",
      icon: Scan,
      color: "text-primary"
    },
    {
      title: "Inventory Items",
      value: "5,432",
      change: "+5%",
      icon: Package,
      color: "text-accent"
    },
    {
      title: "Daily Revenue",
      value: "₹18,249",
      change: "+8%",
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Active Cameras",
      value: "24",
      change: "100%",
      icon: Camera,
      color: "text-accent"
    }
  ];

  const recentDetections = [
    { product: "Coca Cola 500ml", confidence: 98, status: "confirmed", time: "2 min ago" },
    { product: "Bread Loaf", confidence: 95, status: "confirmed", time: "5 min ago" },
    { product: "Milk Carton 1L", confidence: 92, status: "confirmed", time: "7 min ago" },
    { product: "Apple iPhone Case", confidence: 88, status: "reviewing", time: "12 min ago" },
    { product: "Chocolate Bar", confidence: 96, status: "confirmed", time: "15 min ago" }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast({
      title: "Dashboard Updated",
      description: "All metrics have been refreshed successfully.",
    });
  };

  const handleViewAllDetections = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Detailed detection history will be available in the next update.",
    });
  };

  const handleSystemConfig = () => {
    toast({
      title: "System Configuration",
      description: "Opening advanced settings panel...",
    });
  };

  return (
    <section id="dashboard" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Management Dashboard
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real-time insights and controls for your AI-powered supermarket operations
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <Card 
              key={index} 
              className="shadow-card transition-smooth hover:shadow-elegant cursor-pointer"
              onClick={() => toast({
                title: `${metric.title} Details`,
                description: `Current value: ${metric.value} (${metric.change} from last month)`
              })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">↗ {metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main dashboard content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent detections */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                Recent Product Detections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDetections.map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-smooth hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${detection.status === 'confirmed' ? 'bg-accent' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-medium text-foreground">{detection.product}</p>
                        <p className="text-sm text-muted-foreground">{detection.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={detection.status === 'confirmed' ? 'default' : 'secondary'} className="bg-primary/10 text-primary">
                        {detection.confidence}% confidence
                      </Badge>
                      {detection.status === 'confirmed' ? (
                        <CheckCircle className="w-4 h-4 text-accent" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4 border-primary/20 text-primary hover:bg-primary/10"
                onClick={handleViewAllDetections}
              >
                View All Detections
              </Button>
            </CardContent>
          </Card>

          {/* System status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-accent" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">AI Model Performance</span>
                  <span className="text-sm font-medium text-accent">97.3%</span>
                </div>
                <Progress value={97} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Camera Coverage</span>
                  <span className="text-sm font-medium text-primary">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Inventory Accuracy</span>
                  <span className="text-sm font-medium text-accent">94.8%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">All systems operational</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">24 cameras active</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted-foreground">2 pending reviews</span>
                </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSystemConfig}
              >
                System Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
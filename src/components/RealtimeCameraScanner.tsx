import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  CameraOff, 
  Zap,
  Package,
  AlertCircle,
  Eye,
  Info
} from "lucide-react";

interface RealtimeDetection {
  name: string;
  category: string;
  description: string;
  confidence: number;
  price?: string;
  brand?: string;
  ingredients?: string[];
  nutritionalInfo?: string;
  timestamp: number;
}

export const RealtimeCameraScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDetections, setCurrentDetections] = useState<RealtimeDetection[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        
        // Start real-time scanning every 3 seconds
        startRealtimeScanning();
        
        toast({
          title: "Real-time Scanner Active",
          description: "Camera is now continuously scanning products",
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to access camera. Please check permissions.';
      setError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Camera error:', err);
    }
  }, [toast]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      
      // Stop real-time scanning
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setCurrentDetections([]);
      setScanCount(0);
      
      toast({
        title: "Scanner Stopped",
        description: "Real-time scanning has been disabled",
      });
    }
  }, [toast]);

  // Start continuous scanning
  const startRealtimeScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      captureAndAnalyzeFrame();
    }, 3000); // Scan every 3 seconds
  }, []);

  // Capture and analyze current frame
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setScanCount(prev => prev + 1);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.7);

      // Send to AI analysis with detailed prompt for real-time scanning
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { 
          imageData,
          type: 'realtime-scan'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.success && data.analysis) {
        let detections: RealtimeDetection[] = [];
        
        if (Array.isArray(data.analysis)) {
          detections = data.analysis.map((item: any) => ({
            ...item,
            timestamp: Date.now()
          }));
        }

        // Update current detections
        setCurrentDetections(detections);
        
        // Only show toast for new significant detections
        if (detections.length > 0 && scanCount % 3 === 0) {
          toast({
            title: `${detections.length} Products Detected`,
            description: "Real-time AI analysis complete",
          });
        }
      }

    } catch (err) {
      console.error('Real-time analysis error:', err);
      // Don't show toast for every error to avoid spam
      if (scanCount % 10 === 0) {
        toast({
          title: "Scan Error",
          description: "Some scans failed, continuing...",
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [isStreaming, isAnalyzing, scanCount, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      {/* Scanner Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Real-Time Product Scanner
            {isStreaming && (
              <Badge className="bg-green-500 text-white animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
          <p className="text-muted-foreground">
            Continuous AI-powered product detection and analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Scans: {scanCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Detected: {currentDetections.length}</span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>Analyzing...</span>
              </div>
            )}
          </div>

          {/* Video Feed */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Processing Canvas (hidden) */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Detection Overlay */}
            {currentDetections.length > 0 && isStreaming && (
              <div className="absolute top-4 left-4 right-4">
                <div className="flex flex-wrap gap-2">
                  {currentDetections.slice(0, 3).map((detection, index) => (
                    <Badge 
                      key={index}
                      className="bg-primary/90 text-white shadow-lg"
                    >
                      {detection.name} ({detection.confidence}%)
                    </Badge>
                  ))}
                  {currentDetections.length > 3 && (
                    <Badge className="bg-accent/90 text-white shadow-lg">
                      +{currentDetections.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Control Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              {!isStreaming ? (
                <Button 
                  onClick={startCamera}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Real-Time Scanning
                </Button>
              ) : (
                <Button 
                  onClick={stopCamera}
                  size="lg"
                  variant="destructive"
                  className="shadow-lg"
                >
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Scanner
                </Button>
              )}
            </div>

            {/* Status Overlays */}
            {!isStreaming && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Real-Time Scanner Ready</p>
                  <p className="text-sm opacity-75">Start scanning to detect products continuously</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
                <div className="text-center text-white">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Camera Error</p>
                  <p className="text-sm opacity-75">{error}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Detection Results */}
      {currentDetections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              Live Detection Results
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Real-time AI Analysis
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentDetections.map((detection, index) => (
                <div 
                  key={`${detection.name}-${detection.timestamp}`}
                  className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground text-lg">
                      {detection.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        detection.confidence >= 90 ? 'bg-green-100 text-green-800' :
                        detection.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {detection.confidence}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-primary">
                        {detection.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {detection.description}
                    </p>
                    
                    {detection.brand && (
                      <div className="text-sm">
                        <span className="font-medium">Brand: </span>
                        <span className="text-primary">{detection.brand}</span>
                      </div>
                    )}
                    
                    {detection.price && (
                      <div className="text-sm">
                        <span className="font-medium">Est. Price: </span>
                        <span className="text-accent font-bold">{detection.price}</span>
                      </div>
                    )}
                    
                    {detection.ingredients && detection.ingredients.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {detection.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                          {detection.ingredients.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{detection.ingredients.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {detection.nutritionalInfo && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <p className="font-medium mb-1">Nutrition:</p>
                        <p>{detection.nutritionalInfo}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Detected: {new Date(detection.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                How Real-Time Scanning Works
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Camera continuously captures frames every 3 seconds</li>
                <li>• AI analyzes each frame for product detection</li>
                <li>• Results update in real-time without manual capture</li>
                <li>• No database dependency - pure AI analysis</li>
                <li>• Position products clearly in camera view for best results</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
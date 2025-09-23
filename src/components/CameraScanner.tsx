import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  CameraOff, 
  Scan, 
  Loader2, 
  Zap,
  Package,
  AlertCircle 
} from "lucide-react";
import cv from 'opencv-ts';

interface DetectedItem {
  name: string;
  category: string;
  description: string;
  confidence: number;
  additionalInfo?: string;
}

interface AnalysisResult {
  success: boolean;
  analysis: DetectedItem[] | { error: boolean; message: string; items: DetectedItem[] };
  error?: string;
}

export const CameraScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        
        toast({
          title: "Camera Started",
          description: "Real-time camera feed is now active",
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
      
      toast({
        title: "Camera Stopped",
        description: "Camera stream has been disabled",
      });
    }
  }, [toast]);

  // Capture and analyze frame
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      toast({
        title: "Error",
        description: "Camera is not active",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setDetectedItems([]);

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

      // Optional: Apply OpenCV processing
      try {
        // Create OpenCV mat from canvas
        const src = cv.imread(canvas);
        const dst = new cv.Mat();
        
        // Apply Gaussian blur to reduce noise
        cv.GaussianBlur(src, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
        
        // Show processed image back to canvas
        cv.imshow(canvas, dst);
        
        // Clean up
        src.delete();
        dst.delete();
      } catch (cvError) {
        console.warn('OpenCV processing failed, using original image:', cvError);
      }

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { 
          imageData,
          type: 'analyze'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as AnalysisResult;
      console.log('Analysis result:', result);

      if (result.success && result.analysis) {
        let items: DetectedItem[] = [];
        
        if (Array.isArray(result.analysis)) {
          items = result.analysis;
        } else if (result.analysis.items) {
          items = result.analysis.items;
        }

        setDetectedItems(items);
        
        if (items.length > 0) {
          toast({
            title: "Analysis Complete",
            description: `Found ${items.length} item${items.length > 1 ? 's' : ''}`,
          });
        } else {
          toast({
            title: "No Items Detected",
            description: "Try positioning products more clearly in the camera view",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isStreaming, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Real-Time Product Scanner
          </CardTitle>
          <p className="text-muted-foreground">
            Use AI-powered computer vision to identify products and get detailed information
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {!isStreaming ? (
                <Button 
                  onClick={startCamera}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={captureAndAnalyze}
                    disabled={isAnalyzing}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Scan Now
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={stopCamera}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <CameraOff className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Status Overlay */}
            {!isStreaming && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Camera Not Active</p>
                  <p className="text-sm opacity-75">Click "Start Camera" to begin scanning</p>
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

      {/* Detection Results */}
      {detectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Detected Items ({detectedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {detectedItems.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      {item.confidence}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    </div>
                    
                    <p className="text-sm text-foreground">{item.description}</p>
                    
                    {item.additionalInfo && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                        {item.additionalInfo}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
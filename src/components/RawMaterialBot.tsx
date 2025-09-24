import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Bot, ChefHat, Search, Loader2, Camera } from "lucide-react";
import { RealtimeCameraScanner } from "./RealtimeCameraScanner";

interface RawMaterial {
  id: string;
  food_item: string;
  ingredients: string[];
}

export const RawMaterialBot = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [foodItem, setFoodItem] = useState("");
  const [allItems, setAllItems] = useState<RawMaterial[]>([]);

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .order("food_item");

      if (error) throw error;
      setAllItems((data || []).map(item => ({
        ...item,
        ingredients: Array.isArray(item.ingredients) 
          ? (item.ingredients as string[])
          : typeof item.ingredients === 'string' 
            ? JSON.parse(item.ingredients)
            : []
      })));
    } catch (error: any) {
      console.error("Error fetching items:", error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a food item name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setFoodItem("");

    try {
      // Use AI analysis as primary method for global food search
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-product', {
        body: { 
          imageData: null, // No image for text query
          type: 'ingredients',
          query: query.trim()
        }
      });

      if (aiError) throw aiError;

      if (aiData && aiData.analysis) {
        const analysisData = aiData.analysis;
        
        // If we got a proper JSON response with detailed ingredients
        if (analysisData.raw_materials && Array.isArray(analysisData.raw_materials)) {
          const allIngredients = [
            ...analysisData.main_ingredients || [],
            ...analysisData.raw_materials || [],
            ...analysisData.spices_seasonings || [],
            ...analysisData.optional_ingredients || []
          ];
          
          // Remove duplicates
          const uniqueIngredients = [...new Set(allIngredients)];
          setResult(uniqueIngredients);
          setFoodItem(analysisData.food_name || query);
          
          toast({
            title: "AI Analysis Complete!",
            description: `Found ${uniqueIngredients.length} ingredients for ${analysisData.food_name || query}`,
          });
        } else {
          // Fallback for non-JSON or simple responses
          const ingredients = Array.isArray(analysisData) 
            ? analysisData.map(item => item.name || item.ingredient || item).filter(Boolean)
            : typeof analysisData === 'string'
              ? [analysisData]
              : [`Found information for ${query}`];
          
          setResult(ingredients);
          setFoodItem(query);
          toast({
            title: "AI Analysis",
            description: "Ingredient information retrieved using AI",
          });
        }
      } else {
        throw new Error("AI analysis failed");
      }
    } catch (error: any) {
      // Fallback to database search if AI fails
      try {
        const { data, error } = await supabase
          .from("raw_materials")
          .select("*")
          .ilike("food_item", `%${query.trim()}%`)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const item = data[0];
          const ingredients = Array.isArray(item.ingredients) 
            ? (item.ingredients as string[])
            : typeof item.ingredients === 'string' 
              ? JSON.parse(item.ingredients)
              : [];
          setResult(ingredients);
          setFoodItem(item.food_item);
          toast({
            title: "Found in Database!",
            description: `Ingredients for ${item.food_item} retrieved from local database`
          });
        } else {
          setResult([`Sorry, I couldn't find ingredients for "${query}".`, "Please try:", "• A more specific food name", "• Different spelling", "• Use the camera scanner for visual analysis"]);
          setFoodItem(query);
          toast({
            title: "Not Found",
            description: "Try a different food name or use the camera scanner",
            variant: "destructive"
          });
        }
      } catch (dbError) {
        setResult([`Error searching for "${query}".`, "Please check your internet connection", "Or try the camera scanner"]);
        setFoodItem(query);
        toast({
          title: "Search Error",
          description: "Failed to search for ingredients",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (item: string) => {
    setQuery(item);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">AI-Powered Raw Material Assistant</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Search for ingredients of ANY food from around the world using AI. Works with Indian, Chinese, Italian, Mexican, Japanese, and all global cuisines!
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Text Search
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera Scanner
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-6 mt-6">
              {/* Search Section */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter ANY food name: Biryani, Sushi, Tacos, Pasta, Samosa, Pad Thai..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-base"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>

              {/* Available Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Quick Suggestions (Try anything!)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Biryani", "Butter Chicken", "Sushi", "Ramen", "Tacos", "Pasta Carbonara", "Pad Thai", "Samosa", "Pizza Margherita", "Fried Rice"].map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ✨ These are just examples - you can search for ANY food from ANY cuisine worldwide!
                </p>
              </div>

              {/* Results Section */}
              {result && (
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      Ingredients for: {foodItem}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {result.map((ingredient, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="justify-start p-2 text-sm"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat-like Interface */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="font-medium">Raw Material Bot</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  🌍 Global Food Expert: I know ingredients for dishes from India, China, Italy, Mexico, Japan, Middle East, Africa, and ALL world cuisines! Try searching for: Biryani, Sushi, Tacos, Paella, Moussaka, Curry, Dim Sum, or anything else!
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="mt-6">
              <RealtimeCameraScanner />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
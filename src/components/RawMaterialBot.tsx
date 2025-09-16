import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Bot, ChefHat, Search, Loader2 } from "lucide-react";

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
      // Search in database first
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
          title: "Found!",
          description: `Ingredients for ${item.food_item} retrieved successfully`
        });
      } else {
        // If not found in database, provide a generic response
        setResult(["Item not found in database", "Try searching for: Pasta, Pizza, Fried Rice, Sandwich, or Salad"]);
        setFoodItem(query);
        toast({
          title: "Not Found",
          description: "This item is not in our database. Try one of the available items.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search for ingredients",
        variant: "destructive"
      });
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
            <CardTitle className="text-2xl">Raw Material Bot</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Ask me about ingredients needed for any food item!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter food item name (e.g., Pasta, Pizza, Sandwich...)"
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
              Available Items
            </h3>
            <div className="flex flex-wrap gap-2">
              {allItems.map((item) => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSuggestionClick(item.food_item)}
                >
                  {item.food_item}
                </Badge>
              ))}
            </div>
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
              💡 Tip: I can help you find ingredients for various dishes. Just type the name of any food item and I'll show you what raw materials you need!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
-- Create products table for inventory management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  supplier TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for billing
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table for bill details
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raw_materials table for cooking bot
CREATE TABLE public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_item TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for demo purposes)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Anyone can view order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view raw_materials" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert raw_materials" ON public.raw_materials FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (name, quantity, supplier, cost, price, category, description) VALUES
('Apple', 100, 'Fresh Farms', 0.50, 1.00, 'Fruits', 'Fresh red apples'),
('Banana', 80, 'Tropical Supply', 0.30, 0.75, 'Fruits', 'Yellow bananas'),
('Milk', 50, 'Dairy Co', 2.00, 3.50, 'Dairy', '1L milk bottle'),
('Bread', 30, 'Baker''s Best', 1.50, 2.50, 'Bakery', 'White bread loaf'),
('Rice', 200, 'Grain Suppliers', 1.00, 2.00, 'Grains', '1kg rice bag');

INSERT INTO public.raw_materials (food_item, ingredients) VALUES
('Pasta', '["Pasta", "Tomato Sauce", "Garlic", "Olive Oil", "Parmesan Cheese", "Basil"]'),
('Pizza', '["Pizza Dough", "Tomato Sauce", "Mozzarella Cheese", "Pepperoni", "Bell Peppers", "Mushrooms"]'),
('Fried Rice', '["Rice", "Eggs", "Soy Sauce", "Vegetables", "Garlic", "Oil"]'),
('Sandwich', '["Bread", "Ham", "Cheese", "Lettuce", "Tomato", "Mayonnaise"]'),
('Salad', '["Lettuce", "Tomato", "Cucumber", "Carrots", "Olive Oil", "Vinegar"]');
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  old_price?: number;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  in_stock: number;
  is_featured: number;
  created_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  email?: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_address?: string;
  comment?: string;
  total: number;
  status: 'new' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Review {
  id: number;
  customer_id?: number;
  customer_name: string;
  phone?: string;
  rating: number;
  text: string;
  image_url?: string;
  is_approved: number;
  created_at: string;
}

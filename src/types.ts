export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  option_groups?: ProductOptionGroup[];
}

export interface ProductOptionGroup {
  id: string;
  product_id: string;
  name: string;
  min_options: number;
  max_options: number;
  required: boolean;
  options?: ProductOption[];
}

export interface ProductOption {
  id: string;
  group_id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: ProductOption[];
  notes?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
}

export interface RestaurantConfig {
  id?: string;
  name: string;
  logo: string;
  banner: string;
  whatsappNumber: string;
  address: string;
  deliveryFee: number;
  minOrder: number;
  theme: ThemeConfig;
  categories: Category[];
  products: Product[];
}

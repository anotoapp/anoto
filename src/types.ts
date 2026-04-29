export interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  is_available?: boolean;
  option_groups?: ProductOptionGroup[];
  created_at?: string;
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
  opening_hours?: OpeningHours;
  is_open_manual?: boolean;
  theme: ThemeConfig;
  categories: Category[];
  products: Product[];
}

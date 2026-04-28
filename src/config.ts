import type { RestaurantConfig } from './types';

export const config: RestaurantConfig = {
  name: "ANOTÔ",
  logo: "/assets/logo.png",
  banner: "/assets/banner.png",
  whatsappNumber: "5511999999999", // Exemplo: 55 + DDD + Número
  address: "Rua Gourmet, 123 - Centro",
  deliveryFee: 5.00,
  minOrder: 20.00,
  theme: {
    primaryColor: "#FFC107", // Gold
    secondaryColor: "#212121", // Dark Charcoal
    accentColor: "#F44336", // Red for highlights
    backgroundColor: "#FFFFFF",
    textColor: "#212121",
    borderRadius: "12px",
    fontFamily: "'Outfit', sans-serif",
  },
  categories: [
    { id: 'burgers', store_id: 'default', name: 'Burgers', icon: '🍔' },
    { id: 'sides', store_id: 'default', name: 'Acompanhamentos', icon: '🍟' },
    { id: 'drinks', store_id: 'default', name: 'Bebidas', icon: '🥤' },
    { id: 'desserts', store_id: 'default', name: 'Sobremesas', icon: '🍦' },
  ],
  products: [
    {
      id: '1',
      name: 'Classic Gold Burger',
      description: 'Pão brioche, blend bovino 180g, queijo cheddar maçaricado, alface, tomate e maionese da casa.',
      price: 32.00,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      category_id: 'burgers',
      category: 'burgers',
    },
    {
      id: '2',
      name: 'Double Smokehouse',
      description: 'Dois blends de 150g, bacon crocante, cebola caramelizada e molho barbecue artesanal.',
      price: 42.00,
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
      category_id: 'burgers',
      category: 'burgers',
    },
    {
      id: '3',
      name: 'Batata Rústica',
      description: 'Batatas cortadas à mão com alecrim e sal grosso. Acompanha maionese de alho.',
      price: 18.00,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
      category_id: 'sides',
      category: 'sides',
    },
    {
      id: '4',
      name: 'Coca-Cola 350ml',
      description: 'Lata gelada.',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
      category_id: 'drinks',
      category: 'drinks',
    },
  ]
};

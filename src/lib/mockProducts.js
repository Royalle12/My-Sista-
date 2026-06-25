/**
 * src/lib/mockProducts.js
 * Rich default and fallback products for Happy Splurge integrations.
 * Mapped to article categories.
 */

export const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Organic Raspberry Leaf Tea',
    description: 'Traditional organic herbal tea blend formulated to support cycle wellness, tone uterine muscles, and soothe period cramps.',
    price_zar: 120.00,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    product_url: 'https://happysplurge.co.za/products/raspberry-leaf-tea',
    category: 'nutrition',
    tags: ['luteal', 'tea', 'hormones'],
    is_active: true
  },
  {
    id: 'prod-002',
    title: 'Magnesium Comfort Bath Salts',
    description: 'Pure magnesium flakes infused with wild lavender essential oil to soothe sore muscles, ease tension, and promote deep restful sleep.',
    price_zar: 180.00,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
    product_url: 'https://happysplurge.co.za/products/magnesium-bath-salts',
    category: 'mental_health',
    tags: ['rest', 'bath', 'sleep'],
    is_active: true
  },
  {
    id: 'prod-003',
    title: 'Warm Harmony Heating Belt',
    description: 'Rechargeable wireless massage and heating belt providing rapid soothing thermal therapy directly to cramps and lower back pain.',
    price_zar: 350.00,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    product_url: 'https://happysplurge.co.za/products/heating-belt',
    category: 'hormonal',
    tags: ['cramps', 'pain-relief', 'comfort'],
    is_active: true
  },
  {
    id: 'prod-004',
    title: 'Golden Milk Turmeric Latte Blend',
    description: 'Premium organic anti-inflammatory blend combining turmeric, ginger, cardamom, and black pepper. Perfect warm beverage for your Luteal phase.',
    price_zar: 150.00,
    image_url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=400&q=80',
    product_url: 'https://happysplurge.co.za/products/turmeric-latte',
    category: 'nutrition',
    tags: ['turmeric', 'warm-drink', 'nutrition'],
    is_active: true
  },
  {
    id: 'prod-005',
    title: 'Rose Quartz Grounding Stone',
    description: 'Polished natural rose quartz crystals ideal for anchoring during cycle journaling or meditating to encourage self-love.',
    price_zar: 190.00,
    image_url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=400&q=80',
    product_url: 'https://happysplurge.co.za/products/grounding-stone',
    category: 'spirituality',
    tags: ['crystals', 'meditation', 'love'],
    is_active: true
  }
];

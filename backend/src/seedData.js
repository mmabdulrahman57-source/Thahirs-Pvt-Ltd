import bcrypt from 'bcryptjs';
import { Category, Brand, Product, User, TeamMember, Testimonial, Project, Gallery, resetDb, saveSettings, Faq, Download } from './jsonStore.js';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categories = [
  { name: 'Steam Boiler Fittings', icon: 'Flame', order: 1, description: 'Premium steam boiler fittings and accessories from leading international manufacturers.' },
  { name: 'Waterworks Materials', icon: 'Droplets', order: 2, description: 'Complete range of waterworks materials for municipal and industrial applications.' },
  { name: 'Industrial Pipes', icon: 'Cylinder', order: 3, description: 'Ductile iron, steel, and specialty pipes for industrial piping systems.' },
  { name: 'Pipe Fittings', icon: 'GitBranch', order: 4, description: 'Comprehensive pipe fittings for all industrial applications.' },
  { name: 'Industrial Valves', icon: 'Settings', order: 5, description: 'Gate valves, globe valves, check valves, and specialty valves.' },
  { name: 'Pneumatic Systems', icon: 'Wind', order: 6, description: 'Pneumatic fittings, cylinders, and control systems.' },
  { name: 'Hydraulic Equipment', icon: 'Gauge', order: 7, description: 'Hydraulic fittings, hoses, and industrial hydraulic components.' },
  { name: 'Meters & Instruments', icon: 'Activity', order: 8, description: 'Precision meters, gauges, and control instruments.' },
  { name: 'Fire Protection Systems', icon: 'Shield', order: 9, description: 'Fire protection valves, fittings, and system components.' },
  { name: 'Packing & Insulation', icon: 'Layers', order: 10, description: 'Industrial insulation materials and packing solutions.' },
  { name: 'Service Station Equipment', icon: 'Fuel', order: 11, description: 'Service station equipment from Bonezzi and other leading brands.' },
  { name: 'Industrial Chemicals', icon: 'FlaskConical', order: 12, description: 'Industrial chemicals and treatment solutions.' },
];

const brands = [
  { name: 'Toyo Valve', country: 'Japan', featured: true },
  { name: 'Miyawaki', country: 'Japan', featured: true },
  { name: 'Izocam', country: 'Turkey', featured: true },
  { name: 'Bonezzi', country: 'Italy', featured: true },
  { name: 'Saginomiya', country: 'Japan', featured: true },
  { name: 'Syddal', country: 'UK', featured: true },
  { name: 'Empeo', country: 'Germany', featured: true },
  { name: 'Shandong Ductile', country: 'China', featured: true },
  { name: 'Sanwa', country: 'Japan', featured: true },
  { name: 'Asahi', country: 'Japan', featured: true },
];

const productTemplates = [
  { name: 'Steam Trap - Miyawaki', category: 'Steam Boiler Fittings', brand: 'Miyawaki', tags: ['steam', 'trap'] },
  { name: 'Gate Valve - Toyo', category: 'Industrial Valves', brand: 'Toyo Valve', tags: ['valve', 'gate'] },
  { name: 'Ductile Iron Pipe - Shandong', category: 'Industrial Pipes', brand: 'Shandong Ductile', tags: ['pipe'] },
  { name: 'Glass Wool Insulation - Izocam', category: 'Packing & Insulation', brand: 'Izocam', tags: ['insulation'] },
  { name: 'Pressure Gauge - Empeo', category: 'Meters & Instruments', brand: 'Empeo', tags: ['gauge'] },
  { name: 'Pipe Clamp - Syddal', category: 'Pipe Fittings', brand: 'Syddal', tags: ['clamp'] },
  { name: 'Expansion Joint', category: 'Pipe Fittings', brand: 'Toyo Valve', tags: ['expansion'] },
  { name: 'Pneumatic Fitting Set', category: 'Pneumatic Systems', brand: 'Saginomiya', tags: ['pneumatic'] },
  { name: 'Water Meter - Sanwa', category: 'Meters & Instruments', brand: 'Sanwa', tags: ['meter'] },
  { name: 'Fire Hydrant Valve', category: 'Fire Protection Systems', brand: 'Toyo Valve', tags: ['fire'] },
  { name: 'Service Station Dispenser', category: 'Service Station Equipment', brand: 'Bonezzi', tags: ['dispenser'] },
  { name: 'Hydraulic Hose Assembly', category: 'Hydraulic Equipment', brand: 'Saginomiya', tags: ['hydraulic'] },
  { name: 'Check Valve - Miyawaki', category: 'Industrial Valves', brand: 'Miyawaki', tags: ['check'] },
  { name: 'Waterworks Gate Valve', category: 'Waterworks Materials', brand: 'Asahi', tags: ['waterworks'] },
  { name: 'Industrial Chemical Treatment', category: 'Industrial Chemicals', brand: 'Empeo', tags: ['chemical'] },
];

export async function seedIfEmpty() {
  if (User.countDocuments() > 0) return;
  console.log('Seeding MongoDB database...');
  resetDb();

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL || 'admin@thahirsgroup.com', password: hashedPassword, role: 'admin', adminRole: 'super_admin' });

  const createdCategories = Category.insertMany(categories.map(c => ({ ...c, slug: slugify(c.name) })));
  const createdBrands = Brand.insertMany(brands);
  const brandMap = Object.fromEntries(createdBrands.map(b => [b.name, b._id]));
  const catMap = Object.fromEntries(createdCategories.map(c => [c.name, c._id]));

  Product.insertMany(productTemplates.map((p, i) => ({
    name: p.name, slug: slugify(p.name),
    description: `High-quality ${p.name} supplied by THAHIRS (PVT) LTD. Genuine international brand with full technical support.`,
    category: catMap[p.category], brand: brandMap[p.brand], tags: p.tags, featured: i < 6,
    specifications: [
      { key: 'Brand', value: p.brand },
      { key: 'Availability', value: 'In Stock' },
      { key: 'Delivery', value: 'Island-wide' },
    ],
  })));

  TeamMember.insertMany([
    { name: 'M.T.M.S. Deen', position: 'Chairman', experience: '30+ years in Industrial Hardware', email: 'info@thahirsgroup.com', order: 1 },
    { name: 'M.T.M. Kamal Pasha', position: 'Managing Director', experience: 'Dip. In BM (NIBM) | 50+ years experience', email: 'info@thahirsgroup.com', order: 2 },
  ]);

  Testimonial.insertMany([
    { name: 'Industrial Client', company: 'Leading Manufacturing Plant', content: 'THAHIRS has been our trusted supplier for over a decade.', rating: 5, featured: true },
    { name: 'Engineering Contractor', company: 'Major Construction Firm', content: 'From a single screw to complete project supplies, THAHIRS delivers consistently.', rating: 5, featured: true },
    { name: 'Water Board Official', company: 'Government Project', content: 'We rely on THAHIRS for waterworks materials and valves.', rating: 5, featured: true },
  ]);

  Project.insertMany([
    { title: 'Industrial Valve Supply - Power Plant', description: 'Complete valve supply for power generation facility.', industry: 'Power Plants', location: 'Western Province', featured: true },
    { title: 'Waterworks Pipeline Project', description: 'Ductile iron pipes for municipal water supply.', industry: 'Water Supply', location: 'Colombo', featured: true },
    { title: 'Hotel HVAC Piping System', description: 'Complete piping solutions for luxury hotel.', industry: 'Hotels', location: 'Colombo', featured: true },
    { title: 'Factory Pneumatic Systems', description: 'Pneumatic fittings for manufacturing facility.', industry: 'Manufacturing', location: 'Kandy', featured: true },
  ]);

  Gallery.insertMany([
    { title: 'THAHIRS Office - Quarry Road', category: 'office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', featured: true },
    { title: 'Industrial Warehouse', category: 'warehouse', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', featured: true },
    { title: 'Product Display Store', category: 'store', url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c?w=800', featured: true },
    { title: 'Reception Area', category: 'office', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },
    { title: 'Loading Area', category: 'warehouse', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da195d?w=800' },
    { title: 'Valve Inventory', category: 'products', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800' },
  ]);

  Faq.insertMany([
    { question: 'What products does THAHIRS supply?', answer: 'Steam boiler fittings, waterworks materials, pipes, valves, pneumatic systems, and industrial equipment.', category: 'General', order: 1 },
    { question: 'Do you deliver island-wide?', answer: 'Yes, we provide island-wide delivery across Sri Lanka.', category: 'Delivery', order: 2 },
    { question: 'How do I request a quotation?', answer: 'Register on our website, add products, and submit a quotation request.', category: 'Quotations', order: 3 },
  ]);

  Download.insertMany([
    { title: 'Product Catalogue 2026', type: 'catalogue', url: '/downloads/catalogue.pdf', category: 'catalogue' },
    { title: 'Company Profile', type: 'brochure', url: '/downloads/profile.pdf', category: 'brochure' },
  ]);

  saveSettings({
    company: { name: 'THAHIRS (PVT) LTD', address: 'No. 5, Quarry Road, Colombo 12', phone: '+94 11 2424999', email: 'info@thahirsgroup.com', whatsapp: '94772424999', hours: 'Mon-Sat 8:30 AM - 5:30 PM' },
    email: { smtpHost: '', smtpPort: 587, smtpUser: '', fromEmail: 'info@thahirsgroup.com' },
    whatsapp: { enabled: true, number: '94772424999' },
    seo: { defaultTitle: 'THAHIRS (PVT) LTD | Engineering Excellence Since 1949', defaultDescription: 'Trusted industrial hardware supplier in Sri Lanka.' },
    tax: { vatPercentage: 18, enabled: true, autoApply: true },
  });

  console.log('MongoDB database seeded!');
}

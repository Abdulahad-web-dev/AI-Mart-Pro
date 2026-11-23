import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

// Try loading Prisma if available, with graceful fallback
let PrismaClient = null;
try {
  const mod = await import('@prisma/client');
  PrismaClient = mod.PrismaClient || mod.default?.PrismaClient;
} catch (e) {
  // Prisma client not generated or commonjs issue
}

const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const storeFile = path.join(dataDir, 'aimart_store.json');

// Initial seed template for standalone / demo mode
function getInitialSeed() {
  const hash = bcrypt.hashSync('Demo12345!', 10);
  const now = new Date();

  const users = [
    {
      id: 'usr-customer-1',
      name: 'Customer Demo',
      email: 'customer@aimart.test',
      passwordHash: hash,
      role: 'CUSTOMER',
      phone: '+92 300 1234567',
      address: 'Suite 402, Al-Hafeez Heights, Gulberg III, Lahore, Pakistan',
      suspended: false,
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'usr-vendor-1',
      name: 'Vendor Demo',
      email: 'vendor@aimart.test',
      passwordHash: hash,
      role: 'VENDOR',
      phone: '+92 321 9876543',
      address: 'Tech Innovation Park, Sector I-9, Islamabad, Pakistan',
      suspended: false,
      createdAt: new Date(now.getTime() - 120 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
      vendorProfile: {
        id: 'vp-1',
        userId: 'usr-vendor-1',
        storeName: 'Northstar AI Electronics & Luxury',
        description: 'Pioneering intelligent gear, flagship audio, and ergonomic essentials.',
        city: 'Lahore'
      }
    },
    {
      id: 'usr-admin-1',
      name: 'Admin Demo',
      email: 'admin@aimart.test',
      passwordHash: hash,
      role: 'ADMIN',
      phone: '+92 333 5551212',
      address: 'Operations HQ, Blue Area, Islamabad',
      suspended: false,
      createdAt: new Date(now.getTime() - 180 * 86400000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'usr-delivery-1',
      name: 'Delivery Demo',
      email: 'delivery@aimart.test',
      passwordHash: hash,
      role: 'DELIVERY',
      phone: '+92 345 7778899',
      address: 'Logistics Depot 4, Korangi Industrial Area, Karachi',
      suspended: false,
      createdAt: new Date(now.getTime() - 100 * 86400000).toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const categories = [
    { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
    { id: 'cat-2', name: 'Fashion', slug: 'fashion' },
    { id: 'cat-3', name: 'Home & Living', slug: 'home-living' },
    { id: 'cat-4', name: 'Beauty', slug: 'beauty' },
    { id: 'cat-5', name: 'Sports', slug: 'sports' },
    { id: 'cat-6', name: 'Books', slug: 'books' }
  ];

  const rawProducts = [
    ['Noise Cancelling Headphones Pro', 'Electronics', 18999, 24999, 24, 'Flagship wireless active noise cancelling headphones with 40mm titanium drivers, 45h battery life, multi-point Bluetooth 5.4, and studio microphone array.'],
    ['Pro Wireless Earbuds Spatial', 'Electronics', 8999, 12999, 43, 'Compact true wireless Bluetooth earbuds with active noise cancellation, transparency mode, wireless charging case, and IPX7 sweat & water resistance.'],
    ['Smart AMOLED Fitness Watch', 'Electronics', 13999, 16999, 31, 'Always-on 1.43-inch AMOLED display with continuous heart rate, SpO2 blood oxygen, sleep stage tracking, 120+ sport modes, and 14-day battery reserve.'],
    ['RGB Tactile Mechanical Keyboard', 'Electronics', 10999, 14999, 18, 'Custom hot-swappable mechanical switches, sound-dampening silicone gaskets, per-key RGB backlighting with 18 dynamic effects, and braided USB-C cable.'],
    ['Portable 360 Spatial Speaker', 'Electronics', 7499, 9999, 36, '30W omnidirectional acoustic driver with deep bass radiator, IP67 waterproof design, and 24-hour non-stop party playback.'],
    ['Minimalist Carbon Everyday Backpack', 'Fashion', 4999, 6999, 23, 'Water-repellent structured commuter backpack featuring 16-inch fleece laptop sleeve, hidden anti-theft passport pocket, and ergonomic airflow straps.'],
    ['Classic Heritage Canvas Sneakers', 'Fashion', 6499, 8499, 27, 'Timeless vulcanized canvas low-tops engineered with high-density ortholite comfort insoles and vulcanized rubber grip outsole.'],
    ['Heavyweight Brushed Cotton Hoodie', 'Fashion', 3599, 4999, 47, '450 GSM ultra-soft combed fleece pullover hoodie with reinforced double-stitched kangaroo pocket and custom ribbed cuffs.'],
    ['Modern Sculptural Ceramic Lamp', 'Home & Living', 7999, 9999, 12, 'Hand-glazed organic ceramic base featuring 3-step capacitive touch dimming, 2700K warm ambient glow, and linen lampshade.'],
    ['Ultrasonic Smart Aroma Diffuser', 'Home & Living', 5499, 7499, 29, 'Whisper-quiet ultrasonic mist generator with 400ml reservoir, ambient RGB mood lighting, and automatic waterless shutoff.'],
    ['Double-Wall Vacuum Insulated Tumbler', 'Home & Living', 2199, 3299, 65, 'Food-grade 18/8 stainless steel thermal mug keeping coffee piping hot for 8 hours or iced cold for 24 hours with leakproof lid.'],
    ['Hydrating Botanical Skincare Ritual Kit', 'Beauty', 6299, 7999, 19, 'Complete daily regimen featuring amino acid foaming cleanser, hyaluronic hydration essence, and barrier-repair ceramide cream.'],
    ['Pure Hyaluronic Moisture Boost Serum', 'Beauty', 2999, 3999, 33, 'Multi-molecular weight hyaluronic acid complex delivering instant plumping hydration without silicone residue or greasiness.'],
    ['High-Density Non-Slip Yoga Mat', 'Sports', 4299, 5799, 40, '6mm eco-friendly TPE alignment mat with laser-engraved positioning guides, superior joint cushioning, and textured dual-sided grip.'],
    ['Precision Quick-Select Adjustable Dumbbell', 'Sports', 11999, 14999, 9, 'Compact rapid-dial selector replacing 15 sets of weights from 2.5kg to 24kg with laser-machined steel weight plates.'],
    ['Vacuum Insulated Steel Sports Flask', 'Sports', 1999, 2699, 71, 'Wide-mouth 1000ml powder-coated hydration flask with silicone bumper base and leakproof sport straw cap for active lifestyles.'],
    ['The Creative Momentum Handbook', 'Books', 1999, 2499, 28, 'Practical hardcover playbook on overcoming creative blocks, cultivating deep work habits, and designing enduring daily rituals.'],
    ['Cognitive Productivity & Focus Journal', 'Books', 1599, 2199, 38, 'Undated 6-month quarterly planner featuring time-blocking spreads, priority matrix grids, and daily mindfulness reflections.']
  ];

  const catMap = Object.fromEntries(categories.map(c => [c.name, c.id]));
  const products = rawProducts.map((p, idx) => {
    const slug = 'demo-' + p[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      id: `prod-${idx}`,
      name: p[0],
      slug,
      categoryId: catMap[p[1]],
      vendorId: 'usr-vendor-1',
      price: p[2],
      comparePrice: p[3],
      stock: p[4],
      description: p[5],
      featured: idx < 6,
      active: true,
      moderation: 'VISIBLE',
      createdAt: new Date(now.getTime() - (idx + 5) * 86400000).toISOString(),
      updatedAt: now.toISOString(),
      images: [
        { id: `img-${idx}-1`, productId: `prod-${idx}`, url: `/images/${idx}.${idx < 3 ? 'jpg' : 'svg'}`, sortOrder: 0 }
      ]
    };
  });

  const reviews = [
    {
      id: 'rev-1',
      productId: 'prod-0',
      userId: 'usr-customer-1',
      rating: 5,
      text: 'The noise cancellation completely blocks out traffic and fan noise. Build quality is top-notch, feels just as good as Sony or Bose!',
      status: 'VISIBLE',
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString()
    },
    {
      id: 'rev-2',
      productId: 'prod-1',
      userId: 'usr-customer-1',
      rating: 5,
      text: 'Crystal clear sound and the fit is remarkably secure while running. Battery lasts easily for a full week.',
      status: 'VISIBLE',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString()
    },
    {
      id: 'rev-3',
      productId: 'prod-3',
      userId: 'usr-customer-1',
      rating: 4,
      text: 'Tactile feel and deep sound profile are unmatched at this price point. Fast USB-C connection and solid heavy frame.',
      status: 'VISIBLE',
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString()
    }
  ];

  // Seed 38 order records for historical sales analytics and AI forecasting
  const statuses = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const orders = [];
  const orderItems = [];
  const payments = [];

  for (let i = 0; i < 38; i++) {
    const prod = products[i % products.length];
    const qty = 1 + (i % 3);
    const day = (38 - i) * 2;
    const orderDate = new Date(now.getTime() - day * 86400000).toISOString();
    const status = i < 4 ? statuses[i] : 'DELIVERED';
    const total = prod.price * qty;
    const orderId = `ord-${i + 1}`;
    const itemId = `oi-${i + 1}`;

    orders.push({
      id: orderId,
      customerId: 'usr-customer-1',
      total,
      status,
      address: 'Suite 402, Al-Hafeez Heights, Gulberg III, Lahore, Pakistan',
      phone: '+92 300 1234567',
      paymentMethod: i % 4 === 0 ? 'BANK_TRANSFER' : 'COD',
      createdAt: orderDate,
      updatedAt: orderDate
    });

    orderItems.push({
      id: itemId,
      orderId,
      productId: prod.id,
      vendorId: 'usr-vendor-1',
      nameSnapshot: prod.name,
      priceSnapshot: prod.price,
      quantity: qty,
      status: status === 'DELIVERED' ? 'DELIVERED' : 'CONFIRMED'
    });

    payments.push({
      id: `pay-${i + 1}`,
      orderId,
      amount: total,
      method: i % 4 === 0 ? 'BANK_TRANSFER' : 'COD',
      status: status === 'DELIVERED' ? 'PAID' : 'PENDING',
      createdAt: orderDate
    });
  }

  // Delivery assignments for demo
  const deliveries = [
    {
      id: 'del-1',
      orderId: 'ord-2',
      agentId: 'usr-delivery-1',
      status: 'IN_TRANSIT',
      notes: 'Out for afternoon express delivery in Gulberg',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'del-2',
      orderId: 'ord-1',
      agentId: 'usr-delivery-1',
      status: 'ASSIGNED',
      notes: 'Package ready at depot for morning dispatch',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  return {
    users,
    categories,
    products,
    productImages: products.flatMap(p => p.images),
    reviews,
    cartItems: [],
    wishlistItems: [],
    orders,
    orderItems,
    payments,
    deliveries,
    reports: [],
    predictions: [],
    auditLogs: []
  };
}

class LocalStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(storeFile)) {
        const raw = fs.readFileSync(storeFile, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialSeed();
        this.save();
      }
    } catch (e) {
      this.data = getInitialSeed();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(storeFile, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }
}

// In-Memory / File Persistent Mock Prisma Layer
function createMockPrisma() {
  const store = new LocalStore();
  const d = () => store.data;

  // Helper matching logic for Prisma queries
  function matchWhere(item, where) {
    if (!where) return true;
    for (const [key, val] of Object.entries(where)) {
      if (key === 'OR' && Array.isArray(val)) {
        const anyMatch = val.some(sub => matchWhere(item, sub));
        if (!anyMatch) return false;
        continue;
      }
      if (key === 'AND' && Array.isArray(val)) {
        const allMatch = val.every(sub => matchWhere(item, sub));
        if (!allMatch) return false;
        continue;
      }
      if (key === 'category' && typeof val === 'object') {
        const cat = d().categories.find(c => c.id === item.categoryId);
        if (!cat || !matchWhere(cat, val)) return false;
        continue;
      }
      if (key === 'order' && typeof val === 'object') {
        const ord = d().orders.find(o => o.id === item.orderId);
        if (!ord || !matchWhere(ord, val)) return false;
        continue;
      }
      if (key === 'items' && typeof val === 'object') {
        if (val.some) {
          const matchingItems = d().orderItems.filter(i => i.orderId === item.id && matchWhere(i, val.some));
          if (!matchingItems.length) return false;
          continue;
        }
      }

      const itemVal = item[key];
      if (val && typeof val === 'object' && !(val instanceof Date)) {
        if ('equals' in val && itemVal !== val.equals) return false;
        if ('not' in val && itemVal === val.not) return false;
        if ('gte' in val && Number(itemVal) < Number(val.gte)) return false;
        if ('lte' in val && Number(itemVal) > Number(val.lte)) return false;
        if ('gt' in val && Number(itemVal) <= Number(val.gt)) return false;
        if ('lt' in val && Number(itemVal) >= Number(val.lt)) return false;
        if ('contains' in val) {
          const needle = String(val.contains).toLowerCase();
          const haystack = String(itemVal || '').toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
      } else if (val !== undefined && itemVal !== val) {
        return false;
      }
    }
    return true;
  }

  function enrichProduct(p, include = {}) {
    if (!p) return null;
    const res = { ...p };
    if (include.category) {
      res.category = d().categories.find(c => c.id === p.categoryId) || null;
    }
    if (include.images) {
      const imgs = d().productImages.filter(im => im.productId === p.id);
      imgs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      res.images = imgs;
    }
    if (include.vendor) {
      const v = d().users.find(u => u.id === p.vendorId);
      res.vendor = v ? { id: v.id, name: v.name, vendorProfile: v.vendorProfile } : null;
    }
    if (include.reviews) {
      const revs = d().reviews.filter(r => r.productId === p.id && r.status === 'VISIBLE');
      res.reviews = revs.map(r => {
        const u = d().users.find(usr => usr.id === r.userId);
        return { ...r, user: u ? { name: u.name } : undefined };
      });
    }
    return res;
  }

  function enrichOrder(o, include = {}) {
    if (!o) return null;
    const res = { ...o };
    if (include.items) {
      let items = d().orderItems.filter(i => i.orderId === o.id);
      if (include.items.include?.product) {
        items = items.map(i => {
          const p = d().products.find(prod => prod.id === i.productId);
          return {
            ...i,
            product: p ? {
              images: d().productImages.filter(im => im.productId === p.id)
            } : undefined
          };
        });
      }
      res.items = items;
    }
    if (include.delivery) {
      const del = d().deliveries.find(dl => dl.orderId === o.id);
      if (del && include.delivery.include?.agent) {
        const ag = d().users.find(u => u.id === del.agentId);
        res.delivery = { ...del, agent: ag ? { id: ag.id, name: ag.name, phone: ag.phone } : null };
      } else {
        res.delivery = del || null;
      }
    }
    if (include.payment) {
      res.payment = d().payments.find(pm => pm.orderId === o.id) || null;
    }
    if (include.customer) {
      const c = d().users.find(u => u.id === o.customerId);
      res.customer = c ? { name: c.name, email: c.email } : null;
    }
    return res;
  }

  return {
    $queryRaw: async () => [{ '1': 1 }],
    $transaction: async (fnOrArray) => {
      if (typeof fnOrArray === 'function') {
        return await fnOrArray(mockDb);
      }
      if (Array.isArray(fnOrArray)) {
        return await Promise.all(fnOrArray);
      }
      return fnOrArray;
    },

    user: {
      findUnique: async ({ where = {}, include } = {}) => {
        let u = null;
        if (where.id) u = d().users.find(x => x.id === where.id);
        else if (where.email) u = d().users.find(x => x.email.toLowerCase() === where.email.toLowerCase());
        if (!u) return null;
        return { ...u };
      },
      findFirst: async ({ where = {} } = {}) => {
        return d().users.find(u => matchWhere(u, where)) || null;
      },
      findMany: async ({ where = {}, select, orderBy } = {}) => {
        let list = d().users.filter(u => matchWhere(u, where));
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (select) {
          list = list.map(u => {
            const res = {};
            for (const k of Object.keys(select)) if (select[k]) res[k] = u[k];
            return res;
          });
        }
        return list;
      },
      create: async ({ data, include }) => {
        const id = 'usr-' + Math.random().toString(36).slice(2, 9);
        const { vendorProfile, ...fields } = data;
        const now = new Date().toISOString();
        const user = {
          id,
          ...fields,
          suspended: false,
          createdAt: now,
          updatedAt: now
        };
        if (vendorProfile?.create) {
          user.vendorProfile = {
            id: 'vp-' + Math.random().toString(36).slice(2, 9),
            userId: id,
            storeName: vendorProfile.create.storeName || `${user.name}'s Store`,
            description: vendorProfile.create.description || '',
            city: vendorProfile.create.city || 'Pakistan'
          };
        }
        d().users.push(user);
        store.save();
        return { ...user };
      },
      update: async ({ where, data, include }) => {
        const u = d().users.find(x => x.id === where.id);
        if (!u) throw new Error('User not found');
        const { vendorProfile, ...fields } = data;
        Object.assign(u, fields, { updatedAt: new Date().toISOString() });
        if (vendorProfile?.upsert) {
          if (!u.vendorProfile) {
            u.vendorProfile = {
              id: 'vp-' + Math.random().toString(36).slice(2, 9),
              userId: u.id,
              ...vendorProfile.upsert.create
            };
          } else {
            Object.assign(u.vendorProfile, vendorProfile.upsert.update);
          }
        }
        store.save();
        return { ...u };
      },
      count: async ({ where } = {}) => {
        return d().users.filter(u => matchWhere(u, where)).length;
      }
    },

    category: {
      findMany: async ({ orderBy } = {}) => {
        const list = [...d().categories];
        if (orderBy?.name === 'asc') list.sort((a, b) => a.name.localeCompare(b.name));
        return list;
      },
      findUnique: async ({ where }) => {
        if (where.id) return d().categories.find(c => c.id === where.id) || null;
        if (where.slug) return d().categories.find(c => c.slug === where.slug) || null;
        return null;
      },
      create: async ({ data }) => {
        const id = 'cat-' + Math.random().toString(36).slice(2, 9);
        const cat = { id, ...data };
        d().categories.push(cat);
        store.save();
        return cat;
      },
      upsert: async ({ where, create, update }) => {
        let cat = d().categories.find(c => c.slug === where.slug);
        if (cat) {
          Object.assign(cat, update);
        } else {
          cat = { id: 'cat-' + Math.random().toString(36).slice(2, 9), ...create };
          d().categories.push(cat);
        }
        store.save();
        return cat;
      }
    },

    product: {
      findMany: async ({ where, include, orderBy, skip = 0, take = 50 } = {}) => {
        let list = d().products.filter(p => matchWhere(p, where));
        if (orderBy?.price === 'asc') list.sort((a, b) => Number(a.price) - Number(b.price));
        else if (orderBy?.price === 'desc') list.sort((a, b) => Number(b.price) - Number(a.price));
        else if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const paged = list.slice(skip, skip + take);
        return paged.map(p => enrichProduct(p, include));
      },
      findFirst: async ({ where, include }) => {
        const p = d().products.find(prod => matchWhere(prod, where));
        return p ? enrichProduct(p, include) : null;
      },
      findUnique: async ({ where, include }) => {
        let p = null;
        if (where.id) p = d().products.find(x => x.id === where.id);
        else if (where.slug) p = d().products.find(x => x.slug === where.slug);
        return p ? enrichProduct(p, include) : null;
      },
      create: async ({ data, include }) => {
        const id = 'prod-' + Math.random().toString(36).slice(2, 9);
        const now = new Date().toISOString();
        const p = {
          id,
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          price: Number(data.price),
          comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
          stock: Number(data.stock || 0),
          featured: Boolean(data.featured),
          active: data.active !== undefined ? Boolean(data.active) : true,
          moderation: 'VISIBLE',
          categoryId: data.categoryId,
          vendorId: data.vendorId,
          createdAt: now,
          updatedAt: now,
          images: []
        };
        d().products.unshift(p);
        store.save();
        return enrichProduct(p, include);
      },
      update: async ({ where, data, include }) => {
        const p = d().products.find(x => x.id === where.id);
        if (!p) throw new Error('Product not found');
        Object.assign(p, data, { updatedAt: new Date().toISOString() });
        store.save();
        return enrichProduct(p, include);
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const p of d().products) {
          if (matchWhere(p, where)) {
            if (data.stock && typeof data.stock === 'object' && 'decrement' in data.stock) {
              p.stock = Math.max(0, p.stock - data.stock.decrement);
            } else if (data.stock !== undefined) {
              p.stock = Number(data.stock);
            }
            if (data.moderation) p.moderation = data.moderation;
            p.updatedAt = new Date().toISOString();
            count++;
          }
        }
        store.save();
        return { count };
      },
      count: async ({ where } = {}) => {
        return d().products.filter(p => matchWhere(p, where)).length;
      }
    },

    productImage: {
      create: async ({ data }) => {
        const id = 'img-' + Math.random().toString(36).slice(2, 9);
        const im = { id, ...data };
        d().productImages.push(im);
        const prod = d().products.find(p => p.id === data.productId);
        if (prod) {
          if (!prod.images) prod.images = [];
          prod.images.push(im);
        }
        store.save();
        return im;
      },
      deleteMany: async ({ where }) => {
        d().productImages = d().productImages.filter(im => !matchWhere(im, where));
        store.save();
        return { count: 1 };
      }
    },

    cartItem: {
      findMany: async ({ where, include }) => {
        const items = d().cartItems.filter(i => matchWhere(i, where));
        return items.map(i => {
          const res = { ...i };
          if (include?.product) {
            const p = d().products.find(prod => prod.id === i.productId);
            res.product = enrichProduct(p, include.product.include);
          }
          return res;
        });
      },
      findUnique: async ({ where }) => {
        if (where.userId_productId) {
          const { userId, productId } = where.userId_productId;
          return d().cartItems.find(i => i.userId === userId && i.productId === productId) || null;
        }
        if (where.id) return d().cartItems.find(i => i.id === where.id) || null;
        return null;
      },
      findFirst: async ({ where, include }) => {
        const item = d().cartItems.find(i => matchWhere(i, where));
        if (!item) return null;
        const res = { ...item };
        if (include?.product) {
          const p = d().products.find(prod => prod.id === item.productId);
          res.product = enrichProduct(p);
        }
        return res;
      },
      upsert: async ({ where, create, update }) => {
        let item = null;
        if (where.userId_productId) {
          const { userId, productId } = where.userId_productId;
          item = d().cartItems.find(i => i.userId === userId && i.productId === productId);
        }
        if (item) {
          Object.assign(item, update);
        } else {
          item = { id: 'ci-' + Math.random().toString(36).slice(2, 9), ...create };
          d().cartItems.push(item);
        }
        store.save();
        return { ...item };
      },
      update: async ({ where, data }) => {
        const item = d().cartItems.find(i => i.id === where.id);
        if (!item) throw new Error('Cart item not found');
        Object.assign(item, data);
        store.save();
        return { ...item };
      },
      deleteMany: async ({ where }) => {
        const prev = d().cartItems.length;
        d().cartItems = d().cartItems.filter(i => !matchWhere(i, where));
        store.save();
        return { count: prev - d().cartItems.length };
      }
    },

    wishlistItem: {
      findMany: async ({ where, include }) => {
        const items = d().wishlistItems.filter(w => matchWhere(w, where));
        return items.map(w => {
          const res = { ...w };
          if (include?.product) {
            const p = d().products.find(prod => prod.id === w.productId);
            res.product = enrichProduct(p, include.product.include);
          }
          return res;
        });
      },
      findUnique: async ({ where }) => {
        if (where.userId_productId) {
          const { userId, productId } = where.userId_productId;
          return d().wishlistItems.find(w => w.userId === userId && w.productId === productId) || null;
        }
        return null;
      },
      upsert: async ({ where, create }) => {
        let item = null;
        if (where.userId_productId) {
          const { userId, productId } = where.userId_productId;
          item = d().wishlistItems.find(w => w.userId === userId && w.productId === productId);
        }
        if (!item) {
          item = { id: 'wl-' + Math.random().toString(36).slice(2, 9), ...create };
          d().wishlistItems.push(item);
          store.save();
        }
        return { ...item };
      },
      deleteMany: async ({ where }) => {
        d().wishlistItems = d().wishlistItems.filter(w => !matchWhere(w, where));
        store.save();
        return { count: 1 };
      }
    },

    order: {
      findUnique: async ({ where, include }) => {
        const o = d().orders.find(ord => ord.id === where.id);
        return o ? enrichOrder(o, include) : null;
      },
      findMany: async ({ where, include, orderBy, take = 100 } = {}) => {
        let list = d().orders.filter(o => matchWhere(o, where));
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const limited = list.slice(0, take);
        return limited.map(o => enrichOrder(o, include));
      },
      create: async ({ data }) => {
        const id = 'ord-' + (d().orders.length + 1) + '-' + Math.random().toString(36).slice(2, 6);
        const now = new Date().toISOString();
        const { items, payment, ...fields } = data;
        const o = {
          id,
          ...fields,
          createdAt: now,
          updatedAt: now
        };
        d().orders.unshift(o);

        if (items?.create) {
          for (const it of items.create) {
            d().orderItems.push({
              id: 'oi-' + Math.random().toString(36).slice(2, 9),
              orderId: id,
              ...it,
              status: 'CONFIRMED'
            });
          }
        }
        if (payment?.create) {
          d().payments.push({
            id: 'pay-' + Math.random().toString(36).slice(2, 9),
            orderId: id,
            ...payment.create,
            createdAt: now
          });
        }
        store.save();
        return enrichOrder(o, { items: true, payment: true });
      },
      update: async ({ where, data }) => {
        const o = d().orders.find(ord => ord.id === where.id);
        if (!o) throw new Error('Order not found');
        Object.assign(o, data, { updatedAt: new Date().toISOString() });
        store.save();
        return enrichOrder(o);
      },
      count: async ({ where } = {}) => {
        return d().orders.filter(o => matchWhere(o, where)).length;
      },
      aggregate: async ({ where, _sum }) => {
        const list = d().orders.filter(o => matchWhere(o, where));
        const total = list.reduce((s, o) => s + Number(o.total || 0), 0);
        return { _sum: { total } };
      }
    },

    orderItem: {
      findMany: async ({ where, include, select } = {}) => {
        let list = d().orderItems.filter(i => matchWhere(i, where));
        if (include?.order) {
          list = list.map(i => {
            const ord = d().orders.find(o => o.id === i.orderId);
            return {
              ...i,
              order: ord ? { createdAt: new Date(ord.createdAt) } : { createdAt: new Date() }
            };
          });
        }
        return list;
      },
      findFirst: async ({ where }) => {
        return d().orderItems.find(i => matchWhere(i, where)) || null;
      },
      count: async ({ where } = {}) => {
        return d().orderItems.filter(i => matchWhere(i, where)).length;
      },
      update: async ({ where, data }) => {
        const i = d().orderItems.find(it => it.id === where.id);
        if (!i) throw new Error('OrderItem not found');
        Object.assign(i, data);
        store.save();
        return { ...i };
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const it of d().orderItems) {
          if (matchWhere(it, where)) {
            Object.assign(it, data);
            count++;
          }
        }
        store.save();
        return { count };
      }
    },

    delivery: {
      findMany: async ({ where, include, orderBy } = {}) => {
        let list = d().deliveries.filter(del => matchWhere(del, where));
        if (orderBy?.updatedAt === 'desc') list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        if (include?.order) {
          list = list.map(del => {
            const ord = d().orders.find(o => o.id === del.orderId);
            return {
              ...del,
              order: ord ? {
                id: ord.id,
                address: ord.address,
                phone: ord.phone,
                status: ord.status,
                createdAt: ord.createdAt,
                items: d().orderItems.filter(i => i.orderId === ord.id).map(i => ({
                  nameSnapshot: i.nameSnapshot,
                  quantity: i.quantity
                }))
              } : null
            };
          });
        }
        return list;
      },
      findFirst: async ({ where }) => {
        return d().deliveries.find(dl => matchWhere(dl, where)) || null;
      },
      upsert: async ({ where, create, update }) => {
        let del = d().deliveries.find(dl => dl.orderId === where.orderId);
        const now = new Date().toISOString();
        if (del) {
          Object.assign(del, update, { updatedAt: now });
        } else {
          del = {
            id: 'del-' + Math.random().toString(36).slice(2, 9),
            ...create,
            status: 'ASSIGNED',
            notes: '',
            createdAt: now,
            updatedAt: now
          };
          d().deliveries.push(del);
        }
        store.save();
        return { ...del };
      },
      update: async ({ where, data }) => {
        const del = d().deliveries.find(dl => dl.id === where.id);
        if (!del) throw new Error('Delivery not found');
        Object.assign(del, data, { updatedAt: new Date().toISOString() });
        store.save();
        return { ...del };
      }
    },

    review: {
      findMany: async ({ where, include, orderBy } = {}) => {
        let list = d().reviews.filter(r => matchWhere(r, where));
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list.map(r => {
          const res = { ...r };
          if (include?.user) {
            const u = d().users.find(usr => usr.id === r.userId);
            res.user = u ? { name: u.name } : { name: 'Customer' };
          }
          return res;
        });
      },
      findUnique: async ({ where }) => {
        if (where.productId_userId) {
          const { productId, userId } = where.productId_userId;
          return d().reviews.find(r => r.productId === productId && r.userId === userId) || null;
        }
        if (where.id) return d().reviews.find(r => r.id === where.id) || null;
        return null;
      },
      upsert: async ({ where, create, update }) => {
        let r = null;
        if (where.productId_userId) {
          const { productId, userId } = where.productId_userId;
          r = d().reviews.find(rev => rev.productId === productId && rev.userId === userId);
        }
        const now = new Date().toISOString();
        if (r) {
          Object.assign(r, update);
        } else {
          r = {
            id: 'rev-' + Math.random().toString(36).slice(2, 9),
            ...create,
            createdAt: now
          };
          d().reviews.push(r);
        }
        store.save();
        return { ...r };
      },
      update: async ({ where, data }) => {
        const r = d().reviews.find(rev => rev.id === where.id);
        if (!r) throw new Error('Review not found');
        Object.assign(r, data);
        store.save();
        return { ...r };
      }
    },

    report: {
      create: async ({ data }) => {
        const id = 'rep-' + Math.random().toString(36).slice(2, 9);
        const r = {
          id,
          ...data,
          status: 'OPEN',
          createdAt: new Date().toISOString()
        };
        d().reports.unshift(r);
        store.save();
        return r;
      },
      findMany: async ({ include, orderBy } = {}) => {
        let list = [...d().reports];
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list.map(r => {
          const res = { ...r };
          if (include?.user) {
            const u = d().users.find(usr => usr.id === r.userId);
            res.user = u ? { name: u.name } : null;
          }
          if (include?.product && r.productId) {
            const p = d().products.find(prod => prod.id === r.productId);
            res.product = p ? { name: p.name } : null;
          }
          return res;
        });
      },
      findUnique: async ({ where }) => {
        return d().reports.find(r => r.id === where.id) || null;
      },
      update: async ({ where, data }) => {
        const r = d().reports.find(rep => rep.id === where.id);
        if (!r) throw new Error('Report not found');
        Object.assign(r, data);
        store.save();
        return { ...r };
      },
      count: async ({ where } = {}) => {
        return d().reports.filter(r => matchWhere(r, where)).length;
      }
    },

    predictionRecord: {
      create: async ({ data }) => {
        const id = 'pred-' + Math.random().toString(36).slice(2, 9);
        const rec = {
          id,
          ...data,
          createdAt: new Date().toISOString()
        };
        d().predictions.unshift(rec);
        store.save();
        return rec;
      },
      findMany: async ({ where, include, orderBy, take = 25 } = {}) => {
        let list = d().predictions.filter(pr => matchWhere(pr, where));
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const limited = list.slice(0, take);
        return limited.map(pr => {
          const res = { ...pr };
          if (include?.product) {
            const p = d().products.find(prod => prod.id === pr.productId);
            res.product = p ? { name: p.name } : null;
          }
          return res;
        });
      },
      findFirst: async ({ where, orderBy }) => {
        let list = d().predictions.filter(pr => matchWhere(pr, where));
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list[0] || null;
      }
    },

    auditLog: {
      create: async ({ data }) => {
        const log = {
          id: 'aud-' + Math.random().toString(36).slice(2, 9),
          ...data,
          createdAt: new Date().toISOString()
        };
        d().auditLogs.unshift(log);
        store.save();
        return log;
      },
      findMany: async ({ orderBy, take = 50 } = {}) => {
        let list = [...d().auditLogs];
        if (orderBy?.createdAt === 'desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list.slice(0, take);
      }
    }
  };
}

const mockDb = createMockPrisma();

// Export unified db: if Prisma is functional and connects to real PG, use it; otherwise seamlessly use mockDb
export let db = mockDb;

if (PrismaClient && process.env.DATABASE_URL && !process.env.FORCE_LOCAL_DB) {
  try {
    const realPrisma = new PrismaClient();
    // Test connectivity
    await realPrisma.$queryRaw`SELECT 1`;
    db = realPrisma;
    console.log('[AI Mart Pro DB] Connected to PostgreSQL via Prisma.');
  } catch (e) {
    console.log('[AI Mart Pro DB] PostgreSQL unavailable; using built-in persistent store.');
    db = mockDb;
  }
} else {
  console.log('[AI Mart Pro DB] Operating in self-contained persistent store mode.');
}

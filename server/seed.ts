import { db } from "./db";
import { categories, products, productKeys, reviews, users } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

const sampleCategories = [
  {
    nameAr: "أدوات البرمجة",
    nameEn: "Programming Tools",
    slug: "programming-tools",
    icon: "code",
  },
  {
    nameAr: "البرامج والتطبيقات",
    nameEn: "Software & Apps",
    slug: "software",
    icon: "package",
  },
  {
    nameAr: "بطاقات الألعاب",
    nameEn: "Gaming Cards",
    slug: "gaming-cards",
    icon: "gamepad-2",
  },
  {
    nameAr: "حسابات الألعاب",
    nameEn: "Gaming Accounts",
    slug: "gaming-accounts",
    icon: "user-circle",
  },
];

const sampleProducts = [
  {
    titleAr: "Visual Studio Code Pro License",
    titleEn: "Visual Studio Code Pro License",
    descriptionAr: "ترخيص احترافي لمحرر Visual Studio Code مع جميع الإضافات المميزة والدعم الفني على مدار الساعة",
    descriptionEn: "Professional license for Visual Studio Code editor with all premium extensions and 24/7 technical support",
    price: "49.99",
    originalPrice: "79.99",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop",
    stock: 50,
    categorySlug: "programming-tools",
  },
  {
    titleAr: "GitHub Copilot اشتراك سنوي",
    titleEn: "GitHub Copilot Annual Subscription",
    descriptionAr: "اشتراك سنوي في GitHub Copilot - مساعد الذكاء الاصطناعي للبرمجة الذي يساعدك على كتابة الكود بشكل أسرع",
    descriptionEn: "Annual subscription to GitHub Copilot - AI programming assistant that helps you write code faster",
    price: "99.99",
    originalPrice: "119.99",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=400&fit=crop",
    stock: 100,
    categorySlug: "programming-tools",
  },
  {
    titleAr: "JetBrains All Products Pack",
    titleEn: "JetBrains All Products Pack",
    descriptionAr: "حزمة تتضمن جميع منتجات JetBrains بما في ذلك IntelliJ IDEA و WebStorm و PyCharm وغيرها",
    descriptionEn: "Package including all JetBrains products including IntelliJ IDEA, WebStorm, PyCharm and more",
    price: "199.99",
    originalPrice: "299.99",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop",
    stock: 30,
    categorySlug: "programming-tools",
  },
  {
    titleAr: "Adobe Creative Cloud اشتراك شهري",
    titleEn: "Adobe Creative Cloud Monthly",
    descriptionAr: "اشتراك شهري في Adobe Creative Cloud يتضمن Photoshop و Illustrator و Premiere Pro وجميع التطبيقات",
    descriptionEn: "Monthly subscription to Adobe Creative Cloud including Photoshop, Illustrator, Premiere Pro and all apps",
    price: "54.99",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop",
    stock: 200,
    categorySlug: "software",
  },
  {
    titleAr: "Microsoft Office 365 ترخيص سنوي",
    titleEn: "Microsoft Office 365 Annual License",
    descriptionAr: "ترخيص سنوي لـ Microsoft Office 365 يتضمن Word و Excel و PowerPoint و Outlook مع 1TB تخزين سحابي",
    descriptionEn: "Annual license for Microsoft Office 365 including Word, Excel, PowerPoint, Outlook with 1TB cloud storage",
    price: "69.99",
    originalPrice: "99.99",
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&h=400&fit=crop",
    stock: 150,
    categorySlug: "software",
  },
  {
    titleAr: "Windows 11 Pro مفتاح ترخيص",
    titleEn: "Windows 11 Pro License Key",
    descriptionAr: "مفتاح ترخيص أصلي لنظام Windows 11 Pro مع التفعيل الرسمي والتحديثات مدى الحياة",
    descriptionEn: "Original license key for Windows 11 Pro with official activation and lifetime updates",
    price: "29.99",
    originalPrice: "139.99",
    image: "https://images.unsplash.com/photo-1624571409108-e9a41746af53?w=400&h=400&fit=crop",
    stock: 500,
    categorySlug: "software",
  },
  {
    titleAr: "بطاقة Steam Wallet $50",
    titleEn: "Steam Wallet Card $50",
    descriptionAr: "بطاقة رصيد Steam بقيمة 50 دولار أمريكي - تسليم فوري للكود",
    descriptionEn: "Steam Wallet card worth $50 USD - Instant code delivery",
    price: "52.99",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop",
    stock: 1000,
    categorySlug: "gaming-cards",
  },
  {
    titleAr: "بطاقة PlayStation $100",
    titleEn: "PlayStation Store Card $100",
    descriptionAr: "بطاقة رصيد PlayStation Store بقيمة 100 دولار - صالحة لجميع المناطق",
    descriptionEn: "PlayStation Store card worth $100 - Valid for all regions",
    price: "104.99",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    stock: 500,
    categorySlug: "gaming-cards",
  },
  {
    titleAr: "بطاقة Xbox Game Pass Ultimate 3 أشهر",
    titleEn: "Xbox Game Pass Ultimate 3 Months",
    descriptionAr: "اشتراك Xbox Game Pass Ultimate لمدة 3 أشهر - أكثر من 100 لعبة على الكمبيوتر والكونسول",
    descriptionEn: "Xbox Game Pass Ultimate subscription for 3 months - 100+ games on PC and console",
    price: "44.99",
    originalPrice: "59.99",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop",
    stock: 300,
    categorySlug: "gaming-cards",
  },
  {
    titleAr: "حساب Fortnite مع 5000 V-Bucks",
    titleEn: "Fortnite Account with 5000 V-Bucks",
    descriptionAr: "حساب Fortnite يحتوي على 5000 V-Bucks وأكثر من 50 سكن نادر - نقل آمن ومضمون",
    descriptionEn: "Fortnite account with 5000 V-Bucks and 50+ rare skins - Safe and guaranteed transfer",
    price: "79.99",
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&h=400&fit=crop",
    stock: 20,
    categorySlug: "gaming-accounts",
  },
  {
    titleAr: "حساب GTA V Online مع $10M",
    titleEn: "GTA V Online Account with $10M",
    descriptionAr: "حساب GTA V Online يحتوي على 10 مليون دولار داخل اللعبة مع مستوى 100+ وعقارات متعددة",
    descriptionEn: "GTA V Online account with $10 million in-game currency, level 100+ and multiple properties",
    price: "49.99",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop",
    stock: 15,
    categorySlug: "gaming-accounts",
  },
  {
    titleAr: "حساب Netflix Premium سنة كاملة",
    titleEn: "Netflix Premium Account 1 Year",
    descriptionAr: "حساب Netflix Premium لمدة سنة كاملة - 4K Ultra HD مع 4 شاشات متزامنة",
    descriptionEn: "Netflix Premium account for 1 full year - 4K Ultra HD with 4 simultaneous screens",
    price: "89.99",
    originalPrice: "155.88",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop",
    stock: 100,
    categorySlug: "gaming-accounts",
  },
];

function generateProductKey(prefix: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = prefix + "-";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += "-";
  }
  return key;
}

export async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) {
      console.log("Database already seeded, checking for products...");
      
      // Check if we need to add more products
      const existingProducts = await db.select().from(products);
      if (existingProducts.length < 10) {
        console.log("Adding missing products...");
        await addMissingProducts();
      }
      
      // Check if we need to add product keys
      const existingKeys = await db.select().from(productKeys);
      if (existingKeys.length < 50) {
        console.log("Adding product keys...");
        await addProductKeys();
      }
      
      // Check if we need to add reviews
      const existingReviews = await db.select().from(reviews);
      if (existingReviews.length < 5) {
        console.log("Adding sample reviews...");
        await addSampleReviews();
      }
      
      return;
    }

    console.log("Inserting categories...");
    const insertedCategories = await db.insert(categories).values(sampleCategories).returning();
    console.log(`Inserted ${insertedCategories.length} categories`);

    const categoryMap = new Map(insertedCategories.map(c => [c.slug, c.id]));

    console.log("Inserting products...");
    const productsToInsert = sampleProducts.map(({ categorySlug, ...product }) => ({
      ...product,
      categoryId: categoryMap.get(categorySlug) || null,
      isActive: true,
    }));

    const insertedProducts = await db.insert(products).values(productsToInsert).returning();
    console.log(`Inserted ${insertedProducts.length} products`);

    // Add product keys for each product
    console.log("Adding product keys...");
    await addProductKeys();

    // Add sample reviews
    console.log("Adding sample reviews...");
    await addSampleReviews();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

async function addMissingProducts() {
  try {
    const existingCategories = await db.select().from(categories);
    const categoryMap = new Map(existingCategories.map(c => [c.slug, c.id]));

    const existingProducts = await db.select().from(products);
    const existingTitles = new Set(existingProducts.map(p => p.titleEn));

    const missingProducts = sampleProducts.filter(p => !existingTitles.has(p.titleEn));
    
    if (missingProducts.length > 0) {
      const productsToInsert = missingProducts.map(({ categorySlug, ...product }) => ({
        ...product,
        categoryId: categoryMap.get(categorySlug) || null,
        isActive: true,
      }));

      const insertedProducts = await db.insert(products).values(productsToInsert).returning();
      console.log(`Inserted ${insertedProducts.length} missing products`);
    }
  } catch (error) {
    console.error("Error adding missing products:", error);
  }
}

async function addProductKeys() {
  try {
    const allProducts = await db.select().from(products);
    const existingKeys = await db.select().from(productKeys);
    const productIdsWithKeys = new Set(existingKeys.map(k => k.productId));

    for (const product of allProducts) {
      if (!productIdsWithKeys.has(product.id)) {
        const keysToAdd = Math.min(product.stock, 10);
        const prefix = product.titleEn.substring(0, 3).toUpperCase();
        
        const keys = [];
        for (let i = 0; i < keysToAdd; i++) {
          keys.push({
            productId: product.id,
            keyContent: generateProductKey(prefix),
            isUsed: false,
            isReserved: false,
          });
        }
        
        if (keys.length > 0) {
          await db.insert(productKeys).values(keys);
          console.log(`Added ${keys.length} keys for ${product.titleEn}`);
        }
      }
    }
  } catch (error) {
    console.error("Error adding product keys:", error);
  }
}

async function addSampleReviews() {
  try {
    const allUsers = await db.select().from(users);
    const allProducts = await db.select().from(products);
    
    if (allUsers.length === 0 || allProducts.length === 0) {
      console.log("No users or products found, skipping reviews...");
      return;
    }

    const sampleReviewsData = [
      { rating: 5, comment: "خدمة ممتازة وتسليم سريع! سأشتري مرة أخرى بالتأكيد" },
      { rating: 5, comment: "المفتاح يعمل بشكل مثالي، شكراً لكم" },
      { rating: 4, comment: "منتج جيد والسعر مناسب جداً" },
      { rating: 5, comment: "أفضل متجر للمنتجات الرقمية، موثوق 100%" },
      { rating: 4, comment: "تجربة شراء رائعة والدعم الفني متعاون" },
    ];

    for (let i = 0; i < Math.min(sampleReviewsData.length, allUsers.length); i++) {
      const user = allUsers[i % allUsers.length];
      const product = allProducts[i % allProducts.length];
      const reviewData = sampleReviewsData[i];

      await db.insert(reviews).values({
        userId: user.id,
        productId: product.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        isApproved: true,
      });
    }
    
    console.log(`Added ${Math.min(sampleReviewsData.length, allUsers.length)} sample reviews`);
  } catch (error) {
    console.error("Error adding sample reviews:", error);
  }
}

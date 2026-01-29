import { 
  users, categories, products, orders, digitalItems, siteStats, reviews, productKeys,
  passwordResetTokens, emailChangeRequests,
  type User, type InsertUser, 
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type DigitalItem, type InsertDigitalItem,
  type SiteStats,
  type Review, type InsertReview,
  type ProductKey, type InsertProductKey,
  type PasswordResetToken, type EmailChangeRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count, avg } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Digital Items
  getDigitalItemsByOrder(orderId: string): Promise<DigitalItem[]>;
  createDigitalItem(item: InsertDigitalItem): Promise<DigitalItem>;
  getVaultItems(userId: string): Promise<Array<{ item: DigitalItem; order: Order; product: Product | null }>>;

  // Stats
  getStats(): Promise<{ totalSales: number; totalRevenue: string; totalUsers: number; todayVisitors: number }>;
  getPublicStats(): Promise<{ totalProducts: number; totalCustomers: number; satisfactionRate: number; totalOrders: number; totalSalesAmount: number }>;

  // Reviews
  getApprovedReviews(): Promise<Array<Review & { user: { name: string; avatar: string | null }; product: { titleAr: string; titleEn: string } | null }>>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: string): Promise<Review | undefined>;
  rejectReview(id: string): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  getAllReviews(): Promise<Review[]>;
  getAllReviewsWithDetails(): Promise<Array<Review & { user: { name: string; avatar: string | null }; product: { titleAr: string; titleEn: string } | null }>>;

  // Product Keys
  getAvailableKey(productId: string): Promise<ProductKey | undefined>;
  createProductKey(key: InsertProductKey): Promise<ProductKey>;
  markKeyAsUsed(keyId: string, orderId: string): Promise<ProductKey | undefined>;
  getProductKeysByProduct(productId: string): Promise<ProductKey[]>;
  getAllProductKeys(): Promise<ProductKey[]>;
  deleteProductKey(id: string): Promise<boolean>;
  reserveKey(keyId: string, sessionId: string): Promise<ProductKey | undefined>;
  getKeyBySessionId(sessionId: string): Promise<ProductKey | undefined>;
  releaseExpiredReservations(): Promise<void>;
  releaseKey(keyId: string): Promise<ProductKey | undefined>;

  // Order by Stripe session
  getOrderByStripeSession(sessionId: string): Promise<Order | undefined>;
  createOrderWithSession(order: InsertOrder, stripeSessionId: string): Promise<Order>;

  // Password Reset
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
  
  // Email Change
  createEmailChangeRequest(userId: string, newEmail: string, code: string, expiresAt: Date): Promise<EmailChangeRequest>;
  getEmailChangeRequest(userId: string): Promise<EmailChangeRequest | undefined>;
  verifyEmailChangeRequest(id: string): Promise<void>;
  deleteEmailChangeRequests(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  // Digital Items
  async getDigitalItemsByOrder(orderId: string): Promise<DigitalItem[]> {
    return await db.select().from(digitalItems).where(eq(digitalItems.orderId, orderId));
  }

  async createDigitalItem(item: InsertDigitalItem): Promise<DigitalItem> {
    const [newItem] = await db.insert(digitalItems).values(item).returning();
    return newItem;
  }

  async getVaultItems(userId: string): Promise<Array<{ item: DigitalItem; order: Order; product: Product | null }>> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    const completedOrders = userOrders.filter(o => o.status === "completed");
    
    const vaultItems: Array<{ item: DigitalItem; order: Order; product: Product | null }> = [];
    for (const order of completedOrders) {
      const orderItems = await db.select().from(digitalItems).where(eq(digitalItems.orderId, order.id));
      const product = await this.getProduct(order.productId);
      for (const item of orderItems) {
        vaultItems.push({ item, order, product: product || null });
      }
    }
    return vaultItems;
  }

  // Stats
  async getStats(): Promise<{ totalSales: number; totalRevenue: string; totalUsers: number; todayVisitors: number }> {
    const allOrders = await db.select().from(orders);
    const allUsers = await db.select().from(users);
    
    const completedOrders = allOrders.filter(o => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

    return {
      totalSales: completedOrders.length,
      totalRevenue: totalRevenue.toFixed(2),
      totalUsers: allUsers.length,
      todayVisitors: Math.floor(Math.random() * 100) + 50, // Simulated for MVP
    };
  }

  async getPublicStats(): Promise<{ totalProducts: number; totalCustomers: number; satisfactionRate: number; totalOrders: number; totalSalesAmount: number }> {
    const allProducts = await db.select().from(products).where(eq(products.isActive, true));
    const allUsers = await db.select().from(users);
    const allReviews = await db.select().from(reviews).where(eq(reviews.isApproved, true));
    const completedOrders = await db.select().from(orders).where(eq(orders.status, "completed"));
    
    // Calculate satisfaction rate from reviews
    let satisfactionRate = 99;
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      satisfactionRate = Math.round((avgRating / 5) * 100);
    }

    // Calculate total sales amount from completed orders
    const totalSalesAmount = completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      totalProducts: allProducts.length,
      totalCustomers: allUsers.length,
      satisfactionRate,
      totalOrders: completedOrders.length,
      totalSalesAmount,
    };
  }

  // Reviews
  async getApprovedReviews(): Promise<Array<Review & { user: { name: string; avatar: string | null }; product: { titleAr: string; titleEn: string } | null }>> {
    const approvedReviews = await db.select().from(reviews).where(eq(reviews.isApproved, true)).orderBy(desc(reviews.createdAt));
    
    const result = [];
    for (const review of approvedReviews) {
      const [user] = await db.select({ name: users.name, avatar: users.avatar }).from(users).where(eq(users.id, review.userId));
      const [product] = await db.select({ titleAr: products.titleAr, titleEn: products.titleEn }).from(products).where(eq(products.id, review.productId));
      result.push({
        ...review,
        user: user || { name: "مستخدم", avatar: null },
        product: product || null,
      });
    }
    return result;
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true))).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async approveReview(id: string): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ isApproved: true }).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async rejectReview(id: string): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ isApproved: false }).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getAllReviewsWithDetails(): Promise<Array<Review & { user: { name: string; avatar: string | null }; product: { titleAr: string; titleEn: string } | null }>> {
    const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    
    const result = [];
    for (const review of allReviews) {
      const [user] = await db.select({ name: users.name, avatar: users.avatar }).from(users).where(eq(users.id, review.userId));
      const [product] = await db.select({ titleAr: products.titleAr, titleEn: products.titleEn }).from(products).where(eq(products.id, review.productId));
      result.push({
        ...review,
        user: user || { name: "مستخدم", avatar: null },
        product: product || null,
      });
    }
    return result;
  }

  // Product Keys
  async getAvailableKey(productId: string): Promise<ProductKey | undefined> {
    const [key] = await db.select().from(productKeys).where(
      and(
        eq(productKeys.productId, productId), 
        eq(productKeys.isUsed, false),
        eq(productKeys.isReserved, false)
      )
    ).limit(1);
    return key || undefined;
  }

  async createProductKey(key: InsertProductKey): Promise<ProductKey> {
    const [newKey] = await db.insert(productKeys).values(key).returning();
    return newKey;
  }

  async markKeyAsUsed(keyId: string, orderId: string): Promise<ProductKey | undefined> {
    const [key] = await db.update(productKeys).set({ 
      isUsed: true, 
      isReserved: false,
      reservedSessionId: null,
      reservedAt: null,
      usedByOrderId: orderId 
    }).where(eq(productKeys.id, keyId)).returning();
    return key || undefined;
  }

  async getProductKeysByProduct(productId: string): Promise<ProductKey[]> {
    return await db.select().from(productKeys).where(eq(productKeys.productId, productId)).orderBy(desc(productKeys.createdAt));
  }

  async getAllProductKeys(): Promise<ProductKey[]> {
    return await db.select().from(productKeys).orderBy(desc(productKeys.createdAt));
  }

  async deleteProductKey(id: string): Promise<boolean> {
    await db.delete(productKeys).where(eq(productKeys.id, id));
    return true;
  }

  async reserveKey(keyId: string, sessionId: string): Promise<ProductKey | undefined> {
    const [key] = await db.update(productKeys).set({ 
      isReserved: true, 
      reservedSessionId: sessionId,
      reservedAt: new Date()
    }).where(
      and(
        eq(productKeys.id, keyId),
        eq(productKeys.isUsed, false),
        eq(productKeys.isReserved, false)
      )
    ).returning();
    return key || undefined;
  }

  async getKeyBySessionId(sessionId: string): Promise<ProductKey | undefined> {
    const [key] = await db.select().from(productKeys).where(eq(productKeys.reservedSessionId, sessionId));
    return key || undefined;
  }

  async releaseExpiredReservations(): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await db.update(productKeys).set({
      isReserved: false,
      reservedSessionId: null,
      reservedAt: null
    }).where(
      and(
        eq(productKeys.isReserved, true),
        eq(productKeys.isUsed, false),
        sql`${productKeys.reservedAt} < ${thirtyMinutesAgo}`
      )
    );
  }

  async releaseKey(keyId: string): Promise<ProductKey | undefined> {
    const [key] = await db.update(productKeys).set({
      isReserved: false,
      reservedSessionId: null,
      reservedAt: null
    }).where(
      and(
        eq(productKeys.id, keyId),
        eq(productKeys.isUsed, false)
      )
    ).returning();
    return key || undefined;
  }

  // Order by Stripe session
  async getOrderByStripeSession(sessionId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId));
    return order || undefined;
  }

  async createOrderWithSession(order: InsertOrder, stripeSessionId: string): Promise<Order> {
    const [newOrder] = await db.insert(orders).values({
      ...order,
      stripeSessionId
    }).returning();
    return newOrder;
  }

  // Password Reset
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    }).returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken || undefined;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
  }

  // Email Change
  async createEmailChangeRequest(userId: string, newEmail: string, code: string, expiresAt: Date): Promise<EmailChangeRequest> {
    // Delete any existing requests for this user first
    await db.delete(emailChangeRequests).where(eq(emailChangeRequests.userId, userId));
    
    const [request] = await db.insert(emailChangeRequests).values({
      userId,
      newEmail,
      verificationCode: code,
      expiresAt
    }).returning();
    return request;
  }

  async getEmailChangeRequest(userId: string): Promise<EmailChangeRequest | undefined> {
    const [request] = await db.select().from(emailChangeRequests).where(
      and(
        eq(emailChangeRequests.userId, userId),
        sql`${emailChangeRequests.verifiedAt} IS NULL`,
        sql`${emailChangeRequests.expiresAt} > NOW()`
      )
    );
    return request || undefined;
  }

  async verifyEmailChangeRequest(id: string): Promise<void> {
    await db.update(emailChangeRequests).set({ verifiedAt: new Date() }).where(eq(emailChangeRequests.id, id));
  }

  async deleteEmailChangeRequests(userId: string): Promise<void> {
    await db.delete(emailChangeRequests).where(eq(emailChangeRequests.userId, userId));
  }
}

export const storage = new DatabaseStorage();

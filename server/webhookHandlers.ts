import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }

  static async handleCheckoutComplete(sessionId: string): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Check if order already exists (idempotency)
      const existingOrder = await storage.getOrderByStripeSession(sessionId);
      if (existingOrder) {
        console.log(`Order already exists for session ${sessionId}: ${existingOrder.id}`);
        return { success: true, orderId: existingOrder.id };
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return { success: false, error: 'Payment not completed' };
      }

      const userId = session.metadata?.userId;
      const productId = session.metadata?.productId;
      const productKeyId = session.metadata?.productKeyId;

      if (!userId || !productId || !productKeyId) {
        console.error('Missing metadata in session:', sessionId);
        return { success: false, error: 'Invalid session metadata' };
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        console.error('Product not found:', productId);
        return { success: false, error: 'Product not found' };
      }

      // Get the reserved key for this session
      const reservedKey = await storage.getKeyBySessionId(sessionId);
      if (!reservedKey) {
        console.error('Reserved key not found for session:', sessionId);
        return { success: false, error: 'Key not available' };
      }

      // Verify key matches metadata
      if (reservedKey.id !== productKeyId) {
        console.error('Key mismatch:', reservedKey.id, 'vs', productKeyId);
        return { success: false, error: 'Key mismatch' };
      }

      // Create order atomically with session ID
      const order = await storage.createOrderWithSession({
        userId,
        productId,
        paymentMethod: "card",
        totalAmount: product.price,
      }, sessionId);

      await storage.updateOrderStatus(order.id, "completed");

      // Mark key as used
      await storage.markKeyAsUsed(reservedKey.id, order.id);

      // Create digital item
      await storage.createDigitalItem({
        orderId: order.id,
        content: reservedKey.keyContent,
        type: "key",
      });

      // Update stock
      await storage.updateProduct(productId, { stock: Math.max(0, product.stock - 1) });

      console.log(`Order ${order.id} completed via webhook for session ${sessionId}`);
      return { success: true, orderId: order.id };

    } catch (error) {
      console.error('Webhook checkout complete error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async handleSessionExpired(sessionId: string): Promise<void> {
    try {
      // Release the reserved key when session expires
      const reservedKey = await storage.getKeyBySessionId(sessionId);
      if (reservedKey && !reservedKey.isUsed) {
        await storage.releaseKey(reservedKey.id);
        console.log(`Released reserved key ${reservedKey.id} for expired session ${sessionId}`);
      }
    } catch (error) {
      console.error('Error releasing key for expired session:', error);
    }
  }
}

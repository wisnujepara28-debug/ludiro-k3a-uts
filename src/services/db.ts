import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Customer, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';

/**
 * Seed initial 12 products if collection is empty
 */
export async function seedProductsIfEmpty(): Promise<void> {
  const path = PRODUCTS_COLLECTION;
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      console.log('Seeding initial 12 products to Firestore...');
      for (let idx = 0; idx < INITIAL_PRODUCTS.length; idx++) {
        const p = INITIAL_PRODUCTS[idx];
        const id = `prod-${idx + 1}`;
        await setDoc(doc(db, PRODUCTS_COLLECTION, id), {
          ...p,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      console.log('12 Products successfully seeded to real database!');
    } else {
      // Check if products have older images and upgrade to authentic photos
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const matched = INITIAL_PRODUCTS.find((p) => p.sku === data.sku);
        if (matched && matched.imageUrl && data.imageUrl !== matched.imageUrl) {
          await updateDoc(docSnap.ref, { imageUrl: matched.imageUrl });
        }
      }
    }
  } catch (error) {
    console.warn('Seeding note:', error);
  }
}

/**
 * Subscribe to products real-time
 */
export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: unknown) => void
) {
  const path = PRODUCTS_COLLECTION;

  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((docSnap) => {
        prods.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
      });
      if (prods.length > 0) {
        prods.sort((a, b) => a.price - b.price);
        onSuccess(prods);
      }
    },
    (error) => {
      console.warn('Firestore products subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Add product (Admin)
 */
export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const path = PRODUCTS_COLLECTION;
  try {
    const newDocRef = doc(collection(db, path));
    await setDoc(newDocRef, {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update product (Admin)
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete product (Admin)
 */
export async function deleteProduct(id: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to orders real-time
 */
export function subscribeOrders(
  onSuccess: (orders: Order[]) => void,
  userId?: string,
  onError?: (err: unknown) => void
) {
  const path = ORDERS_COLLECTION;
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<Order, 'id'>;
        if (!userId || data.userId === userId) {
          orders.push({ id: docSnap.id, ...data });
        }
      });
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(orders);
    },
    (error) => {
      console.warn('Orders subscription notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create Order & Deduct stock
 */
export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  const path = ORDERS_COLLECTION;
  try {
    const newDocRef = doc(collection(db, path));
    await setDoc(newDocRef, {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Also deduct stock for purchased items asynchronously
    (async () => {
      for (const item of orderData.items) {
        try {
          const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
          const target = snap.docs.find((d) => d.id === item.productId);
          if (target) {
            const currentStock = target.data().stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            const currentSold = target.data().soldCount || 0;
            await updateDoc(prodRef, {
              stock: newStock,
              soldCount: currentSold + item.quantity,
            });
          }
        } catch (e) {
          console.warn('Could not auto-decrement stock:', e);
        }
      }
    })();

    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Upload payment proof from customer
 */
export async function uploadPaymentProof(orderId: string, proofUrl: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentProofUrl: proofUrl,
      paymentProofUploadedAt: new Date().toISOString(),
      status: 'menunggu_approval',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Approve payment proof (Admin)
 */
export async function approvePaymentProof(orderId: string, notes?: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'diproses',
      paymentApprovedAt: new Date().toISOString(),
      adminNotes: notes || 'Pembayaran telah diverifikasi dan disetujui oleh admin.',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Reject payment proof (Admin)
 */
export async function rejectPaymentProof(orderId: string, reason: string): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'menunggu_pembayaran',
      adminNotes: `Bukti pembayaran ditolak: ${reason}. Silakan unggah bukti transfer yang valid.`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update general order status (Admin)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  adminNotes?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const payload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) payload.adminNotes = adminNotes;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Subscribe to customers list
 */
export function subscribeCustomers(
  onSuccess: (customers: Customer[]) => void,
  onError?: (err: unknown) => void
) {
  const path = CUSTOMERS_COLLECTION;
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const customers: Customer[] = [];
      snapshot.forEach((docSnap) => {
        customers.push({ id: docSnap.id, ...(docSnap.data() as Omit<Customer, 'id'>) });
      });
      onSuccess(customers);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Save or update customer record
 */
export async function recordCustomerOrder(
  userId: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  orderTotal: number
): Promise<void> {
  const path = `${CUSTOMERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, userId);
    const snap = await getDocs(query(collection(db, CUSTOMERS_COLLECTION)));
    const existing = snap.docs.find((d) => d.id === userId);

    if (existing) {
      const data = existing.data();
      await updateDoc(docRef, {
        totalOrders: (data.totalOrders || 0) + 1,
        totalSpent: (data.totalSpent || 0) + orderTotal,
        phone: phone || data.phone,
        address: address || data.address,
      });
    } else {
      await setDoc(docRef, {
        userId,
        name,
        email,
        phone,
        address,
        totalOrders: 1,
        totalSpent: orderTotal,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Non-blocking for checkout flow
    console.warn('Customer record sync note:', error);
  }
}

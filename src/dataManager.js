import { db, storage } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  setDoc, 
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { mailer } from "./utils/mailer";

const STORAGE_KEYS = {
  PRODUCTS: "voggue7_products",
  ORDERS: "voggue7_orders",
  CATEGORIES: "voggue7_categories",
  SETTINGS: "voggue7_settings_site",
  HOMEPAGE: "voggue7_settings_homepage",
  PAYMENT: "voggue7_settings_payment",
  REVIEWS: "voggue7_reviews",
  SUPPORT: "voggue7_support",
};

export const dataManager = {
  // PRODUCTS
  getProducts: async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },
  addProduct: async (data) => {
    const docRef = await addDoc(collection(db, "products"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },
  updateProduct: async (id, data) => {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },
  deleteProduct: async (id) => {
    await deleteDoc(doc(db, "products", id));
  },

  // CATEGORIES
  getCategories: async () => {
    const snap = await getDocs(collection(db, "categories"));
    if (snap.empty) {
      const defaultCats = [{ name: "Men", subcategories: [] }, { name: "Women", subcategories: [] }, { name: "Unisex", subcategories: [] }];
      for (const cat of defaultCats) {
        await addDoc(collection(db, "categories"), cat);
      }
      const updatedSnap = await getDocs(collection(db, "categories"));
      return updatedSnap.docs.map(d => {
        const data = d.data();
        if (data.name === "Mens") data.name = "Men";
        if (data.name === "Womens") data.name = "Women";
        return { id: d.id, ...data };
      });
    }
    return snap.docs.map(d => {
      const data = d.data();
      if (data.name === "Mens") data.name = "Men";
      if (data.name === "Womens") data.name = "Women";
      return { id: d.id, ...data };
    });
  },
  addCategory: async (data) => {
    const docRef = await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
    return { id: docRef.id, ...data };
  },
  updateCategory: async (id, data) => {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },
  deleteCategory: async (id) => {
    await deleteDoc(doc(db, "categories", id));
  },

  // ORDERS
  getOrders: async (userId) => {
    let q = collection(db, "orders");
    if (userId) {
      q = query(q, where("userId", "==", userId));
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  addOrder: async (data) => {
    const docRef = await addDoc(collection(db, "orders"), {
      ...data,
      createdAt: serverTimestamp()
    });
    const orderData = { id: docRef.id, ...data };
    
    try {
      mailer.sendOrderConfirmed(orderData);
    } catch (e) {
      console.error("Failed to send order email:", e);
    }
    
    return orderData;
  },
  updateOrder: async (id, data) => {
    await updateDoc(doc(db, "orders", id), { ...data, updatedAt: serverTimestamp() });

    if (data.status) {
      try {
        const snap = await getDoc(doc(db, "orders", id));
        if (snap.exists()) {
          const orderData = { id, ...snap.data() };
          mailer.sendOrderStatusUpdate(orderData, data.status);
        }
      } catch (e) {
        console.error("Failed to send status update email:", e);
      }
    }
  },

  // REVIEWS
  getReviews: async (productId) => {
    let q = collection(db, "reviews");
    if (productId) {
      q = query(q, where("productId", "==", productId));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  addReview: async (data) => {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },
  deleteReview: async (id) => {
    await deleteDoc(doc(db, "reviews", id));
  },

  // COUPONS
  getCoupons: async () => {
    try {
      const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return [];
    }
  },
  getCouponByCode: async (code) => {
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (error) {
      console.error("Error fetching coupon:", error);
      return null;
    }
  },
  getUserCouponUsageCount: async (userId, code) => {
    try {
      if (!userId) return 0;
      const q = query(
        collection(db, "orders"), 
        where("userId", "==", userId),
        where("coupon", "==", code.toUpperCase())
      );
      const snap = await getDocs(q);
      // Only count non-cancelled and non-returned orders towards the usage limit if we want, 
      // but usually any placement counts. Let's filter out "cancelled" in memory if needed, 
      // or just count all attempts. Let's count all attempts.
      return snap.size;
    } catch (error) {
      console.error("Error fetching usage count:", error);
      return 0;
    }
  },
  addCoupon: async (data) => {
    const docRef = await addDoc(collection(db, "coupons"), {
      ...data,
      code: data.code.toUpperCase(),
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },
  updateCoupon: async (id, data) => {
    const docRef = doc(db, "coupons", id);
    await updateDoc(docRef, { 
      ...data, 
      code: data.code.toUpperCase(),
      updatedAt: serverTimestamp() 
    });
  },
  deleteCoupon: async (id) => {
    await deleteDoc(doc(db, "coupons", id));
  },

  // SUPPORT
  getSupportTickets: async (userId) => {
    let q = collection(db, "support");
    if (userId) {
      q = query(q, where("userId", "==", userId));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  addSupportTicket: async (data) => {
    const docRef = await addDoc(collection(db, "support"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },
  updateSupportTicket: async (id, data) => {
    await updateDoc(doc(db, "support", id), { ...data, updatedAt: serverTimestamp() });
  },

  // SETTINGS
  getSettings: async (type) => {
    try {
      const docRef = doc(db, "settings", type);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : {};
    } catch (error) {
      console.error(`Error fetching ${type} settings:`, error);
      return {};
    }
  },
  saveSettings: async (type, data) => {
    await setDoc(doc(db, "settings", type), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  },

  // IMAGE & VIDEO STORAGE
  uploadImage: async (file) => {
    try {
      const isVideo = file.type && file.type.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Cloudinary upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  },

  // MIGRATION HELPER (Run check once)
  checkAndMigrate: async () => {
    const migrated = localStorage.getItem("voggue7_migrated_to_firebase");
    if (migrated) return;

    console.log("Starting one-time migration to Firebase...");
    
    const migrateCollection = async (key, collectionName) => {
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      if (items.length > 0) {
        for (const item of items) {
          const { id, ...data } = item; // Remove old ID
          await addDoc(collection(db, collectionName), { ...data, migratedFromLocal: true, createdAt: serverTimestamp() });
        }
        console.log(`Migrated ${items.length} items from ${key}`);
      }
    };

    try {
      await migrateCollection(STORAGE_KEYS.PRODUCTS, "products");
      await migrateCollection(STORAGE_KEYS.CATEGORIES, "categories");
      await migrateCollection(STORAGE_KEYS.ORDERS, "orders");
      await migrateCollection(STORAGE_KEYS.REVIEWS, "reviews");
      
      localStorage.setItem("voggue7_migrated_to_firebase", "true");
      console.log("Migration successful!");
    } catch (e) {
      console.error("Migration failed:", e);
    }
  }
};

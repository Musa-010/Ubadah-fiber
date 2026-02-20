import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// ============ BOOKINGS ============
export const addBooking = async (bookingData) => {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getBookings = async () => {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateBooking = async (id, data) => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteBooking = async (id) => {
  await deleteDoc(doc(db, 'bookings', id));
};

// ============ USERS ============
export const addUser = async (userData) => {
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUsers = async () => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUser = async (id) => {
  const docRef = doc(db, 'users', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const updateUser = async (id, data) => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteUser = async (id) => {
  await deleteDoc(doc(db, 'users', id));
};

// ============ PACKAGES ============
export const addPackage = async (packageData) => {
  const docRef = await addDoc(collection(db, 'packages'), {
    ...packageData,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getPackages = async () => {
  const q = query(collection(db, 'packages'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updatePackage = async (id, data) => {
  const docRef = doc(db, 'packages', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deletePackage = async (id) => {
  await deleteDoc(doc(db, 'packages', id));
};

// ============ SUBSCRIPTIONS ============
export const addSubscription = async (subData) => {
  const docRef = await addDoc(collection(db, 'subscriptions'), {
    ...subData,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSubscriptions = async () => {
  const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateSubscription = async (id, data) => {
  const docRef = doc(db, 'subscriptions', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteSubscription = async (id) => {
  await deleteDoc(doc(db, 'subscriptions', id));
};

// ============ PAYMENTS ============
export const addPayment = async (paymentData) => {
  const docRef = await addDoc(collection(db, 'payments'), {
    ...paymentData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getPayments = async () => {
  const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updatePayment = async (id, data) => {
  const docRef = doc(db, 'payments', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deletePayment = async (id) => {
  await deleteDoc(doc(db, 'payments', id));
};

// ============ COMPLAINTS ============
export const addComplaint = async (complaintData) => {
  const docRef = await addDoc(collection(db, 'complaints'), {
    ...complaintData,
    status: 'open',
    priority: complaintData.priority || 'medium',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getComplaints = async () => {
  const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateComplaint = async (id, data) => {
  const docRef = doc(db, 'complaints', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteComplaint = async (id) => {
  await deleteDoc(doc(db, 'complaints', id));
};

// ============ DASHBOARD STATS ============
export const getDashboardStats = async () => {
  const [users, bookings, subscriptions, payments, complaints] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'bookings')),
    getDocs(collection(db, 'subscriptions')),
    getDocs(collection(db, 'payments')),
    getDocs(collection(db, 'complaints'))
  ]);

  const totalRevenue = payments.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.amount || 0);
  }, 0);

  const activeSubscriptions = subscriptions.docs.filter(
    doc => doc.data().status === 'active'
  ).length;

  const pendingBookings = bookings.docs.filter(
    doc => doc.data().status === 'pending'
  ).length;

  const openComplaints = complaints.docs.filter(
    doc => doc.data().status === 'open'
  ).length;

  return {
    totalUsers: users.size,
    totalBookings: bookings.size,
    totalSubscriptions: subscriptions.size,
    activeSubscriptions,
    totalPayments: payments.size,
    totalRevenue,
    pendingBookings,
    openComplaints,
    totalComplaints: complaints.size
  };
};

// ============ SEED DATA ============
export const seedInitialData = async () => {
  // Check if data already exists
  const usersSnapshot = await getDocs(collection(db, 'users'));
  if (usersSnapshot.size > 0) return false;

  // Seed packages
  const packages = [
    { name: 'Basic - Polo 10MB', speed: '10 Mbps', monthlyPrice: 3000, installationFee: 7500, type: 'fiber' },
    { name: 'Standard - Super 6MB', speed: '6 Mbps', monthlyPrice: 3248, installationFee: 7500, type: 'fiber' },
    { name: 'Standard - Super 8MB', speed: '8 Mbps', monthlyPrice: 3248, installationFee: 7500, type: 'fiber' },
    { name: 'Premium - Super 10MB', speed: '10 Mbps', monthlyPrice: 4300, installationFee: 7500, type: 'fiber' },
    { name: 'Premium - Super 12MB', speed: '12 Mbps', monthlyPrice: 4300, installationFee: 7500, type: 'fiber' }
  ];

  for (const pkg of packages) {
    await addPackage(pkg);
  }

  // Seed sample users
  const sampleUsers = [
    { name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '03001234567', address: 'House 1, Street 5, Shahkhailghari', package: 'Basic - Polo 10MB' },
    { name: 'Muhammad Ali', email: 'mali@example.com', phone: '03121234567', address: 'House 12, Main Road, Shahkhailghari', package: 'Standard - Super 8MB' },
    { name: 'Hamza Shah', email: 'hamza@example.com', phone: '03451234567', address: 'House 7, Block B, Shahkhailghari', package: 'Premium - Super 12MB' }
  ];

  for (const user of sampleUsers) {
    await addUser(user);
  }

  return true;
};

// ============ INVOICES ============

// ============ BULK IMPORT USERS ============
export const bulkImportUsers = async (usersArray) => {
  let imported = 0;
  let skipped = 0;
  let errors = [];

  // Get existing users to check for duplicates (by phone or email)
  const existingUsers = await getUsers();
  const existingPhones = new Set(existingUsers.map(u => u.phone?.replace(/\D/g, '')));
  const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()).filter(Boolean));

  for (const user of usersArray) {
    try {
      const phone = user.phone?.replace(/\D/g, '') || '';
      const email = user.email?.toLowerCase() || '';

      // Skip duplicates
      if ((phone && existingPhones.has(phone)) || (email && existingEmails.has(email))) {
        skipped++;
        continue;
      }

      await addDoc(collection(db, 'users'), {
        name: user.name || 'Unknown',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        package: user.package || '',
        status: user.status || 'active',
        importedFrom: 'NBB Partner Portal',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      existingPhones.add(phone);
      existingEmails.add(email);
      imported++;
    } catch (err) {
      errors.push({ user: user.name, error: err.message });
    }
  }

  return { imported, skipped, errors, total: usersArray.length };
};

// ============ INVOICES ============
export const addInvoice = async (invoiceData) => {
  // Generate invoice number: UBD-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `UBD-${dateStr}-${random}`;

  const docRef = await addDoc(collection(db, 'invoices'), {
    ...invoiceData,
    invoiceNumber,
    status: invoiceData.status || 'unpaid',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { id: docRef.id, invoiceNumber };
};

export const getInvoices = async () => {
  const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getInvoice = async (id) => {
  const docRef = doc(db, 'invoices', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const updateInvoice = async (id, data) => {
  const docRef = doc(db, 'invoices', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteInvoice = async (id) => {
  await deleteDoc(doc(db, 'invoices', id));
};

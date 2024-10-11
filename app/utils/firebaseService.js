import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from './firebaseConfig';  // Suponiendo que este archivo ya existe

const db = getFirestore(app);  // Inicializar Firestore

// Función para obtener las tarjetas de un usuario
export const fetchCards = async (userId) => {
  try {
    const cardsRef = collection(db, 'cards');
    const cardsQuery = query(cardsRef, where('ownerId', '==', userId));
    const cardsSnapshot = await getDocs(cardsQuery);
    
    const cards = cardsSnapshot.docs.map(doc => ({
      cardId: doc.id,
      ...doc.data(),
    }));
    return cards;
  } catch (error) {
    console.error("Error fetching cards: ", error);
    throw error;
  }
};

// Función para obtener las transacciones de una tarjeta específica
export const fetchPaymentHistory = async (cardId) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const purchaseQuery = query(transactionsRef, where('card_id', '==', cardId));
    const purchaseSnapshot = await getDocs(purchaseQuery);
    
    const transactions = purchaseSnapshot.docs.map(doc => doc.data());
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    throw error;
  }
};

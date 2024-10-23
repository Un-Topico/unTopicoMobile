import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from "react-native";
import { getFirestore, collection, doc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig";
import Icon from 'react-native-vector-icons/FontAwesome';

export const DeleteCreditCard = () => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Usuario no autenticado", "Por favor inicia sesión para ver tus tarjetas.");
        return;
      }

      try {
        const cardsQuery = query(collection(db, "cards"), where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(cardsQuery);

        const userCards = [];
        querySnapshot.forEach((doc) => {
          userCards.push({ ...doc.data(), id: doc.id });
        });
        setCards(userCards);
      } catch (error) {
        console.error("Error al cargar tarjetas:", error);
      }
    };

    fetchCards();
  }, [auth.currentUser]);

  const handleDelete = async (cardId) => {
    try {
      const cardDocRef = doc(db, "cards", cardId);
      await deleteDoc(cardDocRef);

      Alert.alert("Tarjeta eliminada", "La tarjeta ha sido eliminada correctamente.");
      setCards((prevCards) => prevCards.filter(card => card.id !== cardId));
    } catch (error) {
      console.error("Error al eliminar tarjeta:", error);
      Alert.alert("Error", "No se pudo eliminar la tarjeta. Inténtalo de nuevo.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Tarjetas Guardadas</Text>
      {cards.map((card) => (
        <View key={card.id} style={styles.cardContainer}>
          <Text style={styles.cardText}>Nombre: {card.cardHolderName}</Text>
          <Text style={styles.cardText}>Número: {card.cardNumber.replace(/(.{4})/g, "$1 ")}</Text>
          <Text style={styles.cardText}>Expiración: {card.expiryDate}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(card.id)}
            accessibilityLabel={`Eliminar tarjeta ${card.cardHolderName}`}
          >
            <Icon name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#333',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});

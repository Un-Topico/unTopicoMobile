import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth } from "../utils/firebaseConfig";
import { app } from "../utils/firebaseConfig";
import CardComponent from "./cardComponent";
import { AddCardModal } from "./addCardModal"; // Asegúrate que este modal sea compatible sin react-native-paper

export const UserCards = ({ onSelectCard }) => {
  const { currentUser } = auth;
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [modalShow, setModalShow] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    const q = query(
      collection(db, "cards"),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cardsData = [];
        querySnapshot.forEach((doc) => {
          cardsData.push({ ...doc.data(), id: doc.id });
        });
        setCards(cardsData);
        setError(null);
      },
      (error) => {
        console.error("Error al obtener las tarjetas:", error);
        setError("Hubo un error al obtener las tarjetas.");
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid, db]);

  const handleCardClick = (card) => {
    setActiveCard(card);
    if (onSelectCard) {
      onSelectCard(card);
    }
  };

  const handleShowModal = () => setModalShow(true);
  const handleCloseModal = () => setModalShow(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tarjetas</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {cards.length === 0 ? (
        <View style={styles.noCardsContainer}>
          <Text>No tienes tarjetas agregadas.</Text>
          <TouchableOpacity style={styles.button} onPress={handleShowModal}>
            <Text style={styles.buttonText}>Añadir Nueva Tarjeta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={({ item }) => (
            <CardComponent
              card={item}
              onClick={handleCardClick}
              isActive={activeCard === item}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListFooterComponent={
            <View style={styles.addCardButtonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleShowModal}>
                <Text style={styles.buttonText}>Añadir Nueva Tarjeta</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <AddCardModal show={modalShow} onHide={handleCloseModal} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    // flex: 1,
    // marginTop:100
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    color: 'black'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  noCardsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  addCardButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
});


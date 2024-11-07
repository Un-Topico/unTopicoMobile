import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../utils/firebaseConfig';
import Swiper from 'react-native-swiper-flatlist';
import { useCard } from '../context/CardContext';  // Importa el contexto

const { width } = Dimensions.get('window');

const Card = ({ cardData }) => (
  <View style={styles.card}>
    <ImageBackground
      source={require('../../assets/images/tarjeta.png')}
      style={styles.cardImage}
      imageStyle={styles.cardImageStyle}
    />
    <View style={styles.cardContent}>
      <View style={styles.balanceTextContainer}>
        <Text style={styles.balanceText}>
          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cardData.balance)}
        </Text>
      </View>
      <View style={styles.cardTypeContainer}>
        <Text style={styles.cardType}>{cardData.cardType}</Text>
      </View>
      <View style={styles.cardInfoContainer}>
        <View style={styles.view_cardNumber_Holder}>
          <Text style={styles.text_cardNumber_Holder}>{cardData.cardNumber}</Text>
          <Text style={styles.text_cardNumber_Holder}>{cardData.cardHolder}</Text>
        </View>
        <View style={styles.view_cvv_expire}>
          <Text style={styles.text_cvv_expire}>{`CVV: ${cardData.cvv}`}</Text>
          <Text style={styles.text_cvv_expire}>{`Exp: ${cardData.expiryDate}`}</Text>
        </View>
      </View>
    </View>
  </View>
);

const UserCards = () => {
  const [cards, setCards] = useState([]);
  const auth = getAuth(app);
  const { currentUser } = auth;
  const db = getFirestore(app);
  const { setSelectedCard } = useCard(); // Obtiene la función para actualizar la tarjeta seleccionada

  useEffect(() => {
    const q = query(
      collection(db, 'cards'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cardsData = [];
        querySnapshot.forEach((doc) => {
          cardsData.push({ ...doc.data(), id: doc.id });
        });
        setCards(cardsData);
        if (cardsData.length > 0 && setSelectedCard) {
          setSelectedCard(cardsData[0]); // Establece la primera tarjeta como seleccionada por defecto
        }
      },
      (error) => {
        console.error('Error al obtener las tarjetas:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid, db, setSelectedCard]);


  return (
    <View style={styles.swiperContainer}>
      <Swiper
        showPagination={false}
        onChangeIndex={({ index }) => setSelectedCard(cards[index])} // Actualiza la tarjeta seleccionada cuando cambia el índice del Swiper
      >
        {cards.map((card) => (
          <Card key={card.id} cardData={card} />
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  swiperContainer: {
    width: width, // Ocupa todo el ancho de la pantalla
    height: width * 0.6 + 20,
  },
  card: {
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    marginLeft: (width - width * 0.9) / 2,
  },
  cardContent: {
    position: 'absolute',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
  },
  cardImageStyle: {
    borderRadius: 15,
    resizeMode: 'contain',
  },
  balanceTextContainer: {
    alignSelf: 'flex-end',
    marginRight: '7%',
    height: width * 0.15,
    justifyContent: 'flex-end',
  },
  cardTypeContainer: {
    alignSelf: 'flex-end',
    marginRight: '7%',
    height: width * 0.05,
    justifyContent: 'flex-end',
  },
  balanceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  cardType: {
    color: 'white',
    fontSize: 16,
  },
  cardInfoContainer: {
    flex: 1,
    width: width * 0.9,
    flexDirection: 'row',
    height: width * 0.33,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  view_cardNumber_Holder: {},
  text_cardNumber_Holder: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  view_cvv_expire: {},
  text_cvv_expire: {
    color: 'white',
    fontSize: 16,
  },
});

export default UserCards;

import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';

// Define el ancho de la pantalla
const { width } = Dimensions.get('window');

// Supongamos que `cardData` es un objeto recibido como prop
const cardData = {
  balance: '$100,200,000.00',
  cardType: 'Corriente', //la otra es Ahorro
  cardNumber: '**** **** **** 1234',
  cardHolder: 'Juancho Pérez',
  cvv: '123',
  expiryDate: '12/25',
  cardSource: require('../../assets/images/tarjeta.png'),

};

const Card = () => {
  return (
    // Tarjeta de débito
    <View style={styles.card}>
      <ImageBackground
        source={cardData.cardSource}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      />
      <View style={styles.cardContent}>
        {/* Saldo */}
        <View style={styles.balanceTextContainer}>
          <Text style={styles.balanceText}>{cardData.balance}</Text>
        </View>

        {/* Tipo de tarjeta */}
        <View style={styles.cardTypeContainer}>
          <Text style={styles.cardType}>{cardData.cardType}</Text>
        </View>

        <View style={styles.cardInfoContainer}>
          {/* Número de la tarjeta y Nombre del propietario */}
          <View style={styles.view_cardNumber_Holder}>
            <Text style={styles.text_cardNumber_Holder}>{cardData.cardNumber}</Text>
            <Text style={styles.text_cardNumber_Holder}>{cardData.cardHolder}</Text>
          </View>

          {/* CVV y Fecha de expiración */}
          <View style={styles.view_cvv_expire}>
            <Text style={styles.text_cvv_expire}>{`CVV: ${cardData.cvv}`}</Text>
            <Text style={styles.text_cvv_expire}>{`Exp: ${cardData.expiryDate}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create ({
    // Estilo de la tarjeta
  card: {
    width: width * 0.9, // Usa un porcentaje del ancho de la pantalla
    height: width * 0.6, // Ajusta la altura en proporción al ancho
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    //backgroundColor: "red",
    marginTop: 120,
  },
  cardContent: {
    // backgroundColor:'yellow',
    position: 'absolute'
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
  },
  cardImageStyle: {
    borderRadius: 15,
    resizeMode: 'contain', // Ajusta la imagen para que se vea completa sin recorte
  },
  cardInfoContainer: {
    flex: 1,
    width: width * 0.9, // Usa un porcentaje del ancho de la pantalla
    // height: width * 0.6, // Ajusta la altura en proporción al ancho
    // backgroundColor: 'purple',
    //marginTop:100,
    flexDirection: 'row',
    height: width * 0.33,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  // Estilo de los elementos de la tarjeta
  balanceTextContainer: {
    alignSelf: 'flex-end',
    marginRight: '7%',
    height: width * 0.15,
    //backgroundColor: 'purple',
    justifyContent: 'flex-end'

  },
  cardTypeContainer: {
    alignSelf: 'flex-end',
    marginRight: '7%',
    height: width * 0.05,
    //backgroundColor: 'red',
    justifyContent: 'flex-end'
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
  view_cardNumber_Holder: {
  },
  text_cardNumber_Holder: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  view_cvv_expire: {

  },
  text_cvv_expire: {
    color: 'white',
    fontSize: 16,
  },
});

export default Card;

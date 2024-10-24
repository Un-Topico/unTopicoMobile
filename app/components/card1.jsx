import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Card1 = ({ datos }) => {
    return (
      <>
        {datos ? (
          <View style={styles.card}>
            <ImageBackground
              source={require('../../assets/images/tarjeta.png')}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            />
            <View style={styles.cardContent}>
              <View style={styles.balanceTextContainer}>
                <Text style={styles.balanceText}>
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(datos.balance)}
                </Text>
              </View>
              <View style={styles.cardTypeContainer}>
                <Text style={styles.cardType}>{datos.cardType}</Text>
              </View>
              <View style={styles.cardInfoContainer}>
                <View style={styles.view_cardNumber_Holder}>
                  <Text style={styles.text_cardNumber_Holder}>{datos.cardNumber}</Text>
                </View>
                <View style={styles.view_cvv_expire}>
                  <Text style={styles.text_cvv_expire}>{`CVV: ${datos.cvv}`}</Text>
                  <Text style={styles.text_cvv_expire}>{`Exp: ${datos.expiryDate}`}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </>
    );
  };
  

const styles = StyleSheet.create({
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
        marginBottom: 10,
      },
      view_cvv_expire: {},
      text_cvv_expire: {
        color: 'white',
        fontSize: 16,
      },
});

export default Card1;
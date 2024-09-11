import { router } from 'expo-router';
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ImageBackground, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
// Obtiene las dimensiones de la pantalla
const { width } = Dimensions.get('window');

export default function Home () {

  const appName = "Untopico";
  const logoSource = require('../assets/images/logo.png');
 const logout=()=>{

 }
  // TARJETA  
  const cardData = {
    balance: '$5,000.00',
    cardNumber: '1234 5678 9012 3456',
    cardHolder: 'John Doe',
    cvv: '123',
    expiryDate: '12/26',
  };

  // Navegación
  const handleRetirar = () => {
    // Implementa la navegación a la pantalla de retiros
    router.push('retirar')
  };

  const handleDepositar = () => {
    // Implementa la navegación a la pantalla de depósitos
    router.push('depositar')
  };

  const handleReportes = () => {
    router.push('reportes')
    // Implementa la navegación a la pantalla de reportes
  };

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Image style={styles.logo} source={logoSource} />
        <Text style={styles.headtitle}>{appName}</Text>
      </View>

      {/* Tarjeta de débito */}
      <View style={styles.card}>
        <ImageBackground
          source={require('../assets/images/tarjeta.png')}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          <View style={styles.cardContent}>
            {/* Saldo */}
            <View style={styles.balanceTextContainer}>
              <Text style={styles.balanceText}>{cardData.balance}</Text>
            </View>

            <View style={styles.cardInfoContainer}>
              {/* Número de la tarjeta y Nombre del propietario*/}
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
        </ImageBackground>
      </View>

      <View style={styles.Buttoncontainer}>
        {/* Botón de Retirar */}
        <TouchableOpacity style={styles.button} onPress={handleRetirar}>
          <Icon name="rocket" size={40} color="#900" />
          <Text style={styles.buttonText}>Retirar</Text>
        </TouchableOpacity>

        {/* Botón de Reportes */}
        <TouchableOpacity style={styles.button} onPress={handleReportes}>
          <Icon name="file-text-o" size={40} color="#900" />
          <Text style={styles.buttonText}>Reportes</Text>
        </TouchableOpacity>

        {/* Botón de Depositar */}
        <TouchableOpacity style={styles.button} onPress={handleDepositar}>
          <Icon name="rocket" size={40} color="#900" />
          <Text style={styles.buttonText}>Depositar</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // General
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },

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
    marginTop: 120,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  // Estilo de los elementos de la tarjeta
  balanceTextContainer: {
    alignSelf: 'flex-end',
    marginRight: '7%',
    height: width * 0.15,
    justifyContent: 'flex-end',
  },
  balanceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
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

  Buttoncontainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    width: width * 0.9,
    height: width * 0.6,
  },
  button: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginTop: 25,
  },

  head: {
    position: 'absolute',
    top: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 35,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  logo: {
    width: 25,
    height: 25,
    marginBottom: 5,
    marginRight: 10,
  },
  headtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF6347',
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

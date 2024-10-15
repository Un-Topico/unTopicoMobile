import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconM from 'react-native-vector-icons/MaterialIcons'
import UserCards from '../components/card';
import { useCard } from '../context/CardContext';  // Importa el contexto

const { width } = Dimensions.get('window');

const Index = () => {
  const appName = "Untopico";
  const logoSource = require('../../assets/images/logo.png');
  const router = useRouter();
  const { selectedCard } = useCard();  // Obtener la tarjeta seleccionada

  function handleDepositar() {
    if (selectedCard) {
      router.push({
        pathname: '/deposit',
        params: { cardId: selectedCard.id },  // Pasa la tarjeta seleccionada a la pantalla de depósito
      });
    } else {
      alert("Por favor selecciona una tarjeta.");
    }
  }
  function handleGenerarQR() {
    if (selectedCard) {
      router.push({
        pathname: '/qrDepositForm',
        params: { cardId: selectedCard.id },  // Pasa la tarjeta seleccionada a la pantalla de depósito
      });
    } else {
      alert("Por favor selecciona una tarjeta.");
    }
  }

  function handleTransferir() {
    if (selectedCard) {
      router.push({
        pathname: '/transfer',
        params: { cardId: selectedCard.id },  // Pasa la tarjeta seleccionada a la pantalla de transferencia
      });
    } else {
      alert("Por favor selecciona una tarjeta.");
    }
  }

  function handleRetirar() {
    if (selectedCard) {
      router.push({
        pathname: '/withdraw',
        params: { cardId: selectedCard.id },  // Pasa la tarjeta seleccionada a la pantalla de retiro
      });
    } else {
      alert("Por favor selecciona una tarjeta.");
    }
   
  }
  function handleScanearQR() {
    if (selectedCard) {
      router.push({
        pathname: '/qrScanForm',
        params: { cardId: selectedCard.id },  // Pasa la tarjeta seleccionada a la pantalla de retiro
      });
    } else {
      alert("Por favor selecciona una tarjeta.");
    }
  }

  function handleReportes() {
    router.push('/reportes');
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.head}>
        <Image style={styles.logo} source={logoSource} />
        <Text style={styles.headtitle}>{appName}</Text>
      </View>

      <UserCards />

      <View style={styles.Buttoncontainer}>
        {/* Botón de Depositar */}
        <TouchableOpacity style={styles.button} onPress={handleDepositar}>
          <Icon name="download" size={40} color="#900" />
          <Text style={styles.buttonText}>Depositar</Text>
        </TouchableOpacity>


        {/* Botón de Transferir */}
        <TouchableOpacity style={styles.button} onPress={handleTransferir}>
          <Icon name="money" size={40} color="#900" />
          <Text style={styles.buttonText}>Transferir</Text>
        </TouchableOpacity>

        {/* Botón de Retirar */}
        <TouchableOpacity style={styles.button} onPress={handleRetirar}>
          <Icon name="share-square-o" size={40} color="#900" />
          <Text style={styles.buttonText}>Retirar</Text>
        </TouchableOpacity>

        {/* Botón de Reportes */}
        <TouchableOpacity style={styles.button} onPress={handleReportes}>
          <Icon name="file-text-o" size={40} color="#900" />
          <Text style={styles.buttonText}>Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleGenerarQR}>
          <Icon name="qrcode" size={40} color="#900" />
          <Text style={styles.buttonText}>Deposito por QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleScanearQR}>
          <IconM name="qr-code-scanner" size={40} color="#900" />
          <Text style={styles.buttonText}>Escanear QR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  head: {
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  Buttoncontainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: width * 0.9, // Usa un porcentaje del ancho de la pantalla
  },
  button: {
    width: 150,
    height: 150,
    backgroundColor: 'white', // Color de fondo del botón
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
});

export default Index;

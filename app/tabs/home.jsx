import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import Card from '../components/card';


// Obtiene las dimensiones de la pantalla
const { width } = Dimensions.get('window');

const index = () => {
  const appName = "Untopico";
  const logoSource = require('../../assets/images/logo.png');

  // Navegación entre ventanas
  const router = useRouter();

  
  function handleDepositar() {
    router.push('./deposit'); 
  }
  function handleTransferir() {
    router.push('./transfer');
  }
  function handleRetirar() {
    router.push('./withdraw'); 
  }
  function handleReportes() {
    router.push('./reportes');
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Image style={styles.logo} source={logoSource} />
        <Text style={styles.headtitle}>{appName}</Text>
      </View>

      <Card />

      <View style={styles.Buttoncontainer}>
        {/* Botón de Depositar */}
        <TouchableOpacity style={styles.button} onPress={handleDepositar}>
          <Icon name="download" size={40} color="#900" />
          <Text style={styles.buttonText} >Depositar</Text>
        </TouchableOpacity>

        {/* Botón de Transferir */}
        <TouchableOpacity style={styles.button} onPress={handleTransferir}>
          <Icon name="money" size={40} color="#900" />
          <Text style={styles.buttonText} >Transferir</Text>
        </TouchableOpacity>

        {/* Botón de Retirar */}
        <TouchableOpacity style={styles.button} onPress={handleRetirar}>
          <Icon name="share-square-o" size={40} color="#900" />
          <Text style={styles.buttonText} >Retirar</Text>
        </TouchableOpacity>

        {/* Botón de Reportes */}
        <TouchableOpacity style={styles.button} onPress={handleReportes}>
          <Icon name="file-text-o" size={40} color="#900" />
          <Text style={styles.buttonText} >Reportes</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // General
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },

  

  Buttoncontainer: {
    flexDirection: 'row', // Alinea los botones horizontalmente
    flexWrap: 'wrap', // Permite que los botones salten a la siguiente línea
    justifyContent: 'space-between', // Espacio entre los botones
    alignItems: 'center', // Alinea los botones en el centro verticalmente
    marginTop: 20,
    paddingHorizontal: 10, // Espacio horizontal interno
    width: width * 0.9, // Usa un porcentaje del ancho de la pantalla
    height: width * 0.6, // Ajusta la altura en proporción al ancho
    //backgroundColor: 'red',
  },
  button: {
    width: 150,
    height: 150,
    backgroundColor: 'white', // Color de fondo del botón
    alignItems: 'center', // Centra el texto horizontalmente
    justifyContent: 'center', // Centra el texto verticalmente
    borderRadius: 10, // Bordes redondeados
    marginBottom: 20, // Espacio inferior entre filas de botones
    //borderWidth: 4,
    //borderColor: '#4FD290',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: 'black', // Color del texto
    textAlign: 'center',
    marginTop: 25,
  },

  head: {
    position: 'absolute', // Para colocar el contenedor en la parte superior de la pantalla
    top: 25, // Establece la posición en la parte superior
    width: '100%', // Para asegurarte de que se alinee horizontalmente
    alignItems: 'center', // Centra los elementos horizontalmente
    justifyContent: 'center', // Centra los elementos verticalmente dentro del contenedor
    paddingTop: 35, // Espacio adicional en la parte superior
    paddingBottom: 10, // Espacio adicional en la parte inferior para separar del contenido principal
    flexDirection: 'row', // Coloca los elementos en línea horizontal
  },
  logo: {
    width: 25, // Ancho pequeño para la imagen
    height: 25, // Altura pequeña para la imagen
    marginBottom: 5, // Espacio entre la imagen y el texto
    marginRight: 10,
  },
  headtitle: {
    fontSize: 18, // Tamaño del texto
    fontWeight: 'bold', // Texto en negrita
    color: '#000', // Color del texto
  },
});

export default index;
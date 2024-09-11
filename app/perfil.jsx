import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
export default function Profile () {
  // Devolvemos el usuario autenticado
  const auth = getAuth();
  const user = auth.currentUser;

  // Definiciones de los nombres de las opciones con sus imágenes correspondientes
  const screenOptions = {
    Información_Personal: {
      displayName: 'Información Personal',
      imageUrl: require('../assets/images/logo.png'), // URL de la imagen asociada
    },
    Cambiar_NIP: {
      displayName: 'Cambiar NIP',
      imageUrl: require('../assets/images/logo.png'),
    },
    Cerrar_Sesión: {
      displayName: 'Cerrar Sesión',
      imageUrl: require('../assets/images/logo.png'),
    },
    // Puedes añadir más opciones aquí con sus respectivas imágenes
  };

  // Renderiza cada opción de configuración de manera dinámica
  const renderOptions = () => {
    return Object.entries(screenOptions).map(([screenName, { displayName, imageUrl }]) => (
      <TouchableOpacity key={screenName} style={styles.button}>
        <View style={styles.option}>
          <Image style={styles.optionIcon} source={imageUrl} />
          <Text style={styles.optionText}>{displayName}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title0}>Profile</Text>
      <View style={styles.ViewProfImage}>
        <Image style={styles.ImageProfile} source={require('../assets/images/logo.png')} />
        <Text style={styles.title}>Juancho </Text>
        <Text>Correo: {user.email}</Text>
      </View>
      <View style={styles.ViewSettings}>
        <Text style={styles.title2}>Settings</Text>
        {renderOptions()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  title0: {
    fontSize: 40,
    marginTop: '20%',
    left: '10%',
    fontWeight: 'bold',
  },
  ViewProfImage: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    width: '100%',
  },
  ImageProfile: {
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  title: {
    position: 'absolute',
    fontSize: 20,
    marginTop: '10%',
    left: '30%',
    fontWeight: 'bold',
  },
  ViewSettings: {
    position: 'absolute',
    top: '32%',
    left: '10%',
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  optionIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    marginLeft: 10,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 5,
  },
});

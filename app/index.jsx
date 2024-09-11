import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import {  useRouter } from 'expo-router';

export default function Inicio (){
  const router = useRouter();

  function handleSignUp() {
    router.push('/register'); // Navega a la pantalla de registro
  }

  function handleLogIn() {
    router.push('/login');
  }
  return (
    <View style={styles.container}>
      <Image style={styles.BackImage} source={require('../assets/images/backgroundImage.jpg')} />
      <View style={styles.overlay}></View>
      <Image style={styles.logo} source={require('../assets/images/logo.png')} />
      <Text style={styles.title}>Untopico</Text>
      <View style={styles.View_LogIn_SignUp}>
        {/* Crear Cuenta */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Crear Cuenta</Text>
        </TouchableOpacity>

        {/* Iniciar Sesión */}
        <View style={styles.ViewSignUp}>
          <Text onPress={handleLogIn} style={styles.SignUpText}>
            Ya tienes una cuenta? Iniciar Sesión
          </Text>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 100,
  },
  button: {
    backgroundColor: '#4FD290',
    padding: 10,
    borderRadius: 25,
    marginBottom: 30,
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  ViewSignUp: {
    alignItems: 'center',
  },
  SignUpText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: 'white',
  },
  BackImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 70, 0.5)',
  },
  View_LogIn_SignUp: {
    width: '80%',
    marginTop: "95%",
  },
});

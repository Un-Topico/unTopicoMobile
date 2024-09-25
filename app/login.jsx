import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './utils/firebaseConfig'; // Importa la configuración de Firebase

export default function logIn  ({ 
  appName= "Untopico", 
  logoSource = require('../assets/images/logo.png'), 
  backgroundSource = require('../assets/images/backgroundImage.jpg'),
  title2 = "Iniciar Sesión",
  question1 = "Aún no tienes cuenta?",
  answer1 = "Crea tu cuenta",
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        router.push('profile'); // Navega a la pantalla de inicio
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert('Error', errorMessage); // Muestra un mensaje de error
      });
  };

  const handleLink = () => {
    router.push('register'); // Navega a la pantalla de registro
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image style={styles.BackImage} source={backgroundSource} />
          <View style={styles.overlay}></View>
          <Image style={styles.logo} source={logoSource} />
          <Text style={styles.title}>{appName}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.title2}>{title2}</Text>

            <TextInput
              style={styles.TextInput}
              placeholder="Email"
              placeholderTextColor='#707070'
              maxLength={50}
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TextInput
              style={styles.TextInput}
              placeholder="Password"
              placeholderTextColor='#707070'
              maxLength={16}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
            <View style={styles.ViewForgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </View>
            <View style={styles.ViewButton}>
              <TouchableOpacity style={styles.button} onPress={handleLogIn}>
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.text1}>
                {question1}{' '}
                <Text style={styles.linkText} onPress={handleLink}>
                  {answer1}
                </Text>
              </Text>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative'
  },
  text1: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  title2: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: 'black',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 80,
  },
  inputContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  TextInput: {
    width: '100%',
    height: 60,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    borderColor: '#707070',
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4FD290',
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginTop: 20,
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
  ViewForgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  ViewButton: {
    alignItems: 'center',
    width: '100%'
  },
  BackImage: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

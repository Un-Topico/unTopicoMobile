import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importa la función para registrar usuarios
import { auth } from './utils/firebaseConfig'; // Importa la configuración de Firebase
import CustomCheckbox from './components/checkbox';
import TermsAndConditionsModal from './components/termsAndConditions';

export default function Register({
  appName = "Untopico",
  logoSource = require('../assets/images/logo.png'),
  backgroundSource = require('../assets/images/backgroundImage.jpg'),
  googlesource = require('../assets/images/Google.png'),

  title2 = "Crea tu cuenta",
  question1 = "Ya tienes cuenta",
  answer1 = "Iniciar Sesión"
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  async function handleSignUp() {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert("Registro exitoso", "Usuario registrado correctamente");
      router.push('accountSetup'); // Navega a la pantalla de configuración de cuenta
    } catch (error) {
      Alert.alert("Error en el registro", error.message);
    }
  }

  function handleLogIn() {
    router.replace('/login'); // Navega a la pantalla de inicio de sesión
  }


  // NECESARIO PARA CHECKBOX
  const [isChecked, setIsChecked] = useState(false);

  // NECESARIO PARA Modal de Términos y Condiciones
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleAcceptTerms = () => {
    setModalVisible(false);
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

            {/*
                Checkbox (términos y condiciones)
            */}

            <View style={styles.container}>
              <View style={styles.Checkbox_container}>
                <CustomCheckbox isCheckedInitially={isChecked} onChange={setIsChecked} />
                <Text style={[{ marginRight: 10 }, styles.text1]}>
                  Acepto los{" "}
                  <Text
                    style={styles.link}
                    onPress={openModal} // Muestra el modal al presionar
                  >
                    Términos y Condiciones
                  </Text>
                </Text>
              </View>
            </View>

            {/*
                Modal de Términos y Condiciones
            */}

            <TermsAndConditionsModal
              modalVisible={modalVisible}
              closeModal={closeModal}
              onAccept={handleAcceptTerms}
            />

            {/*
                Botón de Crear
            */}

            <View style={styles.ViewButton}>
              <TouchableOpacity
                style={[
                  styles.button,
                  !isChecked && styles.buttonDisabled, // Aplica un estilo distinto si está deshabilitado
                ]}
                onPress={handleSignUp}
                disabled={!isChecked} // Deshabilita el botón si no se ha aceptado el checkbox
              >
                <Text style={styles.buttonText}>Crear</Text>
              </TouchableOpacity>
            </View>

            <View >
              <Text style={[{ marginTop: 20 }, styles.text1]}>
                {question1}{' '}
                <Text style={styles.linkText} onPress={handleLogIn}>
                  {answer1}
                </Text>
              </Text>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>o</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.ViewButton}>
              <TouchableOpacity style={styles.button_Google}>
                <Image style={styles.Google_img} source={googlesource} />
                <Text style={styles.buttonText_Google}>Continuar con Google</Text>
              </TouchableOpacity>
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
    position: 'relative',
  },
  text1: {
    fontSize: 16,
    textAlign: 'center',
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
  buttonDisabled: {
    backgroundColor: '#ccc', // Cambia el color del botón cuando está deshabilitado
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  Checkbox_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    color: '#007BFF', // Color azul para simular un enlace
    textDecorationLine: 'underline', // Subrayar el texto
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#999',
  },
  button_Google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: 60,
    backgroundColor: '#EFEFEF',
    borderRadius: 5,
  },
  Google_img: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText_Google: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  ViewButton: {
    alignItems: 'center',
    width: '100%',
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




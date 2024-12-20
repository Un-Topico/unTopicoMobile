import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './utils/firebaseConfig';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const MAX_ATTEMPTS = 3;
const BLOCK_TIME_MS = 30000; // 30 segundos

export default function LogIn({
  appName = 'Untopico',
  logoSource = require('../assets/images/logo.png'),
  backgroundSource = require('../assets/images/backgroundImage.jpg'),
  title2 = 'Iniciar Sesión',
  question1 = '¿Aún no tienes cuenta?',
  answer1 = 'Crea tu cuenta',
  googlesource = require('../assets/images/Google.png'),
  forgotText = '¿Olvidaste tu contraseña?',
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Verificar si el usuario está bloqueado
      const unblockTime = await SecureStore.getItemAsync('unblockTime');
      if (unblockTime && new Date().getTime() < parseInt(unblockTime, 10)) {
        setIsBlocked(true);
        const remainingTime = parseInt(unblockTime, 10) - new Date().getTime();
        setTimeout(() => setIsBlocked(false), remainingTime);
        return; // Evitamos continuar si está bloqueado
      }

      // Verificar soporte de biometria
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);

      // Cargar preferencia de biometría
      const biometricPreference = await SecureStore.getItemAsync('biometricEnabled');
      if (biometricPreference === 'true') {
        setBiometricEnabled(true);
        handleBiometricLogin();
      }

      // Verificar estado de bloqueo persistente
      const blockUntil = await SecureStore.getItemAsync('blockUntil');
      const currentTime = Date.now();
      if (blockUntil && currentTime < parseInt(blockUntil, 10)) {
        setIsBlocked(true);
        const remaining = parseInt(blockUntil, 10) - currentTime;
        setRemainingTime(Math.ceil(remaining / 1000));
        setTimeout(() => setIsBlocked(false), remaining);
      }
    })();
  }, []);

  useEffect(() => {
    let interval;
    if (isBlocked) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked]);

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación Biométrica',
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        const storedEmail = await SecureStore.getItemAsync('userEmail');
        const storedPassword = await SecureStore.getItemAsync('userPassword');
        if (storedEmail && storedPassword) {
          signInWithEmailAndPassword(auth, storedEmail, storedPassword)
            .then(() => router.push('/home'))
            .catch((error) => Alert.alert('Error', error.message));
        }
      } else {
        Alert.alert('Autenticación fallida', 'No se pudo autenticar usando biometría.');
      }
    } catch (error) {
      console.log('Error en la autenticación biométrica:', error);
    }
  };

  const handleLogIn = async () => {
    if (isBlocked) return;
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      if (isBiometricSupported && biometricEnabled) {
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userPassword', password);
        await SecureStore.setItemAsync('biometricEnabled', 'true');
      } else {
        await SecureStore.deleteItemAsync('userEmail');
        await SecureStore.deleteItemAsync('userPassword');
        await SecureStore.deleteItemAsync('biometricEnabled');
      }
  
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (error) {
      setFailedAttempts((prev) => prev + 1);
  
      if (failedAttempts + 1 >= 3) {
        Alert.alert('Bloqueado', 'Has alcanzado el número máximo de intentos. Inténtalo de nuevo en 30 segundos.');
        setIsBlocked(true);
  
        const unblockTime = new Date().getTime() + 30000; // 30 segundos de bloqueo
        await SecureStore.setItemAsync('unblockTime', unblockTime.toString());
  
        setTimeout(() => {
          setFailedAttempts(0);
          setIsBlocked(false);
          SecureStore.deleteItemAsync('unblockTime');
        }, 30000);
      } else {
        Alert.alert('Error', 'Correo o contraseña incorrectos.');
      }
    }
  };

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      if (!email || !password) {
        Alert.alert('Error', 'Por favor, ingresa tu email y contraseña antes de habilitar la autenticación biométrica.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para habilitar la autenticación biométrica',
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        setBiometricEnabled(true);
        await SecureStore.setItemAsync('biometricEnabled', 'true');
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userPassword', password);
        Alert.alert('Éxito', 'La autenticación biométrica ha sido habilitada.');
      } else {
        Alert.alert('Autenticación fallida', 'No se pudo habilitar la autenticación biométrica.');
        setBiometricEnabled(false);
      }
    } else {
      setBiometricEnabled(false);
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userPassword');
      await SecureStore.setItemAsync('biometricEnabled', 'false');
      Alert.alert('Deshabilitado', 'La autenticación biométrica ha sido deshabilitada.');
    }
  };

  const handleLink = () => {
    router.replace('register'); // Navega a la pantalla de registro
  };

  const handleForgotLink = () => {
    //router.push('/SignUp_LogIn/forgotPassword');
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
              placeholderTextColor="#707070"
              maxLength={50}
              onChangeText={(text) => setEmail(text)}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.TextInput}
              placeholder="Password"
              placeholderTextColor="#707070"
              maxLength={16}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
  
            {isBlocked && (
              <Text style={styles.blockedText}>
                Has sido bloqueado. Intenta de nuevo más tarde.
              </Text>
            )}
  
            <View style={styles.ViewForgotPassword}>
              <Text style={styles.forgotPasswordText} onPress={handleForgotLink}>
                {forgotText}
              </Text>
            </View>
  
            {isBiometricSupported && (
              <View style={styles.biometricContainer}>
                <Text style={styles.biometricText}>Habilitar autenticación biométrica</Text>
                <Switch value={biometricEnabled} onValueChange={toggleBiometric} disabled={isBlocked} />
              </View>
            )}
  
            <View style={styles.ViewButton}>
              <TouchableOpacity style={styles.button} onPress={handleLogIn} disabled={isBlocked}>
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
}
// Estilos
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
    marginBottom: 10,
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
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  biometricText: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  blockedText: {
    fontSize: 16,
    color: '#ff2d00',
    textAlign: 'center',
    marginVertical: 10,
  },
});

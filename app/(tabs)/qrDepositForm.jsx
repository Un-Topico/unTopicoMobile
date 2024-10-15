import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useCard } from '../context/CardContext';
import * as LocalAuthentication from 'expo-local-authentication';
import Modal from 'react-native-modal';

export default function QrDepositForm() {
  const { currentUser } = getAuth();
  const db = getFirestore();

  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const { selectedCard } = useCard();

  const handleGenerateQrCode = async () => {
    setError(null);
    setSuccess(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Por favor, ingresa una cantidad válida.');
      }

      // Intentar autenticación biométrica
      const biometricResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación requerida',
        fallbackLabel: 'Usar contraseña',
      });

      if (biometricResult.success) {
        // Autenticación biométrica exitosa, proceder con la generación del QR
        proceedWithQrCodeGeneration();
      } else {
        // La autenticación biométrica falló o el usuario canceló
        // Solicitar contraseña
        promptForPassword();
      }
    } catch (error) {
      console.error('Error en handleGenerateQrCode:', error);
      setError(error.message);
    }
  };

  const proceedWithQrCodeGeneration = async () => {
    try {
      // Verificar si selectedCard está definido
      if (!selectedCard || !selectedCard.id) {
        throw new Error('No se ha seleccionado ninguna tarjeta.');
      }

      // Obtener la tarjeta seleccionada
      const cardDocRef = doc(db, 'cards', selectedCard.id);
      const cardDoc = await getDoc(cardDocRef);

      if (!cardDoc.exists()) {
        throw new Error('Tarjeta no encontrada');
      }

      const cardData = cardDoc.data();

      if (cardData.balance < parseFloat(amount)) {
        throw new Error('No tienes suficiente saldo para generar el código QR');
      }

      // Verificar que currentUser esté definido
      if (!currentUser || !currentUser.uid) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }

      // Generar un código QR único
      const transactionId = `qr_${Date.now()}`;
      const qrData = {
        transactionId,
        amount: parseFloat(amount),
        creatorId: currentUser.uid,
        cardId: selectedCard.id,
        used: false,
      };

      // Guardar la información en Firestore
      await setDoc(doc(db, 'qr_codes', transactionId), qrData);

      // Generar el código QR para mostrar
      setQrCode(transactionId);
      setSuccess('Código QR generado exitosamente');
    } catch (error) {
      console.error('Error en proceedWithQrCodeGeneration:', error);
      setError(error.message);
    }
  };

  const promptForPassword = () => {
    setIsPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordInput);
      await reauthenticateWithCredential(currentUser, credential);

      setIsPasswordModalVisible(false);
      setPasswordInput('');

      // Autenticación exitosa, proceder con la generación del QR
      proceedWithQrCodeGeneration();
    } catch (error) {
      Alert.alert('Error', 'Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        placeholder="Ingresa el monto"
      />

      <Button title="Generar Código QR" onPress={handleGenerateQrCode} />

      {qrCode ? (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Escanea este código QR para depositar:</Text>
          <QRCode value={qrCode} size={200} />
        </View>
      ) : null}

      {/* Modal para ingresar la contraseña */}
      <Modal isVisible={isPasswordModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Ingresa tu contraseña</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Contraseña"
            placeholderTextColor="#707070"
            secureTextEntry
            value={passwordInput}
            onChangeText={(text) => setPasswordInput(text)}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handlePasswordSubmit}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsPasswordModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 16,
    // Agrega más estilos según necesites
  },
  input: {
    height: 40,
    borderColor: '#707070',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#000000',
  },
  qrContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  qrText: {
    marginBottom: 8,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  success: {
    color: 'green',
    marginBottom: 8,
  },
  // Estilos para el modal
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderColor: '#707070',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    backgroundColor: '#4FD290',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#cccccc',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

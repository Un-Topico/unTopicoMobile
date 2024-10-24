import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useCard } from '../context/CardContext';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import Modal from 'react-native-modal';
import Card1 from '../components/card1';
const Depositar = () => {


  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const { selectedCard } = useCard();
  const auth = getAuth();
  const { currentUser } = auth;
  const db = getFirestore();

  const handleDeposito = async () => {
    if (!selectedCard) {
      Alert.alert('Error', 'Por favor selecciona una tarjeta válida.');
      return;
    }

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    // Intentar autenticación biométrica
    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación requerida',
      fallbackLabel: 'Usar contraseña',
    });

    if (biometricResult.success) {
      // Autenticación biométrica exitosa, proceder con el depósito
      proceedWithDeposit();
    } else {
      // La autenticación biométrica falló o el usuario canceló
      // Solicitar contraseña
      promptForPassword();
    }
  };

  const proceedWithDeposit = async () => {
    setLoading(true);

    try {
      const parsedMonto = parseFloat(monto);
      const newBalance = selectedCard.balance + parsedMonto;

      const cardRef = doc(db, 'cards', selectedCard.id);
      await setDoc(cardRef, { balance: newBalance }, { merge: true });

      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Deposito',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'received',
        ownerId: selectedCard.ownerId,
      });

      Alert.alert('Éxito', 'El depósito se ha realizado con éxito.');

      setMonto('');
      setDescripcion('');
    } catch (error) {
      Alert.alert('Error', `Hubo un error al realizar el depósito: ${error.message}`);
    } finally {
      setLoading(false);
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

      proceedWithDeposit();
    } catch (error) {
      Alert.alert('Error', 'Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <View style={styles.card1}>
          <Card1 datos={selectedCard} />
        </View>

        <Text style={styles.title}>Depositar</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingrese el monto"
          placeholderTextColor="#707070"
          value={monto}
          onChangeText={(text) => setMonto(text)}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción breve (opcional)"
          placeholderTextColor="#707070"
          value={descripcion}
          onChangeText={(text) => setDescripcion(text)}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.button} onPress={handleDeposito} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Procesando...' : 'Depositar'}</Text>
        </TouchableOpacity>

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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  card1: {
    marginTop: 50,
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#707070',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Alinea el texto al principio del TextInput cuando es multilinea
  },
  button: {
    backgroundColor: '#4FD290',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
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

export default Depositar;


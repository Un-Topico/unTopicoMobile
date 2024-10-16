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
import { useCard } from '../context/CardContext'; // Para obtener la tarjeta seleccionada
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import Modal from 'react-native-modal';

const withdraw = () => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const { selectedCard } = useCard();
  const auth = getAuth();
  const { currentUser } = auth;
  const db = getFirestore();

  // Función para manejar el retiro
  const handleRetiro = async () => {
    if (!selectedCard) {
      Alert.alert('Error', 'Por favor selecciona una tarjeta válida.');
      return;
    }

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    const parsedMonto = parseFloat(monto);

    if (parsedMonto > selectedCard.balance) {
      Alert.alert('Error', 'No tienes suficiente saldo para realizar el retiro.');
      return;
    }

    // Intentar autenticación biométrica
    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación requerida',
      fallbackLabel: 'Usar contraseña',
    });

    if (biometricResult.success) {
      // Autenticación biométrica exitosa, proceder con el retiro
      proceedWithRetiro();
    } else {
      // La autenticación biométrica falló o el usuario canceló
      // Solicitar contraseña
      promptForPassword();
    }
  };

  const proceedWithRetiro = async () => {
    setLoading(true);

    try {
      const parsedMonto = parseFloat(monto);
      const newBalance = selectedCard.balance - parsedMonto;

      // Actualiza el saldo de la tarjeta en Firestore
      const cardRef = doc(db, 'cards', selectedCard.id);
      await setDoc(cardRef, { balance: newBalance }, { merge: true });

      // Guardar la transacción en la colección 'transactions'
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Retiro',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'sent',
        ownerId: selectedCard.ownerId,
      });

      Alert.alert('Éxito', 'El retiro se ha realizado con éxito.');

      // Limpiar el formulario
      setMonto('');
      setDescripcion('');
    } catch (error) {
      Alert.alert('Error', `Hubo un error al realizar el retiro: ${error.message}`);
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

      // Autenticación exitosa, proceder con el retiro
      proceedWithRetiro();
    } catch (error) {
      Alert.alert('Error', 'Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Retirar</Text>

        {/* Campo de monto */}
        <TextInput
          style={styles.input}
          placeholder={'Ingrese el monto'}
          placeholderTextColor="#707070"
          value={monto}
          onChangeText={(text) => setMonto(text)}
          keyboardType="numeric"
        />

        {/* Campo de descripción */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={'Descripción breve (opcional)'}
          placeholderTextColor="#707070"
          value={descripcion}
          onChangeText={(text) => setDescripcion(text)}
          multiline
          numberOfLines={3}
        />

        {/* Botón para realizar el retiro */}
        <TouchableOpacity style={styles.button} onPress={handleRetiro} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Procesando...' : 'Realizar Retiro'}</Text>
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
  // ... tus estilos existentes
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
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
    textAlignVertical: 'top',
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

export default withdraw;

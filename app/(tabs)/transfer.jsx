import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useCard } from '../context/CardContext'; // Importar el contexto de la tarjeta seleccionada
import Contacts from '../components/contacts';
import * as LocalAuthentication from 'expo-local-authentication';
import Modal from 'react-native-modal';

const Transferir = () => {
  const [email, setEmail] = useState('');
  const [clabe, setClabe] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const { selectedCard } = useCard();
  const auth = getAuth();
  const { currentUser } = auth;
  const db = getFirestore();
  const router = useRouter();

  const getCardDocByEmail = async (email) => {
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No se encontró una cuenta asociada a este correo electrónico.');
    }

    const recipientAccount = querySnapshot.docs[0].data();
    const recipientOwnerId = recipientAccount.ownerId;

    const cardsRef = collection(db, 'cards');
    const cardQuery = query(cardsRef, where('ownerId', '==', recipientOwnerId));
    const cardSnapshot = await getDocs(cardQuery);

    if (cardSnapshot.empty) {
      throw new Error('El destinatario no tiene una tarjeta asociada.');
    }

    return cardSnapshot.docs[0];
  };

  const getCardDocByClabe = async (clabe) => {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('clabeNumber', '==', clabe));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No se encontró una tarjeta asociada a este número CLABE.');
    }

    return querySnapshot.docs[0];
  };

  const sendMessage = async (phoneNumber, amount) => {
    try {
      const response = await fetch(
        'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/twilio-package/send-message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phoneNumber,
            body: `Has recibido una transferencia de ${amount} MXN.`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  const handleTransferencia = async () => {
    if (!selectedCard) {
      Alert.alert('Error', 'Por favor selecciona una tarjeta válida.');
      return;
    }

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    if (!email && !clabe) {
      Alert.alert(
        'Error',
        'Por favor ingresa un correo electrónico o un número CLABE del destinatario.'
      );
      return;
    }

    // Intentar autenticación biométrica
    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación requerida',
      fallbackLabel: 'Usar contraseña',
    });

    if (biometricResult.success) {
      // Autenticación biométrica exitosa, proceder con la transferencia
      proceedWithTransfer();
    } else {
      // La autenticación biométrica falló o el usuario canceló
      // Solicitar contraseña
      promptForPassword();
    }
  };

  const proceedWithTransfer = async () => {
    setLoading(true);

    try {
      const parsedMonto = parseFloat(monto);
      let recipientCardDoc;

      if (clabe) {
        recipientCardDoc = await getCardDocByClabe(clabe);
      } else if (email) {
        recipientCardDoc = await getCardDocByEmail(email);
      }

      const newBalance = selectedCard.balance - parsedMonto;
      if (newBalance < 0) {
        throw new Error('No tienes suficiente saldo para realizar esta transferencia.');
      }

      const recipientOwnerId = recipientCardDoc.data().ownerId;
      const recipientNewBalance = recipientCardDoc.data().balance + parsedMonto;

      // Actualizar el saldo de la tarjeta del remitente
      const cardRef = doc(db, 'cards', selectedCard.id);
      await setDoc(cardRef, { balance: newBalance }, { merge: true });

      // Actualizar el saldo de la tarjeta del destinatario
      const recipientCardRef = doc(db, 'cards', recipientCardDoc.id);
      await setDoc(recipientCardRef, { balance: recipientNewBalance }, { merge: true });

      // Guardar la transferencia en la colección 'transfers'
      const transferId = `transfer_${Date.now()}`;
      const transferRef = doc(db, 'transfers', transferId);

      await setDoc(transferRef, {
        transfer_id: transferId,
        from_card_id: selectedCard.id,
        to_card_id: recipientCardDoc.id,
        amount: parsedMonto,
        transfer_date: new Date(),
        description: descripcion || 'Sin descripción',
      });

      // Guardar la transacción en la colección 'transactions'
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Transferencia',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'sent',
      });
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now() + 1}`,
        card_id: recipientCardDoc.id,
        transaction_type: 'Transferencia',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'received',
      });

      // Crear la notificación para el destinatario
      await addDoc(collection(db, 'notifications'), {
        notificationId: `notification_${Date.now()}`,
        transfer_id: transferId,
        ownerId: recipientOwnerId,
        message: `Has recibido una transferencia de $${parsedMonto} MXN.`,
        cardId: recipientCardDoc.id,
        read: false,
        timestamp: new Date(),
      });

      // Enviar mensaje al destinatario si tiene número de teléfono
      const recipientPhoneNumber = recipientCardDoc.data().phoneNumber;
      if (recipientPhoneNumber) {
        await sendMessage(recipientPhoneNumber, parsedMonto);
      }

      setSuccess('La transferencia se ha realizado con éxito.');
      setEmail('');
      setClabe('');
      setMonto('');
      setDescripcion('');
    } catch (error) {
      setError(`Error: ${error.message}`);
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

      proceedWithTransfer();
    } catch (error) {
      Alert.alert('Error', 'Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handleContactSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setClabe('');
  };

  const isEmailDisabled = clabe !== '';
  const isClabeDisabled = email !== '';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Transferir</Text>

        {/* Campo de correo electrónico */}
        <TextInput
          style={styles.input}
          placeholder="Ingrese correo electrónico de destino"
          placeholderTextColor="#707070"
          value={email}
          onChangeText={(text) => setEmail(text)}
          editable={!isEmailDisabled}
          keyboardType="email-address"
        />

        {/* Campo de CLABE */}
        <TextInput
          style={styles.input}
          placeholder="Ingrese CLABE de destino"
          placeholderTextColor="#707070"
          value={clabe}
          onChangeText={(text) => setClabe(text)}
          editable={!isClabeDisabled}
          keyboardType="numeric"
        />

        {/* Campo de monto */}
        <TextInput
          style={styles.input}
          placeholder="Ingrese el monto"
          placeholderTextColor="#707070"
          value={monto}
          onChangeText={(text) => setMonto(text)}
          keyboardType="numeric"
        />

        {/* Campo de descripción */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción breve (opcional)"
          placeholderTextColor="#707070"
          value={descripcion}
          onChangeText={(text) => setDescripcion(text)}
          multiline
          numberOfLines={3}
        />

        {/* Componente de contactos */}
        <Contacts currentUser={currentUser} onContactSelect={handleContactSelect} />

        {/* Botón para realizar la transferencia */}
        <TouchableOpacity style={styles.button} onPress={handleTransferencia} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? <ActivityIndicator color="#fff" /> : 'Transferir'}
          </Text>
        </TouchableOpacity>

        {success && <Text style={styles.successText}>{success}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}

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
  successText: {
    color: 'green',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
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

export default Transferir;
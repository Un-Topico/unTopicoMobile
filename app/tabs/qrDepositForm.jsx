import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useCard } from '../context/CardContext';  // Importar useCard

export default function QrDepositForm() {
  const { currentUser } = getAuth();
  const db = getFirestore();

  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { selectedCard } = useCard();  // Obtener selectedCard desde el contexto

  const handleGenerateQrCode = async () => {
    setError(null);
    setSuccess(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Por favor, ingresa una cantidad válida.');
      }

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
      console.error('Error en handleGenerateQrCode:', error);
      setError(error.message);
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
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 16,
    // Agrega más estilos según necesites
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
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
});

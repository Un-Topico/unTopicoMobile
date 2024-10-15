// Importaciones necesarias
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useCard } from '../context/CardContext'; // Importar useCard para obtener selectedCard

export default function qrScanForm() {
  const [hasPermission, setHasPermission] = useState(null); // Estado para permisos de cámara
  const [scanned, setScanned] = useState(false); // Estado para controlar si ya se escaneó
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para mostrar indicador de carga
  const { currentUser } = getAuth(); // Obtener el usuario actual
  const db = getFirestore();
  const { selectedCard } = useCard(); // Obtener la tarjeta seleccionada desde el contexto

  // Solicitar permiso para acceder a la cámara
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Función que se ejecuta al escanear un código QR
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    processQrCode(data); // Procesar el código QR escaneado
  };

  // Función para procesar el código QR
  const processQrCode = async (qrCodeData) => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    // Verificar si selectedCard está definido
    if (!selectedCard || !selectedCard.id) {
      setError('No se ha seleccionado ninguna tarjeta.');
      setIsProcessing(false);
      return;
    }

    try {
      // Verificar si el QR ya fue usado
      const qrDocRef = doc(db, 'qr_codes', qrCodeData);
      const qrDoc = await getDoc(qrDocRef);

      if (!qrDoc.exists()) {
        throw new Error('El código QR no es válido.');
      }

      const qrData = qrDoc.data();
      if (qrData.used) {
        throw new Error('El código QR ya fue utilizado.');
      }

      // Obtener la tarjeta del usuario que generó el QR
      const cardDocRef = doc(db, 'cards', qrData.cardId);
      const cardDoc = await getDoc(cardDocRef);

      if (!cardDoc.exists()) {
        throw new Error('Tarjeta del creador no encontrada.');
      }

      const cardData = cardDoc.data();
      if (cardData.balance < qrData.amount) {
        throw new Error('El usuario no tiene suficiente saldo.');
      }

      // Descontar el dinero de la tarjeta del creador
      const newBalance = cardData.balance - qrData.amount;
      await updateDoc(cardDocRef, { balance: newBalance });

      // Obtener la tarjeta del receptor (usuario actual)
      const receiverCardRef = doc(db, 'cards', selectedCard.id);
      const receiverCardDoc = await getDoc(receiverCardRef);
      const receiverCardData = receiverCardDoc.data();
      const newReceiverBalance = receiverCardData.balance + qrData.amount;

      // Actualizar el saldo del receptor
      await updateDoc(receiverCardRef, { balance: newReceiverBalance });

      // Marcar el código QR como usado
      await updateDoc(qrDocRef, { used: true });

      // Guardar las transacciones en Firestore

      // Transacción para el emisor
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: qrData.cardId,
        transaction_type: 'Depósito',
        amount: qrData.amount,
        transaction_date: new Date(),
        description: 'Depósito vía QR',
        status: 'sent',
      });

      // Transacción para el receptor
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Depósito',
        amount: qrData.amount,
        transaction_date: new Date(),
        description: 'Depósito vía QR',
        status: 'received',
      });

      setSuccess('Depósito procesado exitosamente.');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejo de permisos de cámara
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Solicitando permiso de cámara...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text>No se ha concedido acceso a la cámara.</Text>
        <Button
          title="Permitir acceso"
          onPress={() => {
            (async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              setHasPermission(status === 'granted');
            })();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}

      {/* Mostrar información de la tarjeta seleccionada */}
      <Text style={styles.label}>Tarjeta seleccionada:</Text>
      {selectedCard ? (
        <Text style={styles.cardInfo}>
          {`Tarjeta terminada en ${selectedCard.cardNumber.slice(-4)} - Saldo: $${selectedCard.balance}`}
        </Text>
      ) : (
        <Text style={styles.cardInfo}>No hay tarjeta seleccionada.</Text>
      )}

      {/* Escáner de código QR */}
      {!scanned && !isProcessing && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay}>
            <Text style={styles.scannerText}>Apunta la cámara al código QR</Text>
          </View>
        </View>
      )}

      {/* Botón para escanear de nuevo */}
      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Escanear de nuevo</Text>
        </TouchableOpacity>
      )}

      {/* Indicador de carga */}
      {isProcessing && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scannerContainer: {
    flex: 1,
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 16,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2e86de',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

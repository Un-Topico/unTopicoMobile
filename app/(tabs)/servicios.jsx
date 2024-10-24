import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Button } from 'react-native';
import { getFirestore, doc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const Servicios = () => {
  const [selectedService, setSelectedService] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]); // Estado para almacenar las tarjetas
  const [selectedCardId, setSelectedCardId] = useState(''); // Tarjeta seleccionada
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario autenticado
  const db = getFirestore();
  const navigation = useNavigation();

  // Obtener usuario autenticado
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setCurrentUser(user);
    } else {
      console.error('Error: Usuario no autenticado.');
    }
  }, []);

  // Cargar tarjetas cuando currentUser esté definido
  useEffect(() => {
    const fetchCards = async () => {
      try {
        if (currentUser && currentUser.uid) {
          const cardQuery = query(
            collection(db, 'cards'),
            where('ownerId', '==', currentUser.uid) // Usamos ownerId en lugar de user_id
          );
          const cardSnapshot = await getDocs(cardQuery);
          const cardList = cardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCards(cardList);
        }
      } catch (error) {
        console.error('Error al obtener las tarjetas:', error);
      }
    };

    fetchCards();
  }, [currentUser]);

  const handlePayment = async () => {
    if (!selectedService || !paymentAmount || !referenceNumber || !selectedCardId) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido.');
      return;
    }

    setLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        const cardRef = doc(db, 'cards', selectedCardId);
        const cardDoc = await transaction.get(cardRef);

        if (!cardDoc.exists()) {
          throw new Error('La tarjeta seleccionada no existe.');
        }

        const currentBalance = cardDoc.data().balance;
        if (currentBalance < parsedAmount) {
          throw new Error('Saldo insuficiente en la tarjeta.');
        }

        const newBalance = currentBalance - parsedAmount;
        transaction.update(cardRef, { balance: newBalance });

        const transactionData = {
          transaction_id: `transaction_${selectedService}_${Date.now()}`,
          amount: parsedAmount,
          description: `Pago de servicio: ${selectedService}`,
          reference_number: referenceNumber,
          status: 'pagado',
          transaction_type: 'pagoServicio',
          transaction_date: new Date(),
          card_id: selectedCardId,
          service_type: selectedService,
          category: 'servicio',
        };

        // Guardar la transacción en la colección 'transactions'
        transaction.set(doc(collection(db, 'transactions')), transactionData);
      });

      Alert.alert('Éxito', 'Pago realizado con éxito.');
      setSelectedService('');
      setPaymentAmount('');
      setReferenceNumber('');
    } catch (error) {
      Alert.alert('Error', `Hubo un error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pago de Servicios</Text>

      {/* Picker para seleccionar la tarjeta */}
      <Picker
        selectedValue={selectedCardId}
        onValueChange={(itemValue) => setSelectedCardId(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Selecciona una tarjeta" value="" enabled={false} />
        {cards.map((card) => (
          <Picker.Item
            key={card.id}
            label={`Tarjeta ${card.cardNumber} - Saldo: $${card.balance}`}
            value={card.id} />
        ))}
      </Picker>

      {/* Picker para seleccionar el tipo de servicio */}
      <Picker
        selectedValue={selectedService}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedService(itemValue)}
      >
        <Picker.Item label="Selecciona un servicio" value="" enabled={false} />
        <Picker.Item label="Agua" value="agua" />
        <Picker.Item label="Luz" value="luz" />
        <Picker.Item label="Gas" value="gas" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Número de Referencia"
        value={referenceNumber}
        onChangeText={setReferenceNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto a Pagar"
        keyboardType="numeric"
        value={paymentAmount}
        onChangeText={setPaymentAmount}
      />

      {/* Apartado de Confirmación */}
      {(selectedCardId && selectedService && referenceNumber && paymentAmount) && (
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationTitle}>Confirmación de Pago</Text>

          {/* Información de la tarjeta */}
          <Text style={styles.confirmationText}>
            Tarjeta: {cards.find(card => card.id === selectedCardId)?.cardNumber}
          </Text>

          <Text style={styles.confirmationText}>Servicio: {selectedService}</Text>
          <Text style={styles.confirmationText}>Referencia: {referenceNumber}</Text>
          <Text style={styles.confirmationText}>Monto: ${paymentAmount}</Text>

          <Text style={styles.confirmationText}>
            Balance restante: $
            {(
              cards.find(card => card.id === selectedCardId)?.balance - parseFloat(paymentAmount)
            ).toFixed(2)}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Procesando...' : 'Pagar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PaymentDetails')}>
        <Text style={styles.buttonText}>Detalles de pago</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4FD290',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmationBox: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    marginVertical: 20,
    borderRadius: 5,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default Servicios;

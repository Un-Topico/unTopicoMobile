import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useCard } from '../context/CardContext'; // Para obtener la tarjeta seleccionada
import { getAuth } from 'firebase/auth';

const Retirar = () => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedCard } = useCard(); // Obtener la tarjeta seleccionada
  const auth = getAuth();
  const db = getFirestore(); // Instancia de Firestore

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

    // Verificar si el saldo es suficiente para el retiro
    if (parsedMonto > selectedCard.balance) {
      Alert.alert('Error', 'No tienes suficiente saldo para realizar el retiro.');
      return;
    }

    setLoading(true);

    try {
      const newBalance = selectedCard.balance - parsedMonto; // Actualiza el balance restando el monto retirado

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
        ownerId: selectedCard.ownerId, // Dueño de la tarjeta
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Retirar</Text>

        {/* Campo de monto */}
        <TextInput
          style={styles.input}
          placeholder={"Ingrese el monto"}
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
});

export default Retirar;

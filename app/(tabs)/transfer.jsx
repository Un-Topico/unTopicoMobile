import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useCard } from '../context/CardContext'; // Importar el contexto de la tarjeta seleccionada

const Apartados = () => {
  const [balance, setBalance] = useState(null);
  const [apartados, setApartados] = useState([]);
  const [nuevoApartado, setNuevoApartado] = useState('');
  const [montoApartado, setMontoApartado] = useState('');
  const db = getFirestore();
  const { selectedCard } = useCard(); // Tarjeta seleccionada desde el contexto

  // Función para obtener el saldo de la tarjeta
  const fetchBalance = async () => {
    if (!selectedCard) return;

    try {
      const cardDocRef = doc(db, 'cards', selectedCard.cardId);
      const cardDoc = await getDoc(cardDocRef);

      if (cardDoc.exists()) {
        setBalance(cardDoc.data().balance);
        setApartados(cardDoc.data().apartados || []); // Obtener los apartados existentes
      } else {
        console.log('No se encontró la tarjeta.');
      }
    } catch (error) {
      console.error('Error al obtener el saldo:', error);
    }
  };

  const crearApartado = async () => {
    if (!nuevoApartado || !montoApartado) return;

    const apartado = {
      id: Date.now().toString(), // Generar un ID único usando el timestamp
      nombre: nuevoApartado,
      monto: parseFloat(montoApartado),
    };

    try {
      const cardDocRef = doc(db, 'cards', selectedCard.cardId);
      await updateDoc(cardDocRef, {
        apartados: arrayUnion(apartado),
        balance: balance - apartado.monto, // Restar el monto al balance total
      });

      setApartados((prev) => [...prev, apartado]);
      setBalance(balance - apartado.monto); // Actualizar el balance en el estado local
      setNuevoApartado('');
      setMontoApartado('');
    } catch (error) {
      console.error('Error al crear el apartado:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [selectedCard]);

  return (
    <View style={styles.container}>
      <View style={styles.saldoContainer}>
        <Text style={styles.title}>Saldo de la Tarjeta</Text>
        {balance !== null ? (
          <Text style={styles.balance}>${balance}</Text>
        ) : (
          <Text style={styles.loading}>Cargando saldo...</Text>
        )}
      </View>

      <View style={styles.apartadosContainer}>
        <Text style={styles.title}>Apartados</Text>
        <FlatList
          data={apartados}
          keyExtractor={(item) => item.id} // Usar `id` como clave única
          renderItem={({ item }) => (
            <View style={styles.apartado}>
              <Text style={styles.apartadoText}>Nombre: {item.nombre}</Text>
              <Text style={styles.apartadoText}>Monto: ${item.monto}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Apartado"
          value={nuevoApartado}
          onChangeText={setNuevoApartado}
        />
        <TextInput
          style={styles.input}
          placeholder="Monto"
          keyboardType="numeric"
          value={montoApartado}
          onChangeText={setMontoApartado}
        />
        <Button title="Crear Apartado" onPress={crearApartado} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  saldoContainer: {
    marginTop: 35,
    borderRadius: 10,
    backgroundColor: '#4fd290',
    padding: 12,
    width: '90%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balance: {
    fontSize: 24,
    color: 'black',
  },
  loading: {
    fontSize: 18,
    color: '#888888',
  },
  apartadosContainer: {
    width: '100%',
    marginTop: 20,

    borderWidth: 1,
    borderColor: 'blue',
  },
  apartado: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,

    borderWidth: 1,
    borderColor: 'blue',
  },
  apartadoText: {
    fontSize: 16,
    color: '#333333',
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Apartados;

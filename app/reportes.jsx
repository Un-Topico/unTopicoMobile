import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

// Datos de ejemplo para las transacciones
const transactionData = [
  {
    id: '1234567890abcdef1234567890abcdef',
    type: 'Depósito',
    amount: '$1,000.00',
    date: '01/09/2024',
    description: 'Depósito en efectivo realizado en sucursal',
  },
  {
    id: 'abcdef1234567890abcdef1234567890',
    type: 'Retiro',
    amount: '$500.00',
    date: '03/09/2024',
    description: 'Retiro en cajero automático',
  },
  // Puedes agregar más transacciones si lo deseas
];

export default function Reportes () {
  // Función para renderizar cada transacción
  const renderTransaction = ({ item }) => (
    <View style={styles.transactionContainer}>
      <Text style={styles.transactionId}>ID: {item.id}</Text>
      <Text style={styles.transactionType}>Tipo: {item.type}</Text>
      <Text style={styles.transactionAmount}>Monto: {item.amount}</Text>
      <Text style={styles.transactionDate}>Fecha: {item.date}</Text>
      <Text style={styles.transactionDescription}>Descripción: {item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Transacciones</Text>
      <FlatList
        data={transactionData}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  transactionContainer: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    borderColor: '#DDD',
    borderWidth: 1,
    backgroundColor: '#F9F9F9',
  },
  transactionId: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  transactionAmount: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

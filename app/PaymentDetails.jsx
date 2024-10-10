import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentDetails = () => {
  // Aquí puedes añadir lógica para obtener detalles de pago desde tu base de datos o estado global
  const paymentInfo = {
    amount: 100,
    date: '2024-10-10',
    status: 'Completed',
    // Agrega más detalles según lo que necesites mostrar
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Pago</Text>
      <Text style={styles.label}>Monto: ${paymentInfo.amount}</Text>
      <Text style={styles.label}>Fecha: {paymentInfo.date}</Text>
      <Text style={styles.label}>Estado: {paymentInfo.status}</Text>
      {/* Agrega más campos según sea necesario */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default PaymentDetails;

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const reportes = () => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Transacciones 2</Text>
      
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
});

export default reportes;
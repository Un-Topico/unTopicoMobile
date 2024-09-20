import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CardComponent = ({ card, onClick, isActive }) => {
  return (
    <TouchableOpacity onPress={() => onClick(card)} style={styles.card}>
      <View style={[styles.cardContent, isActive ? styles.active : null]}>
        <Text style={styles.cardTitle}>Tarjeta {card.cardNumber}</Text>
        <Text>
          <Text style={styles.boldText}>Fecha de Expiración:</Text> {card.expiryDate}
        </Text>
        <Text>
          <Text style={styles.boldText}>Tipo:</Text> {card.cardType}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
  },
  cardContent: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  active: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default CardComponent;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const Contact = ({ contact, isSelected, onPress, onDelete }) => {
  // Función para renderizar el contenido que se muestra al deslizar
  const renderRightActions = () => {
    return (
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[styles.button, isSelected ? styles.selected : null]}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{contact.email}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginVertical: 5,
  },
  selected: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100, // Ancho del botón de eliminar
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Contact;

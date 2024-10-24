import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

const AddContact = ({onPress}) => {
  return (
    <TouchableOpacity
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>[+] Agregar Contacto</Text>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AddContact;
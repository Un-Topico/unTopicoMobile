import React from 'react';
import { Modal, View, StyleSheet, Text, Button } from 'react-native';
import { CreditCardForm } from './CreditCardForm'; // Asegúrate de que este formulario sea compatible con React Native

export const AddCardModal = ({ show, onHide }) => {

  const handleCardSaved = (saved) => {
    // Aquí puedes manejar lo que sucede después de guardar la tarjeta
    onHide(); // Cierra el modal después de guardar
  };

  return (
    <Modal
      visible={show}
      animationType="slide"
      transparent={true}
      onRequestClose={onHide}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Agregar Nueva Tarjeta</Text>
          <CreditCardForm onCardSaved={handleCardSaved} />
          <Button title="Cerrar" onPress={onHide} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

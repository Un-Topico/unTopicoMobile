import React, { useState } from "react";
import { View, Text, Button, Modal, StyleSheet, TextInput, Alert } from "react-native";
import { reauthenticateUser, reauthenticateWithGoogle } from "../auth/auth";
import { auth } from "../auth/auth"; 
import { deleteCard } from "../auth/deleteCard";

export const AccountInfo = ({ accountData, selectedCard, transactions, totalBalance, onCardDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");

  const handleDelete = async () => {
    let result;

    if (auth.currentUser.providerData[0].providerId === "password") {
      result = await reauthenticateUser(password);
    } else {
      result = await reauthenticateWithGoogle();
    }

    if (result.success) {
      await deleteCard(selectedCard.cardId);
      setShowModal(false);
      onCardDelete();
    } else {
      setShowModal(false);
      Alert.alert("Error", "Contraseña incorrecta o autenticación fallida");
    }
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>Información de la Cuenta</Text>
        <Text><Text style={styles.bold}>Tipo de cuenta:</Text> {accountData.accountType}</Text>
        <Text><Text style={styles.bold}>Total del saldo en todas las tarjetas:</Text> ${totalBalance} MXN</Text>
        {selectedCard && (
          <>
            <Text><Text style={styles.bold}>CLABE:</Text> {selectedCard.clabeNumber}</Text>
            <Text><Text style={styles.bold}>Saldo:</Text> ${selectedCard.balance} MXN</Text>
          </>
        )}
        {selectedCard && (
          <>
            <Button
              title="Eliminar Tarjeta"
              color="red"
              onPress={() => setShowModal(true)}
            />
          </>
        )}
      </View>

      <Modal
        transparent={true}
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            {auth.currentUser.providerData[0].providerId === "password" ? (
              <>
                <Text>Ingresa tu contraseña</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                />
              </>
            ) : (
              <Text>Reautentícate con tu cuenta de Google para eliminar esta tarjeta.</Text>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={() => setShowModal(false)} />
              <Button title="Confirmar Eliminación" color="red" onPress={handleDelete} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
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
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

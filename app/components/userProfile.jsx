import React, { useState } from "react";
import { View, Text, TextInput, Button, Modal, Alert, StyleSheet } from "react-native";
import { reauthenticateUser, updatePasswordForUser } from "../auth/auth"; // Funciones para reautenticar y actualizar contraseña
import { getFirestore, doc, updateDoc } from "firebase/firestore"; // Firebase para actualizar el nombre
import { app } from "../utils/firebaseConfig"; // Configuración de Firebase
// import { ProfileImageUpload } from './ProfileImageUpload'; // Mantén este componente si ya está migrado a React Native

export const UserProfile = ({ accountData, currentUser, onImageUpdate, onNameUpdate, onPhoneUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newName, setNewName] = useState(accountData.name);
  const [newPhone, setNewPhone] = useState(accountData.phoneNumber);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(false);

    try {
      const reauthResult = await reauthenticateUser(currentPassword);
      if (reauthResult.success) {
        const result = await updatePasswordForUser(newPassword);
        if (result.success) {
          setSuccess(true);
          setShowModal(false);
          Alert.alert("Éxito", "Contraseña actualizada exitosamente");
        } else {
          setError(result.message);
        }
      } else {
        setError(reauthResult.message);
      }
    } catch (error) {
      setError("Error al cambiar la contraseña.");
    }
  };

  const handleNameEdit = () => setIsEditingName(true);
  const handleNameSave = async () => {
    const db = getFirestore(app);
    const userDocRef = doc(db, "accounts", "account_" + currentUser.uid);
    try {
      await updateDoc(userDocRef, { name: newName });
      onNameUpdate(newName);
      setIsEditingName(false);
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
    }
  };

  const handlePhoneEdit = () => setIsEditingPhone(true);
  const handlePhoneSave = async () => {
    const db = getFirestore(app);
    const userDocRef = doc(db, "accounts", "account_" + currentUser.uid);
    try {
      await updateDoc(userDocRef, { phoneNumber: "+52" + newPhone.trim() });
      onPhoneUpdate(newPhone);
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Error al actualizar el número:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Perfil</Text>
      {/* <ProfileImageUpload currentImageUrl={accountData.profileImage} onImageUpdate={onImageUpdate} /> */}

      {/* Nombre */}
      <View style={styles.editContainer}>
        {isEditingName ? (
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
          />
        ) : (
          <Text style={styles.text}>Bienvenido, {accountData.name}</Text>
        )}
        <Button title="Editar" onPress={isEditingName ? handleNameSave : handleNameEdit} />
      </View>

      {/* Teléfono */}
      <View style={styles.editContainer}>
        {isEditingPhone ? (
          <TextInput
            style={styles.input}
            value={newPhone}
            keyboardType="number-pad"
            onChangeText={setNewPhone}
          />
        ) : (
          <Text style={styles.text}>Teléfono: {accountData.phoneNumber}</Text>
        )}
        <Button title="Editar" onPress={isEditingPhone ? handlePhoneSave : handlePhoneEdit} />
      </View>

      <Text style={styles.text}>{currentUser.email}</Text>

      <Button title="Cambiar Contraseña" onPress={() => setShowModal(true)} />

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Cambiar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña actual"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && <Text style={styles.successText}>Contraseña actualizada exitosamente</Text>}
          <Button title="Cambiar Contraseña" onPress={handlePasswordChange} />
          <Button title="Cancelar" onPress={() => setShowModal(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  successText: {
    color: "green",
    marginTop: 10,
  },
});

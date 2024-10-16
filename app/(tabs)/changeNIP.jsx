import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";

export default function ChangeNIP() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChangePin = () => {
    if (newPin !== confirmPin) {
      setError("Los NIPs no coinciden.");
      // Borrar todos los campos de entrada
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      return;
    }

    // Aquí puedes implementar la lógica para cambiar el NIP
    setSuccess(true);
    setError(null);
    
    // Reinicia los campos después de un cambio exitoso
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  // Función para manejar la entrada de texto
  const handleInputChange = (value, setter) => {
    const numericValue = value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
    if (numericValue.length <= 3) { // Limitar a 3 dígitos
      setter(numericValue);
    }
  };

  const handleScroll = () => {
    // Limpiar el mensaje de error al hacer scroll hacia arriba
    setError(null);
    console.log("Pestaña actualizada");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView 
        contentContainerStyle={styles.container} // Usar contentContainerStyle aquí
        onScroll={({ nativeEvent }) => {
          // Detectar el desplazamiento hacia arriba
          if (nativeEvent.contentOffset.y < 0) {
            handleScroll(); // Actualizar contenido y limpiar el error al hacer scroll hacia arriba
          }
        }}
        scrollEventThrottle={16} // Controla la frecuencia de eventos de scroll
      >
        <Text style={styles.header}>Cambiar NIP</Text>

        <Text style={styles.label}>NIP Actual:</Text>
        <TextInput
          style={styles.input}
          value={currentPin}
          onChangeText={(value) => handleInputChange(value, setCurrentPin)} // Usar la función de manejo
          secureTextEntry
          placeholder="Ingresa tu NIP actual"
          keyboardType="numeric"
          maxLength={3} // Limitar longitud a 3
        />

        <Text style={styles.label}>Nuevo NIP:</Text>
        <TextInput
          style={styles.input}
          value={newPin}
          onChangeText={(value) => handleInputChange(value, setNewPin)} // Usar la función de manejo
          secureTextEntry
          placeholder="Ingresa tu nuevo NIP"
          keyboardType="numeric"
          maxLength={3} // Limitar longitud a 3
        />

        <Text style={styles.label}>Confirmar Nuevo NIP:</Text>
        <TextInput
          style={styles.input}
          value={confirmPin}
          onChangeText={(value) => handleInputChange(value, setConfirmPin)} // Usar la función de manejo
          secureTextEntry
          placeholder="Confirma tu nuevo NIP"
          keyboardType="numeric"
          maxLength={3} // Limitar longitud a 3
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && <Text style={styles.successText}>NIP cambiado exitosamente</Text>}

        <Button title="Cambiar NIP" onPress={handleChangePin} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1, // Asegúrate de que el contenedor crezca si el contenido es menor
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
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

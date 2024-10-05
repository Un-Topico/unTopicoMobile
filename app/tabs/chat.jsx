import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat</Text>
      <Text style={styles.text}>
        Aquí podrás chatear con los sabrosones de soporte.
        {/* Puedes agregar más contenido sobre las funciones de chat más adelante */}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9", // Fondo claro
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: "#333", // Color del texto
  },
});

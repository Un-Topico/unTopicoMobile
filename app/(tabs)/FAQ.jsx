import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FAQ() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>FAQ</Text>
      <Text style={styles.text}>
        Aquí encontrarás las preguntas frecuentes. 
        {/* Puedes agregar contenido adicional o preguntas más adelante */}
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

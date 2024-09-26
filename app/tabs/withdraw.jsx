import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

// Constantes para los textos
const TITLE = 'Retirar';
const EMAIL_PLACEHOLDER = 'Ingrese su correo electrónico';
const MONTO_PLACEHOLDER = 'Ingrese el monto';
const DESCRIPCION_PLACEHOLDER = 'Descripción breve (opcional)';
const BUTTON_TEXT = 'Realizar Retiro';

const Retirar = () => {
  const [email, setEmail] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Función para manejar el retiro
  const handleRetiro = () => {
    // Lógica para manejar el retiro
    console.log(`Correo: ${email}, Monto: ${monto}, Descripción: ${descripcion}`);
    // Reinicia los campos después del retiro
    setEmail('');
    setMonto('');
    setDescripcion('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{TITLE}</Text>

      {/* Campo de correo electrónico */}
      <TextInput
        style={styles.input}
        placeholder={EMAIL_PLACEHOLDER}
        placeholderTextColor="#707070"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />

      {/* Campo de monto */}
      <TextInput
        style={styles.input}
        placeholder={MONTO_PLACEHOLDER}
        placeholderTextColor="#707070"
        value={monto}
        onChangeText={(text) => setMonto(text)}
        keyboardType="numeric"
      />

      {/* Campo de descripción */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={DESCRIPCION_PLACEHOLDER}
        placeholderTextColor="#707070"
        value={descripcion}
        onChangeText={(text) => setDescripcion(text)}
        multiline
        numberOfLines={3}
      />

      {/* Botón para realizar el retiro */}
      <TouchableOpacity style={styles.button} onPress={handleRetiro}>
        <Text style={styles.buttonText}>{BUTTON_TEXT}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#707070',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Alinea el texto al principio del TextInput cuando es multilinea
  },
  button: {
    backgroundColor: '#4FD290',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Retirar;
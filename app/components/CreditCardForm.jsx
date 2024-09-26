import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig";

export const CreditCardForm = ({ onCardSaved }) => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardType, setCardType] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Usuario no autenticado", "Por favor inicia sesión para guardar una tarjeta.")
      // Manejar estado no autenticado
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (cardNumber && expiryDate && cvv && cardHolderName) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [cardNumber, expiryDate, cvv, cardHolderName]);

  const generateClabeNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-10);
    const randomNumbers = Math.floor(1000000000 + Math.random() * 9000000000);
    return `${timestamp}${randomNumbers}`;
  };

  const detectCardType = (number) => {
    const firstDigit = parseInt(number[0], 10);
    if (firstDigit >= 1 && firstDigit <= 4) {
      setCardType("Visa");
    } else if (firstDigit >= 5 && firstDigit <= 8) {
      setCardType("MasterCard");
    } else if (firstDigit === 0 || firstDigit === 9) {
      setCardType("American Express");
    } else {
      setCardType("");
    }
  };

  const handleCardNumberChange = (text) => {
    const formattedNumber = text.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formattedNumber);
    detectCardType(formattedNumber.replace(/\s/g, ""));
  };

  const formatExpiryDate = (text) => {
    const formattedDate = text
      .replace(/\D/g, "") // Remover caracteres no numéricos
      .replace(/(\d{2})(\d{1,2})/, "$1/$2") // Insertar diagonal después de los primeros 2 dígitos
      .slice(0, 5); // Limitar el largo máximo a 5 caracteres (MM/AA)
      
    setExpiryDate(formattedDate);
  };

  const isValidarCardNumber = (number) => {
    const cleanedNumber = number.replace(/\s/g, "");
    const lengthValid = cleanedNumber.length >= 13 && cleanedNumber.length <= 19;

    const luhnCheck = (num) => {
      let sum = 0;
      let shouldDouble = false;

      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i]);

        if (shouldDouble) {
          digit *=2;
          if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
      }

      return sum % 10 === 0;
    };

    return lengthValid && luhnCheck(cleanedNumber);
  };

  const handleSubmit = async () => {
    setError(null);
    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    if (!isValidarCardNumber(cardNumber)){
      Alert.alert("Error", "Número de tarjeta no válido. Por favor, revise el número ingresado");
      return;
    }

    const cardsQuery = query(collection(db, "cards"), where("cardNumber", "==", cardNumber.replace(/\s/g, "")));
    const querySnapshot = await getDocs(cardsQuery);

    if (!querySnapshot.empty) {
      Alert.alert("Error", "El número de tarjeta ya ha sido registrado.");
      return;
    }

    try {
      const cardId = `card_${user.uid}_${Date.now()}`;
      const clabeNumber = generateClabeNumber();

      const cardData = {
        cardId,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiryDate,
        cvv,
        balance: 100,
        cardHolderName,
        ownerId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        cardType,
        clabeNumber,
      };

      const cardsCollection = collection(db, "cards");
      const cardDocRef = doc(cardsCollection, cardId);

      await setDoc(cardDocRef, cardData);

      setIsCardSaved(true);
      setIsButtonDisabled(true);
      onCardSaved(true);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Añadir Tarjeta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre en la Tarjeta"
        value={cardHolderName}
        onChangeText={setCardHolderName}
        required
        maxLength={80}
        editable={!isCardSaved}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de Tarjeta"
        maxLength={19}
        value={cardNumber}
        onChangeText={handleCardNumberChange}
        keyboardType="numeric"
        editable={!isCardSaved}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de Expiración (MM/AA)"
        maxLength={5}
        value={expiryDate}
        onChangeText={formatExpiryDate}
        keyboardType="numeric"
        editable={!isCardSaved}
      />
      <TextInput
        style={styles.input}
        placeholder="CVV"
        maxLength={3}
        value={cvv}
        onChangeText={setCvv}
        keyboardType="numeric"
        editable={!isCardSaved}
      />
      <Button title="Guardar Tarjeta" onPress={handleSubmit} disabled={isButtonDisabled} />
      {isCardSaved && <Text style={styles.success}>Tarjeta guardada exitosamente</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 20 },
  success: { color: "green", marginTop: 20 },
}); 
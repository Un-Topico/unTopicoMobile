import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
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
  const placeholderColor = "#9e9e9e";

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Usuario no autenticado", "Por favor inicia sesión para guardar una tarjeta.");
    }
  }, [auth.currentUser]);

  useEffect(() => {
    setIsButtonDisabled(!(cardNumber && expiryDate && cvv && cardHolderName));
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
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{1,2})/, "$1/$2")
      .slice(0, 5);
    setExpiryDate(formattedDate);
  };

  const isValidCardNumber = (number) => {
    const cleanedNumber = number.replace(/\s/g, "");
    const lengthValid = cleanedNumber.length >= 13 && cleanedNumber.length <= 19;

    const luhnCheck = (num) => {
      let sum = 0;
      let shouldDouble = false;
      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i]);
        if (shouldDouble) {
          digit *= 2;
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
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No hay usuario autenticado.");
      return;
    }

    if (!isValidCardNumber(cardNumber)){
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
      Alert.alert("Éxito", "Tarjeta guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
      Alert.alert("Error", "No se pudo guardar la tarjeta. Por favor, intente de nuevo.");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Añadir Tarjeta</Text>
        <View style={styles.cardContainer}>
        <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre en la Tarjeta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={placeholderColor}
              value={cardHolderName}
              onChangeText={setCardHolderName}
              maxLength={80}
              editable={!isCardSaved}
              accessibilityLabel="Nombre en la Tarjeta"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de Tarjeta</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor={placeholderColor}
              maxLength={19}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              editable={!isCardSaved}
              accessibilityLabel="Número de Tarjeta"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Fecha de Expiración</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/AA"
                placeholderTextColor={placeholderColor}
                maxLength={5}
                value={expiryDate}
                onChangeText={formatExpiryDate}
                keyboardType="numeric"
                editable={!isCardSaved}
                accessibilityLabel="Fecha de Expiración"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor={placeholderColor}
                maxLength={3}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                editable={!isCardSaved}
                accessibilityLabel="CVV"
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isButtonDisabled}
          accessibilityLabel="Guardar Tarjeta"
          accessibilityState={{ disabled: isButtonDisabled }}
        >
          <Text style={styles.buttonText}>Guardar Tarjeta</Text>
        </TouchableOpacity>
        {isCardSaved && <Text style={styles.success}>Tarjeta guardada exitosamente</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#333',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIcon: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  success: {
    color: "green",
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});
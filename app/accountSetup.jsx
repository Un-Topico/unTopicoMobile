import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "./utils/firebaseConfig";
import { CreditCardForm } from "./components/CreditCardForm";
import { checkUserAccount } from "./auth/checkUserAccount";
import { Picker } from "@react-native-picker/picker"; // Importa el Picker

export default function AccountSetup() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("Ahorro");
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState(true);
  const router = useRouter();
  const placeholderColor = "#9e9e9e"; // Define el color una vez

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
    } else {
      const checkUser = async (currentUser) => {
        const check = await checkUserAccount(currentUser);
        if (check) router.replace("/home");
      };
      checkUser(user);

      const checkCard = async (userUid) => {
        const cardsQuery = query(
          collection(db, "cards"),
          where("ownerId", "==", userUid)
        );
        const querySnapshot = await getDocs(cardsQuery);

        if (!querySnapshot.empty) {
          setIsCardSaved(true);
          setStatus(false);
        }
      };
      checkCard(user.uid);
    }
  }, [auth.currentUser, router, db]);

  const createAccount = async (userUid, userEmail) => {
    try {
      const accountId = `account_${userUid}`;
      const accountData = {
        accountId,
        accountType,
        name,
        balance: 0,
        ownerId: userUid,
        email: userEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const accountsCollection = collection(db, "accounts");
      const accountDocRef = doc(accountsCollection, accountId);

      await setDoc(accountDocRef, accountData);

      router.navigate("/home");
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
      Alert.alert("Error", "No se pudo crear la cuenta. Por favor, intente de nuevo.");
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No hay usuario autenticado.");
      return;
    }
    await createAccount(user.uid, user.email);
  };

  useEffect(() => {
    // Redirigir al usuario a /home si la tarjeta ha sido guardada
    if (isCardSaved) {
      handleSubmit();
    }
  }, [isCardSaved, router]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nombre"
            placeholderTextColor={placeholderColor}
            onChangeText={setName}
            maxLength={50}
            required
            accessibilityLabel="Nombre de usuario"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Cuenta</Text>
          <Picker
            selectedValue={accountType}
            onValueChange={(itemValue) => setAccountType(itemValue)}
            style={styles.picker} // Agrega estilo si es necesario
            accessibilityLabel="Tipo de cuenta"
          >
            <Picker.Item label="Ahorro" value="Ahorro" />
            <Picker.Item label="Corriente" value="Corriente" />
            <Picker.Item label="Inversión" value="Inversión" />
            {/* Agrega más tipos de cuenta según sea necesario */}
          </Picker>
        </View>
        {status ? (
          <CreditCardForm onCardSaved={setIsCardSaved} />
        ) : (
          <Text style={styles.success}>Tarjeta previamente registrada</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  success: {
    color: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    height: 50,
  },
});
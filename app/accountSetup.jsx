import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
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

export default function AccountSetup() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("Ahorro");
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState(true);
  const router = useRouter(); // Usando expo-router

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login"); // Redirigir a la página de login
    } else {
      const checkUser = async (currentUser) => {
        const check = await checkUserAccount(currentUser);
        if (check) router.replace("/profile");
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

  useEffect(() => {
    if (isCardSaved && name) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [isCardSaved, name]);

  const createAccount = async (userUid, userEmail) => {
    try {
      const accountId = `account_${userUid}`;
      const accountData = {
        accountId,
        accountType,
        name,
        balance: 100,
        ownerId: userUid,
        email: userEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const accountsCollection = collection(db, "accounts");
      const accountDocRef = doc(accountsCollection, accountId);

      await setDoc(accountDocRef, accountData);

      router.push("/home"); // Navegar a la página de inicio
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }
    await createAccount(user.uid, user.email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        onChangeText={setName}
        maxLength={50}
        required
      />
      <Text>Tipo de Cuenta</Text>
      <TextInput
        style={styles.input}
        value={accountType}
        onChangeText={setAccountType}
      />
      {status ? (
        <CreditCardForm onCardSaved={setIsCardSaved} />
      ) : (
        <Text style={styles.success}>Tarjeta previamente registrada</Text>
      )}
      <Button
        title="Crear Cuenta"
        onPress={handleSubmit}
        disabled={isButtonDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 20 },
  success: { color: "green", marginBottom: 20 },
});

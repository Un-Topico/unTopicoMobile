// app/tabs/personal_info.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig";
import { UserProfile } from "../components/userProfile";

export default function personal_Info() {
  const auth = getAuth(app);
  const { currentUser } = auth;
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const db = getFirestore(app);

      // Fetch account data
      const accountsCollection = collection(db, "accounts");
      const accountQuery = query(
        accountsCollection,
        where("ownerId", "==", currentUser.uid)
      );
      const accountSnapshot = await getDocs(accountQuery);

      if (!accountSnapshot.empty) {
        const accountInfo = accountSnapshot.docs[0].data();
        setAccountData(accountInfo);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  const handleNameUpdate = (newName) =>
    setAccountData((prevData) => ({ ...prevData, name: newName }));
  const handlePhoneUpdate = (newPhone) =>
    setAccountData((prevData) => ({ ...prevData, phoneNumber: newPhone }));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {accountData ? (
        <View style={styles.profileContainer}>
          <UserProfile
            accountData={accountData}
            currentUser={currentUser}
            onNameUpdate={handleNameUpdate}
            onPhoneUpdate={handlePhoneUpdate}
          />
        </View>
      ) : (
        <Text style={styles.errorText}>No se encontraron datos del usuario.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#f8f8f8", // Fondo suave para mejorar la legibilidad
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Fondo blanco para el indicador de carga
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000", // Sombra para dar profundidad
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Para Android
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333", // Color del texto cargando
  },
  profileContainer: {
    backgroundColor: "#fff", // Fondo blanco para el contenedor del perfil
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000", // Sombra para dar profundidad
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Para Android
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    color: "#e74c3c", // Color rojo para errores
    marginTop: 20,
  },
});

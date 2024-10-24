import React, { useEffect, useState } from "react";
import { 
  View, Text, Button, ActivityIndicator, StyleSheet, 
  ScrollView, TouchableOpacity, Alert 
} from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig";
import { UserProfile } from "../components/userProfile";
import { deleteProfilePicture } from "../utils/profileUtils";

export default function PersonalInfo() {
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

  const handleDeleteProfilePicture = async () => {
    const result = await deleteProfilePicture(currentUser.uid);
    Alert.alert(result.success ? "Éxito" : "Error", result.message);
  };

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

      {/* Botón para eliminar la imagen de perfil (siempre visible) */}
      <TouchableOpacity 
        onPress={handleDeleteProfilePicture} 
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Eliminar foto de perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  profileContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    color: "#e74c3c",
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

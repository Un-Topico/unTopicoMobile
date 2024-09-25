import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth"; // Importa signOut
import { useRouter } from "expo-router";
import { app } from "./utils/firebaseConfig";
import { UserProfile } from "./components/userProfile";
import { AccountInfo } from "./components/accountInfo";
import { TransactionSection } from "./components/transactionSection";
import { UserCards } from "./components/userCards";

export default function Profile() {
  const auth = getAuth(app);
  const { currentUser } = auth;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [statusUser, setStatusUser] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const db = getFirestore(app);
      // Fetch user role
      const rolesCollection = collection(db, "roles");
      const roleQuery = query(
        rolesCollection,
        where("email", "==", currentUser.email)
      );
      const rolesSnapshot = await getDocs(roleQuery);

      if (!rolesSnapshot.empty) {
        const userRoleData = rolesSnapshot.docs[0].data();
        setUserRole(userRoleData.role);
      }

      // Fetch account data
      const accountsCollection = collection(db, "accounts");
      const accountQuery = query(
        accountsCollection,
        where("ownerId", "==", currentUser.uid)
      );
      const accountSnapshot = await getDocs(accountQuery);
      console.log(accountSnapshot)
      if (accountSnapshot.empty || accountSnapshot== null) {
        router.push("accountSetup");
      } else {
        const accountInfo = await accountSnapshot.docs[0].data();
        // console.log(accountInfo)
        if (accountInfo) {
          setAccountData(accountInfo);


          // Fetch para calcular el total del balance de todas las tarjetas
          const cardsCollection = collection(db, "cards");
          const cardsQuery = query(
            cardsCollection,
            where("ownerId", "==", currentUser.uid)
          );
          const cardsSnapshot = await getDocs(cardsQuery);

          let total = 0;
          cardsSnapshot.forEach((doc) => {
            total += doc.data().balance; // Sumamos el balance de cada tarjeta
          });

          setTotalBalance(total);
          setStatusUser(true)

          if (selectedCard) {
            const transactionsRef = collection(db, "transactions");
            const transactionsQuery = query(
              transactionsRef,
              where("card_id", "==", `${selectedCard.cardId}`)
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);

            const transactionsData = transactionsSnapshot.docs.map((doc) =>
              doc.data()
            );
            transactionsData.sort(
              (a, b) =>
                b.transaction_date.toDate() - a.transaction_date.toDate()
            );
            setTransactions(transactionsData);
          }

        }

      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, selectedCard]);

  const handleCardSelection = (card) => setSelectedCard(card);
  const handleImageUpdate = (newImageUrl) =>
    setAccountData((prevData) => ({ ...prevData, profileImage: newImageUrl }));
  const updateCardBalance = (newBalance) =>
    setSelectedCard((prevCard) => ({ ...prevCard, balance: newBalance }));
  const handleCardDelete = () => setSelectedCard(null);
  const handleNameUpdate = (newName) =>
    setAccountData((prevData) => ({ ...prevData, name: newName }));
  const handlePhoneUpdate = (newPhone) =>
    setAccountData((prevData) => ({ ...prevData, phoneNumber: newPhone }));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {statusUser ? (
        <View>
          <UserProfile
            accountData={accountData}
            currentUser={currentUser}
            onImageUpdate={handleImageUpdate}
            onNameUpdate={handleNameUpdate}
            onPhoneUpdate={handlePhoneUpdate}
          />
          {accountData && (
            <AccountInfo
              accountData={accountData}
              selectedCard={selectedCard}
              transactions={transactions}
              totalBalance={totalBalance}
              onCardDelete={handleCardDelete}
            />
          )}
          <UserCards onSelectCard={handleCardSelection} />
          <TransactionSection
            selectedCard={selectedCard}
            updateCardBalance={updateCardBalance}
          />
      <Button title="Cerrar sesión" onPress={handleLogout} />

        </View>
      ) : (
        <></>
      )}
      {/* <RealTimeChat userRole={userRole} />
      {userRole === "admin" && (
        <Button title="Panel de Administración" onPress={() => router.push("/admin/users")} />
      )} */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

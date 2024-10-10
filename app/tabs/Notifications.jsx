import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { getFirestore, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const { currentUser } = auth;


  useEffect(() => {
    if (!currentUser) return;
  
    const db = getFirestore(app);
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("ownerId", "==", currentUser.uid)
    );
  
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
      setLoading(false);
    });
  
    // Cleanup function para evitar fugas de memoria
    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  const markNotificationAsRead = async (notificationId) => {
    const db = getFirestore(app);
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
  };
  
  const handleNotificationPress = (notificationId) => {
    markNotificationAsRead(notificationId);
    // Aquí puedes agregar una navegación o acción adicional
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.notificationItem, {backgroundColor: item.read ? "#e0e0e0" : "#f0f0f0"}]} 
              activeOpacity={0.2}
              onPress={() => handleNotificationPress(item.id)}>
              <Text style={styles.notificationText}>{item.message}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noNotifications}>No notifications available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  notificationItem: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 5,
  },
  notificationText: {
    fontSize: 16,
  },
  noNotifications: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

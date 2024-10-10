import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const { currentUser } = auth;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) return;

      const db = getFirestore(app);
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("ownerId", "==", currentUser.uid)
      );

      const notificationsSnapshot = await getDocs(notificationsQuery);
      console.log();
      const notificationsData = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(notificationsData);


      setNotifications(notificationsData);
      setLoading(false);
    };

    fetchNotifications();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.notificationItem}>
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

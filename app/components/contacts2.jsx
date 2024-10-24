import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback  } from "react";
import { View, Text, Button, Alert, TouchableOpacity } from "react-native";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ActivityIndicator } from "react-native-paper";
import Contact from "./contact-single";

const Contacts2 = ({ currentUser, onContactSelect }) => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState("");
    const [loading, setLoading] = useState(false);
    const [showContacts, setShowContacts] = useState(true);
    const [error, setErrorMessage] = useState("");
    const [success, setSuccessMessage] = useState("");

    useEffect(() => {
        let timer;
        if (error || success) {
            timer = setTimeout(() => {
                setErrorMessage("");
                setSuccessMessage("");
            }, 3000);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [error, success]);

    const db = getFirestore();

    useFocusEffect(
        useCallback(() => {
          const fetchContacts = async () => {
            setLoading(true);
            try {
              const q = query(
                collection(db, "contacts"),
                where("ownerId", "==", currentUser.uid)
              );
              const querySnapshot = await getDocs(q);
              const contactsData = [];
              querySnapshot.forEach((doc) => {
                contactsData.push({ ...doc.data(), id: doc.id });
              });
              setContacts(contactsData);
            } catch (error) {
              setErrorMessage("Error al obtener los contactos.");
            } finally {
              setLoading(false);
            }
          };
    
          fetchContacts();
        }, [db, currentUser.uid])
      );

    const handleDeleteContact = async (contactId) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, "contacts", contactId));
            setContacts(contacts.filter(contact => contact.id !== contactId));
            setSuccessMessage("Contacto eliminado con éxito");
        } catch (error) {
            setErrorMessage(`Error al eliminar el contacto: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteContact = (contactId) => {
        Alert.alert(
            "Eliminar contacto",
            "¿Estás seguro de que deseas eliminar este contacto?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Eliminar",
                    onPress: () => handleDeleteContact(contactId),
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    return (
        <View>

            {/* Mensajes de éxito y error */}
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            {success && <Text style={{ color: "green" }}>{success}</Text>}

            <Button
                title={showContacts ? "[-] Contactos" : "[+] Contactos"}
                onPress={() => setShowContacts(!showContacts)}
            />

            {showContacts && (
                <View>
                    {loading ? (
                        <ActivityIndicator size="large" />
                    ) : (
                        <View>
                            {contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <Contact
                                        key={contact.id}
                                        contact={contact}
                                        isSelected={selectedContact === contact.email}
                                        onPress={() => {
                                            setSelectedContact(contact.email);
                                            onContactSelect(contact.email);
                                        }
                                        }
                                        onDelete={() => confirmDeleteContact(contact.id)}

                                    />
                                ))
                            ) : (
                                <Text>No hay contactos</Text>
                            )}
                        </View>
                    )}
                </View>
            )}




        </View>
    );
};

export default Contacts2;

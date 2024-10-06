import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../utils/firebaseConfig";

export default function DialogFlowChat () {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const { currentUser } = auth;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const [isHumanSupport, setIsHumanSupport] = useState(false);
  const [hasSentHumanResponse, setHasSentHumanResponse] = useState(false);

  const chatDocRef = useMemo(() => {
    return doc(collection(db, "chats"), currentUser?.uid);
  }, [db, currentUser?.uid]);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatData = docSnapshot.data();
          const newMessages = chatData.messages || [];
          setIsHumanSupport(chatData.isHumanSupport || false);
          setMessages(newMessages);
        } else {
          setMessages([]);
        }
      });
      return () => unsubscribe();
    }
  }, [chatDocRef, currentUser, messages.length]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollToEnd({ animated: true });
      }
    };
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessageToDialogFlow = async (message) => {
    const requestBody = {
      message: message,
      sessionId: currentUser.uid,
    };

    try {
      const response = await fetch(
        "https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/dialogflow-package/send-dialogflow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Error al comunicarse con la función de Digital Ocean");
      }

      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        return data.response;
      } else {
        throw new Error("Respuesta vacía del servidor.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      return "Error al recibir respuesta del bot.";
    }
  };

  const saveMessageToDB = async (messageObject) => {
    try {
      await setDoc(
        chatDocRef,
        {
          messages: arrayUnion(messageObject),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error guardando mensaje en la base de datos: ", error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = {
        text: newMessage,
        createdAt: new Date(),
        userId: currentUser.uid,
        userName: currentUser.displayName,
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setIsSending(true);
      await saveMessageToDB(userMessage);

      if (
        newMessage.toLowerCase().includes("hablar con soporte") ||
        newMessage.toLowerCase().includes("quiero un agente") ||
        newMessage.toLowerCase().includes("soporte")
      ) {
        setIsHumanSupport(true);
        setHasSentHumanResponse(false);

        const botMessage = {
          text: "Te estamos conectando con un agente humano. Por favor, espera.",
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(botMessage);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setNewMessage("");
        setIsSending(false);
        await setDoc(chatDocRef, { isHumanSupport: true }, { merge: true });
        return;
      }

      if (isHumanSupport) {
        if (!hasSentHumanResponse) {
          const botMessage = {
            text: "Un agente humano responderá tu mensaje.",
            createdAt: new Date(),
            userId: "bot",
            userName: "Soporte",
          };

          await saveMessageToDB(botMessage);
          setMessages((prevMessages) => [...prevMessages, botMessage]);
          setHasSentHumanResponse(true);
        }
        setNewMessage("");
        setIsSending(false);
        return;
      }

      try {
        const botReply = await sendMessageToDialogFlow(newMessage);
        const botMessage = {
          text: botReply,
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(botMessage);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error(error);
        const errorMessage = {
          text: "Error al recibir respuesta del bot.",
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(errorMessage);
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setNewMessage("");
        setIsSending(false);
      }
    }
  };

  return (
    <View style={styles.chatWindow}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Chat - Soporte Automático</Text>
      </View>
      <ScrollView ref={chatEndRef} style={styles.chatMessages}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.message,
              msg.userId === currentUser.uid ? styles.sent : styles.received,
            ]}
          >
            <Text style={styles.messageUser}>{msg.userName || currentUser.email}</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
            <Text style={styles.messageTimestamp}>{msg.createdAt
                    ? new Date(
                        msg.createdAt.seconds
                          ? msg.createdAt.toDate() // Si es un Timestamp de Firebase
                          : msg.createdAt // Si ya es un Date de JavaScript
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.messageForm}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
          placeholder="Escribe un mensaje..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isSending}>
          <Text style={styles.sendButtonText}>{isSending ? "Enviando..." : "Enviar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chatWindow: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 10,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  sent: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageUser: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  messageForm: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

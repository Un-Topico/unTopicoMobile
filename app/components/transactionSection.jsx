import React from "react";
import { View, Text, ScrollView } from "react-native";
import TransactionsForm from "./transactionForm";
import {TransactionHistory} from "./transactionHistory";
import { auth } from "../utils/firebaseConfig";
export const TransactionSection = ({ selectedCard, updateCardBalance }) => {
  const { currentUser } = auth; // Obtener currentUser del contexto

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Transacciones</Text>
          {selectedCard ? (
            <TransactionsForm
              selectedCardId={selectedCard.cardId}
              updateBalance={updateCardBalance}
              currentUser={currentUser}
            />
          ) : (
            <Text>Selecciona una tarjeta para ver las transacciones</Text>
          )}
        </View>
      </View>

      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Historial de Transacciones</Text>
        {selectedCard ? (
          <TransactionHistory selectedCardId={selectedCard.cardId} />
        ) : (
          <Text>Selecciona una tarjeta para ver el historial</Text>
        )}
      </View>
    </ScrollView>
  );
};

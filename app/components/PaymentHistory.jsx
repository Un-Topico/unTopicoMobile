import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../utils/firebaseConfig"; // Configuración de Firebase
import { View, Text, Picker, ActivityIndicator, FlatList } from "react-native";
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Obtener las dimensiones de la pantalla para los gráficos
const screenWidth = Dimensions.get("window").width;

export const PaymentHistory = ({ currentUser }) => {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCards = async () => {
      const db = getFirestore(app);

      try {
        // Obtener las tarjetas del usuario
        const cardsRef = collection(db, "cards");
        const cardsQuery = query(cardsRef, where("ownerId", "==", currentUser.uid));
        const cardsSnapshot = await getDocs(cardsQuery);

        const userCards = cardsSnapshot.docs.map((doc) => ({
          cardId: doc.id,
          ...doc.data(),
        }));

        setCards(userCards);
      } catch (error) {
        console.error("Error al obtener las tarjetas: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [currentUser]);

  const fetchPurchaseHistory = async (cardId) => {
    const db = getFirestore(app);
    setLoading(true);

    try {
      // Obtener las transacciones de la tarjeta seleccionada
      const transactionsRef = collection(db, "transactions");

      // Consulta para "compra"
      const purchaseQuery = query(
        transactionsRef,
        where("transaction_type", "==", "compraEnLinea"),
        where("card_id", "==", cardId)
      );
      const purchaseSnapshot = await getDocs(purchaseQuery);
      const purchasesData = purchaseSnapshot.docs.map((doc) => doc.data());

      // Consulta para "pagoServicio"
      const servicePaymentQuery = query(
        transactionsRef,
        where("transaction_type", "==", "pagoServicio"),
        where("card_id", "==", cardId)
      );
      const servicePaymentSnapshot = await getDocs(servicePaymentQuery);
      const servicePaymentsData = servicePaymentSnapshot.docs.map((doc) => doc.data());

      // Combinar y ordenar las transacciones
      const combinedTransactions = [...purchasesData, ...servicePaymentsData];
      combinedTransactions.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());

      setTransactions(combinedTransactions);
    } catch (error) {
      console.error("Error al obtener las transacciones: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = (itemValue) => {
    setSelectedCardId(itemValue);
    fetchPurchaseHistory(itemValue);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (cards.length === 0) {
    return <Text>No tienes tarjetas registradas.</Text>;
  }

  // Datos para el gráfico de barras por categoría
  const categoryData = transactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
      },
    ],
  };

  // Datos para el gráfico de línea (transacciones a lo largo del tiempo)
  const lineChartData = {
    labels: transactions.map(transaction => new Date(transaction.transaction_date.seconds * 1000).toLocaleDateString()),
    datasets: [
      {
        data: transactions.map(transaction => transaction.amount),
      },
    ],
  };

  return (
    <View style={{ padding: 10 }}>
      {/* Selección de tarjetas */}
      <Picker
        selectedValue={selectedCardId}
        onValueChange={handleCardSelection}
        style={{ height: 50, width: 150 }}
      >
        <Picker.Item label="-- Selecciona una tarjeta --" value="" />
        {cards.map((card) => (
          <Picker.Item key={card.cardId} label={`${card.cardNumber} - Saldo: $${card.balance}`} value={card.cardId} />
        ))}
      </Picker>

      {/* Lista de transacciones */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transaction_id}
        renderItem={({ item }) => (
          <View>
            <Text>Descripción: {item.description}</Text>
            <Text>Monto: ${item.amount}</Text>
            <Text>Categoría: {item.category}</Text>
            <Text>Fecha: {new Date(item.transaction_date.seconds * 1000).toLocaleString()}</Text>
          </View>
        )}
      />

      {/* Gráficos */}
      {selectedCardId && transactions.length > 0 && (
        <>
          <Text>Gastos por Categoría</Text>
          <BarChart
            data={barChartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
          />

          <Text>Gastos a lo Largo del Tiempo</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: "#022173",
              backgroundGradientFrom: "#1e3d59",
              backgroundGradientTo: "#1e3d59",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
          />
        </>
      )}
    </View>
  );
};

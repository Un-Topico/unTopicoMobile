import React, { useEffect, useState } from "react";
import { View, Text, Alert, Button } from "react-native";
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { app } from "../utils/firebaseConfig";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export const TransactionHistory = ({ selectedCardId }) => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    if (!selectedCardId) {
      setTransactions([]);
      return;
    }

    let q = query(
      collection(db, "transactions"),
      where("card_id", "==", selectedCardId)
    );

    if (filter !== "all") {
      q = query(q, where("status", "==", filter));
    }

    if (startDate && endDate) {
      q = query(
        q,
        where("transaction_date", ">=", startDate),
        where("transaction_date", "<=", endDate)
      );
    }

    q = query(q, orderBy("transaction_date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({ ...doc.data(), id: doc.id });
        });

        setTransactions(transactionsData);
        setError(null);
      },
      (error) => {
        console.error("Error al obtener transacciones:", error);
        setError("Hubo un error al obtener las transacciones.");
      }
    );

    return () => unsubscribe();
  }, [db, selectedCardId, filter, startDate, endDate]);

  const showDatepicker = (type) => {
    if (type === 'start') {
      setShowStartDatePicker(true);
    } else {
      setShowEndDatePicker(true);
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      if (showStartDatePicker) {
        setStartDate(selectedDate || startDate);
        setShowStartDatePicker(false);
      } else {
        setEndDate(selectedDate || endDate);
        setShowEndDatePicker(false);
      }
    } else {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  };

  return (
    <View>
      <Text>Filtrar por tipo</Text>
      <Picker selectedValue={filter} onValueChange={(itemValue) => setFilter(itemValue)}>
        <Picker.Item label="Todas" value="all" />
        <Picker.Item label="Realizadas" value="sent" />
        <Picker.Item label="Recibidas" value="received" />
      </Picker>

      <Text>Filtrar por fecha</Text>
      <Button title="Seleccionar fecha de inicio" onPress={() => showDatepicker('start')} />
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Text>Fecha de inicio: {startDate.toLocaleDateString()}</Text>

      <Button title="Seleccionar fecha de fin" onPress={() => showDatepicker('end')} />
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Text>Fecha de fin: {endDate.toLocaleDateString()}</Text>

      {error && <Text>{error}</Text>}

      {transactions.length === 0 ? (
        <Text>No se encontraron transacciones.</Text>
      ) : (
        transactions.map((transaction) => (
          <View key={transaction.id} style={{ marginVertical: 8 }}>
            <Text>ID: {transaction.transaction_id}</Text>
            <Text>Tipo: {transaction.status}</Text>
            <Text>Monto: ${transaction.amount.toFixed(2)}</Text>
            <Text>Fecha: {transaction.transaction_date.toDate().toLocaleString()}</Text>
            <Text>Descripción: {transaction.description || "Sin descripción"}</Text>
          </View>
        ))
      )}
    </View>
  );
};

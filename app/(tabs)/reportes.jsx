import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Button, Platform } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker'; // Usar DateTimePicker
import { app } from '../utils/firebaseConfig';
import { useCard } from '../context/CardContext'; // Importa el contexto para la tarjeta seleccionada

const reportes = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // Estado para el filtro de tipo
  const [startDate, setStartDate] = useState(null); // Estado para la fecha de inicio
  const [endDate, setEndDate] = useState(null); // Estado para la fecha de fin
  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // Mostrar selector de fecha de inicio
  const [showEndDatePicker, setShowEndDatePicker] = useState(false); // Mostrar selector de fecha de fin
  const [error, setError] = useState(null); // Estado para mostrar errores
  const [currentPage, setCurrentPage] = useState(1); // Estado para la pagina actual
  const transactionsPerPage = 5; // Definir el numero de transacciones por pagina
  const db = getFirestore(app);

  const { selectedCard } = useCard(); // Usar el contexto de la tarjeta seleccionada

  useEffect(() => {
    if (!selectedCard) {
      setTransactions([]);
      return;
    }

    let q = query(collection(db, 'transactions'), where('card_id', '==', selectedCard.id));

    if (filter !== 'all') {
      q = query(q, where('status', '==', filter));
    }

    if (startDate && endDate) {
      q = query(q, where('transaction_date', '>=', startDate), where('transaction_date', '<=', endDate));
    }

    q = query(q, orderBy('transaction_date', 'desc'));

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
        console.error('Error al obtener transacciones:', error);
        setError('Hubo un error al obtener las transacciones.');
      }
    );

    return () => unsubscribe();
  }, [db, selectedCard, filter, startDate, endDate]);

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios'); // Cerrar el picker para Android
    setStartDate(currentDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios'); // Cerrar el picker para Android
    setEndDate(currentDate);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Transacciones</Text>

      {/* Filtro de tipo */}
      <View style={styles.filterContainer}>
        <Text>Filtrar por tipo:</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter('all')}>
          <Text>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter('sent')}>
          <Text>Realizadas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter('received')}>
          <Text>Recibidas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter('pagado')}>
          <Text>Compras</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro de fecha */}
      <View style={styles.dateContainer}>
        <Text>Filtrar por fecha:</Text>
        <Button title="Fecha inicio" onPress={() => setShowStartDatePicker(true)} />
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        <Button title="Fecha fin" onPress={() => setShowEndDatePicker(true)} />
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {currentTransactions.length === 0 ? (
        <Text>No se encontraron transacciones.</Text>
      ) : (
        <FlatList
          data={currentTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text>ID: {item.transaction_id}</Text>
              <Text>Tipo: {item.status}</Text>
              <Text>Monto: ${item.amount.toFixed(2)}</Text>
              <Text>Fecha: {new Date(item.transaction_date.toDate()).toLocaleString()}</Text>
              <Text>Descripción: {item.description || 'Sin descripción'}</Text>
            </View>
          )}
        />
      )}

      {/* Paginación */}
      <View style={styles.pagination}>
        {[...Array(Math.ceil(transactions.length / transactionsPerPage)).keys()].map((number) => (
          <TouchableOpacity key={number + 1} onPress={() => paginate(number + 1)} style={styles.pageButton}>
            <Text style={currentPage === number + 1 ? styles.activePage : styles.pageNumber}>{number + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  transactionItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  pageButton: {
    marginHorizontal: 5,
    padding: 10,
  },
  pageNumber: {
    fontSize: 16,
    color: '#000',
  },
  activePage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },
});

export default reportes;

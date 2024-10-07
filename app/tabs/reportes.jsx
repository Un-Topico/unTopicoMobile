import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Button } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import DatePicker from 'react-native-date-picker';
import { app } from '../utils/firebaseConfig';
import { useCard } from '../context/CardContext'; // Importa el contexto para la tarjeta seleccionada

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // Estado para el filtro de tipo
  const [startDate, setStartDate] = useState(null); // Estado para la fecha de inicio
  const [endDate, setEndDate] = useState(null); // Estado para la fecha de fin
  const [error, setError] = useState(null); // Estado para mostrar errores
  const [currentPage, setCurrentPage] = useState(1); // Estado para la pagina actual
  const transactionsPerPage = 5; // Definir el numero de transacciones por pagina
  const db = getFirestore(app);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const { selectedCard } = useCard(); // Usar el contexto de la tarjeta seleccionada

  useEffect(() => {
    // No hacer nada si no hay una tarjeta seleccionada
    if (!selectedCard) {
      setTransactions([]);
      return;
    }

    // Construir la consulta basada en los filtros seleccionados
    let q = query(collection(db, 'transactions'), where('card_id', '==', selectedCard.id));

    if (filter !== 'all') {
      q = query(q, where('status', '==', filter));
    }

    if (startDate && endDate) {
      q = query(q, where('transaction_date', '>=', startDate), where('transaction_date', '<=', endDate));
    }

    // Agregar ordenación por fecha
    q = query(q, orderBy('transaction_date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({ ...doc.data(), id: doc.id });
        });

        setTransactions(transactionsData);
        setError(null); // Limpiar el error si la consulta tiene éxito
      },
      (error) => {
        console.error('Error al obtener transacciones:', error);
        setError('Hubo un error al obtener las transacciones.');
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [db, selectedCard, filter, startDate, endDate]);

  // Obtener las transacciones de la pagina actual
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Cambiar de pagina
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
        <Button title="Fecha inicio" onPress={() => setOpenStartDatePicker(true)} />
        <DatePicker
          modal
          open={openStartDatePicker}
          date={startDate || new Date()}
          onConfirm={(date) => {
            setOpenStartDatePicker(false);
            setStartDate(date);
          }}
          onCancel={() => {
            setOpenStartDatePicker(false);
          }}
        />

        <Button title="Fecha fin" onPress={() => setOpenEndDatePicker(true)} />
        <DatePicker
          modal
          open={openEndDatePicker}
          date={endDate || new Date()}
          onConfirm={(date) => {
            setOpenEndDatePicker(false);
            setEndDate(date);
          }}
          onCancel={() => {
            setOpenEndDatePicker(false);
          }}
        />
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

export default TransactionHistory;

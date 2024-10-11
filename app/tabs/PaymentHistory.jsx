import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchCards, fetchPaymentHistory } from '../utils/firebaseService';
import { getAuth } from 'firebase/auth';  // Importamos la autenticación de Firebase
import { BarChart, LineChart } from 'react-native-chart-kit'; // Biblioteca para gráficos
import Swiper from 'react-native-swiper-flatlist';

const { width } = Dimensions.get('window');

const PaymentHistory = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Obtenemos al usuario actual directamente desde Firebase
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setCurrentUser(user);
    } else {
      console.error('Error: Usuario no autenticado.');
    }
  }, []);

  // Cargar tarjetas cuando currentUser esté definido
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const loadCards = async () => {
        try {
          const userCards = await fetchCards(currentUser.uid);
          setCards(userCards);
        } catch (error) {
          console.error("Error loading cards: ", error);
        } finally {
          setLoading(false);
        }
      };
      loadCards();
    }
  }, [currentUser]);

  const fetchPurchaseHistory = async (cardId) => {
    setLoading(true);
    try {
      const paymentHistory = await fetchPaymentHistory(cardId);
      setTransactions(paymentHistory);
    } catch (error) {
      console.error("Error loading payment history: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = (cardId) => {
    setSelectedCardId(cardId);
    fetchPurchaseHistory(cardId);
  };

  // Filtramos las transacciones según el tipo y agregamos los datos por categoría
  const categoryData = transactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    // Solo incluimos transacciones con categoría definida
    if (category) {
      acc[category] = (acc[category] || 0) + amount;
    }
    return acc;
  }, {});

  // Filtramos los pagos por servicio
  const serviceTypeData = transactions.reduce((acc, transaction) => {
    if (transaction.transaction_type === "pagoServicio") {
      const { service_type, amount } = transaction;
      acc[service_type] = (acc[service_type] || 0) + amount;
    }
    return acc;
  }, {});

  // Filtrar solo las transacciones que correspondan a servicios o compras
  const filteredTransactions = transactions.filter(
    transaction =>
      transaction.transaction_type === "pagoServicio" ||
      transaction.transaction_type === "compra"
  );

  // Datos para el gráfico de línea (transacciones a lo largo del tiempo)
  const lineChartData = {
    labels: filteredTransactions.map(transaction =>
      new Date(transaction.transaction_date.seconds * 1000).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Monto de Servicios y Compras',
        data: filteredTransactions.map(transaction => transaction.amount),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions
    .filter(item => item.category === "servicio")
    .slice(indexOfFirstTransaction, indexOfLastTransaction);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!currentUser || !currentUser.uid) {
    return <Text>Error: Usuario no autenticado o no definido.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Compras y Pagos de Servicios</Text>

      <Picker
        selectedValue={selectedCardId}
        onValueChange={(itemValue) => handleCardSelection(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona una tarjeta" value={null} />
        {cards.map((card) => (
          <Picker.Item key={card.cardId} label={`${card.cardNumber} - Saldo: $${card.balance}`} value={card.cardId} />
        ))}
      </Picker>
      
      {selectedCardId && currentTransactions.length > 0 && (
        <FlatList
          data={currentTransactions.filter(item => item.category === "servicio")} 
          keyExtractor={(item, index) => `transaction_${index}`}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <Text>Monto: ${item.amount}</Text>
              <Text>Descripción: {item.description}</Text>
              <Text>Fecha: {new Date(item.transaction_date.seconds * 1000).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}

      {selectedCardId && currentTransactions.length === 0 && !loading && (
        <Text>No hay transacciones para esta tarjeta.</Text>
      )}

      <View style={styles.buttonContainer}>
        {/* Botones para cambiar entre las páginas */}
        <TouchableOpacity
          style={styles.buttonPage}
          onPress={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.buttonText}>Página Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonPage}
          onPress={() => setCurrentPage(currentPage + 1)}
          disabled={currentTransactions.length < transactionsPerPage}
        >
          <Text style={styles.buttonText}>Siguiente Página</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.swipCon}>
        <Swiper
          showPagination={false}
        >
          {/* Mostrar gráfico de gastos por categoría */}
          {selectedCardId && transactions.length > 0 && (
            <View style={styles.graficaContainer}>
              <Text style={styles.chartTitle}>Gastos por Categoría</Text>
              <BarChart
                data={{
                  labels: Object.keys(categoryData),
                  datasets: [
                    {
                      label: 'Gastos por Categoría',
                      data: Object.values(categoryData),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                  ],
                }}
                width={370} // Ajusta según el tamaño de tu pantalla
                height={220}
                yAxisLabel="$"
                fromZero={true} // Asegúrate de que comience desde 0
                yAxisInterval={1000} // Intervalo de 1000
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalCount: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                style={{
                  marginVertical: 4,
                  borderRadius: 6,
                }}
              />
            </View>
          )}

          {/* Mostrar gráfico de pagos por tipo de servicio */}
          {selectedCardId && transactions.length > 0 && (
            <View style={styles.graficaContainer}>
              <Text style={styles.chartTitle}>Pagos por Tipo de Servicio</Text>
              <BarChart
                data={{
                  labels: Object.keys(serviceTypeData),
                  datasets: [
                    {
                      label: 'Pagos por Tipo de Servicio',
                      data: Object.values(serviceTypeData),
                      backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    },
                  ],
                }}
                width={370}
                height={220}
                yAxisLabel="$"
                fromZero={true} // Asegúrate de que comience desde 0
                yAxisInterval={1000} // Intervalo del eje Y
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalCount: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                style={{
                  marginVertical: 4,
                  borderRadius: 6,
                }}
              />
            </View>
          )}

          {/* Renderizar el gráfico de línea */}
          {selectedCardId && filteredTransactions.length > 0 && (
            <View style={styles.graficaContainer}>
              <Text style={styles.chartTitle}>Transacciones a lo largo del tiempo</Text>
              <LineChart
                data={{
                  labels: lineChartData.labels, // Fechas de las transacciones
                  datasets: [
                    {
                      data: lineChartData.datasets[0].data, // Montos de las transacciones
                    },
                  ],
                }}
                width={370} // Ajusta el tamaño según la pantalla
                height={220}
                yAxisLabel="$"
                fromZero={true} // Asegúrate de que comience desde 0
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalCount: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                bezier // Esto agrega una curva suave al gráfico
                style={{
                  marginVertical: 4,
                  borderRadius: 6,
                }}
              />
            </View>
          )}


        </Swiper>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  transactionCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  swipCon: {
    height: width * 0.65,
  },
  graficaContainer: {
    padding: 1,
  },
  buttonPage: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',               
    fontSize: 14,               
  },
  buttonContainer: {
    flexDirection: 'row',  
    justifyContent: 'space-between', 
    alignItems: 'center',   
    marginVertical: 5,      
  },
});

export default PaymentHistory;

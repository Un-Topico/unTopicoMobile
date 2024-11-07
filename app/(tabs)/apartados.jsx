import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { useCard } from '../context/CardContext';

const Apartados = () => {
  const [balance, setBalance] = useState(null);
  const [apartados, setApartados] = useState([]);
  const [nuevoApartado, setNuevoApartado] = useState('');
  const [montoApartado, setMontoApartado] = useState('');
  const db = getFirestore();
  const { selectedCard } = useCard();
  const [modalVisible, setModalVisible] = useState(false);
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const [selectedApartado, setSelectedApartado] = useState(null); // Para el apartado seleccionado para retirar dinero

  const placeholderColor = "black";
  const retirarDinero = async () => {
    let montoRetirar = parseFloat(amountToWithdraw);
    // Redondeamos el monto a 2 decimales
    montoRetirar = montoRetirar.toFixed(2);
  
    if (montoRetirar && montoRetirar > 0 && montoRetirar <= selectedApartado.monto) {
      try {
        // Actualizar el saldo de la tarjeta
        const nuevoBalance = balance + parseFloat(montoRetirar); // Convertimos a float
        const cardDocRef = doc(db, 'cards', selectedCard.cardId);
        await updateDoc(cardDocRef, { balance: nuevoBalance });
        setBalance(nuevoBalance);
  
        // Actualizar el apartado
        const apartadosRef = doc(db, `cards/${selectedCard.cardId}/apartados`, selectedApartado.id);
        await updateDoc(apartadosRef, { monto: selectedApartado.monto - parseFloat(montoRetirar) });
  
        // Actualizar el estado local
        const updatedApartados = apartados.map((item) =>
          item.id === selectedApartado.id
            ? { ...item, monto: item.monto - parseFloat(montoRetirar) }
            : item
        );
        setApartados(updatedApartados);
  
        alert('Dinero retirado con éxito');
        setModalVisible(false); // Cerrar modal después de realizar el retiro
        setAmountToWithdraw(''); // Limpiar el campo del monto
      } catch (error) {
        console.error('Error al retirar dinero:', error);
      }
    } else {
      alert('Monto inválido');
    }
  };
  

  const eliminarApartado = async (apartado) => {
    try {
      // Eliminar el apartado de Firestore
      const apartadosRef = doc(db, `cards/${selectedCard.cardId}/apartados`, apartado.id);
      await deleteDoc(apartadosRef);

      // Actualizar el saldo de la tarjeta
      const nuevoBalance = balance + apartado.monto;
      const cardDocRef = doc(db, 'cards', selectedCard.cardId);
      await updateDoc(cardDocRef, { balance: nuevoBalance });
      setBalance(nuevoBalance);

      // Actualizar el estado local
      setApartados(apartados.filter((item) => item.id !== apartado.id));

      alert('Apartado eliminado y saldo actualizado');
    } catch (error) {
      console.error('Error al eliminar apartado:', error);
    }
  };

  const fetchBalance = async () => {
    if (!selectedCard) return;
    try {
      const cardDocRef = doc(db, 'cards', selectedCard.cardId);
      const cardDoc = await getDoc(cardDocRef);
      if (cardDoc.exists()) {
        setBalance(cardDoc.data().balance);
        fetchApartados();
      } else {
        console.log('No se encontró la tarjeta.');
      }
    } catch (error) {
      console.error('Error al obtener el saldo:', error);
    }
  };

  const fetchApartados = async () => {
    const apartadosRef = collection(db, `cards/${selectedCard.cardId}/apartados`);
    const apartadosSnapshot = await getDocs(apartadosRef);
    const apartadosList = apartadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setApartados(apartadosList);
  };

  const crearApartado = async () => {
    let monto = parseFloat(montoApartado);
    // Redondeamos el monto a 2 decimales
    monto = monto.toFixed(2);
    
    if (nuevoApartado && monto > 0 && balance >= monto) {
      try {
        const newBalance = balance - monto;
        const cardDocRef = doc(db, 'cards', selectedCard.cardId);
        await updateDoc(cardDocRef, { balance: newBalance });
        setBalance(newBalance);
  
        const apartadosRef = collection(db, `cards/${selectedCard.cardId}/apartados`);
        await addDoc(apartadosRef, { nombre: nuevoApartado, monto: parseFloat(monto) }); // Convertir a float nuevamente antes de guardarlo
        setApartados([...apartados, { nombre: nuevoApartado, monto: parseFloat(monto) }]);
        setNuevoApartado('');
        setMontoApartado('');
      } catch (error) {
        console.error('Error al crear el apartado:', error);
      }
    } else {
      console.log('Monto inválido o insuficiente balance.');
    }
  };
  

  const getTotalDisponible = () => {
    const totalApartados = apartados.reduce((acc, item) => acc + item.monto, 0);
    return balance + totalApartados;
  };

  useEffect(() => {
    fetchBalance();
  }, [selectedCard]);

  const handleRetirarClick = (item) => {
    setSelectedApartado(item); // Establecer el apartado seleccionado para retirar
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <View style={styles.saldoContainer}>
          <Text style={styles.title}>Saldo de la Tarjeta</Text>
          {balance !== null ? (
            <Text style={styles.balance}>${balance}</Text>
          ) : (
            <Text style={styles.loading}>Cargando saldo...</Text>
          )}
        </View>

        <View style={styles.apartadoForm}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del Apartado"
            value={nuevoApartado}
            onChangeText={setNuevoApartado}
            placeholderTextColor={placeholderColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Monto"
            value={montoApartado}
            onChangeText={setMontoApartado}
            keyboardType="numeric"
            placeholderTextColor={placeholderColor}
          />
          <TouchableOpacity style={styles.button} onPress={crearApartado}>
            <Text style={styles.buttonText}>Crear Apartado</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subtitle}>Apartados</Text>

      <FlatList
        data={apartados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.apartadoItem}>
            <Text style={styles.apartadoText}>{item.nombre}: ${item.monto}</Text>

            {/* Botón para retirar dinero o eliminar apartado */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.buttonWithdraw}
                onPress={() => handleRetirarClick(item)}>
                <Text style={styles.buttonText}>Retirar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonDelete}
                onPress={() => eliminarApartado(item)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Disponible: ${getTotalDisponible()}</Text>
      </View>

      {/* Modal para retirar dinero */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Retirar Dinero</Text>
            <TextInput
              style={styles.input}
              placeholder="Monto a retirar"
              value={amountToWithdraw}
              onChangeText={setAmountToWithdraw}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={retirarDinero}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  topContent: {
    alignItems: 'center', // Esto solo afecta los elementos superiores
    width: '100%',
  },
  saldoContainer: {
    marginTop: 35,
    borderRadius: 10,
    backgroundColor: '#4fd290',
    padding: 12,
    width: '90%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  balance: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
  },
  loading: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  apartadoForm: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  totalContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '80%',
    height: 45,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  apartadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  apartadoText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  buttonWithdraw: {
    backgroundColor: '#28a745',
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonDelete: {
    backgroundColor: '#dc3545',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  flatListContent: {
    paddingBottom: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Apartados;

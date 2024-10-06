import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TextInput, Button} from "react-native";
import Contacts from "./contacts";
import { handleTransaction } from "../services/transactionService";
import { getCardDoc, listenToCardDoc } from "../services/firestoreTransactionService";
import { Picker } from '@react-native-picker/picker'; // Importa desde el nuevo paquete

const TransactionsForm = ({ currentUser, selectedCardId, updateBalance }) => {
  const [transactionType, setTransactionType] = useState("Deposito");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientClabe, setRecipientClabe] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const lastBalanceRef = useRef(null);

  const memoizedUpdateBalance = useCallback((newBalance) => {
    if (newBalance !== lastBalanceRef.current) {
      updateBalance(newBalance);
      lastBalanceRef.current = newBalance;
    }
  }, [updateBalance]);

  useEffect(() => {
    if (selectedCardId) {
      const unsubscribe = listenToCardDoc(selectedCardId, memoizedUpdateBalance);
      return () => unsubscribe();
    }
  }, [selectedCardId, memoizedUpdateBalance]);

  const handleSubmit = async () => {
    try {
      const cardDoc = await getCardDoc(selectedCardId);

      if (transactionType === "Transferencia" && !recipientEmail && !recipientClabe) {
        throw new Error("Debes ingresar un correo electrónico o un número CLABE del destinatario.");
      }

      await handleTransaction(
        cardDoc,
        transactionType,
        amount,
        description,
        recipientEmail,
        recipientClabe,
        currentUser,
        memoizedUpdateBalance
      );

      // Limpiar campos del formulario
      setAmount("");
      setDescription("");
      setRecipientEmail("");
      setRecipientClabe("");
      setSuccess("Transacción realizada con éxito.");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleContactSelect = (email) => {
    setRecipientEmail(email);
    setRecipientClabe("");
  };

  const isEmailDisabled = recipientClabe !== "";
  const isClabeDisabled = recipientEmail !== "";

  return (
    <View>
      <Text>Tipo de Transacción</Text>
      <Picker
        selectedValue={transactionType}
        onValueChange={(itemValue) => setTransactionType(itemValue)}
      >
        <Picker.Item label="Depósito" value="Deposito" />
        <Picker.Item label="Retiro" value="Retiro" />
        <Picker.Item label="Transferencia" value="Transferencia" />
      </Picker>

      <Text>Monto</Text>
      <TextInput
        keyboardType="numeric"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        placeholder="Ingresa el monto"
        style={{ borderColor: "gray", borderWidth: 1, marginBottom: 8 }}
      />

      <Text>Descripción</Text>
      <TextInput
        value={description}
        onChangeText={(text) => setDescription(text)}
        placeholder="Descripción opcional"
        style={{ borderColor: "gray", borderWidth: 1, marginBottom: 8 }}
      />

      {transactionType === "Transferencia" && (
        <>
          <Text>Correo del destinatario</Text>
          <TextInput
            value={recipientEmail}
            onChangeText={(text) => setRecipientEmail(text)}
            placeholder="Ingresa el correo del destinatario"
            editable={!isEmailDisabled}
            style={{ borderColor: "gray", borderWidth: 1, marginBottom: 8 }}
          />

          <Text>Número CLABE del destinatario</Text>
          <TextInput
            value={recipientClabe}
            onChangeText={(text) => setRecipientClabe(text)}
            placeholder="Ingresa el número CLABE del destinatario"
            editable={!isClabeDisabled}
            style={{ borderColor: "gray", borderWidth: 1, marginBottom: 8 }}
          />

          <Contacts
            currentUser={currentUser}
            setError={setError}
            setSuccess={setSuccess}
            onContactSelect={handleContactSelect}
          />
        </>
      )}

      <Button title="Realizar Transacción" onPress={handleSubmit} />

      {error && <Text style={{ color: "red" }}>{error}</Text>}
      {success && <Text style={{ color: "green" }}>{success}</Text>}
    </View>
  );
};

export default TransactionsForm;

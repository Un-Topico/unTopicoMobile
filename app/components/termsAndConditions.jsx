import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const TermsAndConditionsModal = ({ modalVisible, closeModal, onAccept }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            
            <Text style={styles.sectionTitle}>Términos y Condiciones de Uso</Text>
            <Text style={styles.modalContent}>
              Al acceder y utilizar nuestra plataforma de banca en línea, el usuario acepta y se
              obliga a cumplir con los presentes términos y condiciones. Si el usuario no está de
              acuerdo con alguno de estos términos, deberá abstenerse de utilizar nuestros servicios.
            </Text>

            <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
            <Text style={styles.modalContent}>
              Al acceder y utilizar nuestra plataforma de banca en línea, el usuario acepta y se
              obliga a cumplir con los presentes términos y condiciones. Si el usuario no está de
              acuerdo con alguno de estos términos, deberá abstenerse de utilizar nuestros servicios.
            </Text>

            <Text style={styles.sectionTitle}>2. Servicios Ofrecidos</Text>
            <Text style={styles.modalContent}>
              - Registrar tarjetas de débito.
              {"\n"}- Realizar pagos de servicios como agua, luz, etc.
              {"\n"}- Hacer compras y retiros.
              {"\n"}- Realizar depósitos y transferencias entre usuarios de la misma plataforma.
            </Text>

            <Text style={styles.sectionTitle}>3. Registro de Cuenta</Text>
            <Text style={styles.modalContent}>
              Para utilizar nuestros servicios, el usuario debe registrarse proporcionando su nombre,
              correo electrónico y número de teléfono. El registro se puede realizar mediante correo
              y contraseña, o a través de autenticación con Google o Facebook.
            </Text>

            <Text style={styles.sectionTitle}>4. Responsabilidad del Usuario</Text>
            <Text style={styles.modalContent}>
              El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña.
              Además, el usuario se compromete a no utilizar la plataforma para actividades ilegales
              o fraudulentas.
            </Text>

            <Text style={styles.sectionTitle}>5. Limitación de Responsabilidad</Text>
            <Text style={styles.modalContent}>
              La plataforma es un proyecto escolar y, por lo tanto, no se ofrece ninguna garantía
              sobre la disponibilidad continua de los servicios ni sobre la seguridad completa de
              los datos. El uso de la plataforma es bajo el propio riesgo del usuario.
            </Text>

            <Text style={styles.sectionTitle}>6. Modificaciones</Text>
            <Text style={styles.modalContent}>
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier
              momento. Cualquier cambio será notificado a los usuarios a través del sitio web.
            </Text>

            <Text style={styles.sectionTitle}>7. Terminación de Cuenta</Text>
            <Text style={styles.modalContent}>
              Podemos suspender o cancelar el acceso de un usuario si se determina que ha violado
              los términos y condiciones establecidos.
            </Text>

            <Text style={styles.sectionTitle}>Política de Privacidad</Text>
            
            <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
            <Text style={styles.modalContent}>
              - Nombre: Para identificar al usuario en la plataforma.
              {"\n"}- Correo Electrónico: Para el registro de la cuenta, autenticación y envío de
              notificaciones importantes.
              {"\n"}- Número de Teléfono: Para propósitos de seguridad y comunicación.
              {"\n"}- Datos de Autenticación: Pueden incluir el uso de Google o Facebook para
              facilitar el acceso.
            </Text>

            <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
            <Text style={styles.modalContent}>
              Los datos personales recopilados serán utilizados para:
              {"\n"}- Proporcionar acceso a los servicios de la plataforma.
              {"\n"}- Realizar transacciones financieras (depósitos, retiros, transferencias, etc.).
              {"\n"}- Notificar al usuario sobre actividades relevantes en su cuenta (como movimientos
              o actualizaciones).
            </Text>

            <Text style={styles.sectionTitle}>3. Protección de los Datos</Text>
            <Text style={styles.modalContent}>
              Nos comprometemos a proteger la información personal de los usuarios mediante medidas
              de seguridad razonables. Sin embargo, debido a la naturaleza del proyecto, no
              garantizamos la seguridad total de los datos.
            </Text>

            <Text style={styles.sectionTitle}>4. Compartir Información</Text>
            <Text style={styles.modalContent}>
              No compartimos la información personal de los usuarios con terceros, salvo que sea
              requerido por ley o en casos necesarios para cumplir con las obligaciones legales.
            </Text>

            <Text style={styles.sectionTitle}>5. Derechos del Usuario</Text>
            <Text style={styles.modalContent}>
              Los usuarios tienen derecho a acceder, rectificar y cancelar sus datos personales. Para
              ejercer estos derechos, pueden ponerse en contacto a través de la plataforma.
            </Text>

            <Text style={styles.sectionTitle}>6. Uso de Cookies</Text>
            <Text style={styles.modalContent}>
              Podemos utilizar cookies para mejorar la experiencia del usuario. Estas cookies se
              utilizan para recordar preferencias y facilitar el uso de la plataforma.
            </Text>

            <Text style={styles.sectionTitle}>7. Cambios en la Política de Privacidad</Text>
            <Text style={styles.modalContent}>
              Nos reservamos el derecho de modificar esta política de privacidad en cualquier
              momento. Los usuarios serán informados de cualquier cambio a través de la plataforma.
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.acceptButton} onPress={() => { onAccept(); closeModal(); }}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  modalContent: {
    fontSize: 14,
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#4630EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TermsAndConditionsModal;
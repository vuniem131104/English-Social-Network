import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmationModal = ({ visible, title, message, onConfirm, onCancel }) => {
  const { colors } = useTheme();
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: colors.surfaceContainerHigh }]}>
              <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.onSurfaceVarient} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.message, { color: colors.onSurfaceVarient }]}>{message}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.primary }]} 
                  onPress={onCancel}
                >
                  <Text style={[styles.buttonText, { color: '#ffffff' }]}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]} 
                  onPress={onConfirm}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Bỏ theo dõi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  }
});

export default ConfirmationModal;
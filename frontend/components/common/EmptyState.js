import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = ({ 
  icon = 'alert-circle-outline', 
  title = 'Không có dữ liệu', 
  message = 'Không có nội dung nào để hiển thị', 
  actionText = null, 
  onAction = null,
  iconSize = 60,
  iconColor = '#aaa',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#BE0303',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
  },
});

export default EmptyState; 
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';




const CustomModal = ({
  isVisible,
  closeModal,
  title,
  buttonText,
  buttonAction,
  hasCloseButton = true,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{title}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={buttonAction}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>{buttonText}</Text>
            </TouchableOpacity>

          

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create ({

  modalTitle: {
    fontSize: 20,
    fontFamily: "GalanoGrotesque-Bold",
    textAlign: "center",
    color: "#0089C2",
    marginTop: 26,
  },
  modalButton: {
    backgroundColor: "#5AC0EB",
    borderRadius: 16,
    alignSelf: "center",
    width: 168,
    height: 40,
    marginTop: 20,
  },
  modalButtonText: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Bold",
    textAlign: "center",
    marginTop: 13,
    color: "white",
  },
  
  modalWrapper: {
    backgroundColor: 'white',
    borderRadius: 28,
    width: 320,
    height: 150,
    position: 'absolute', // Position it absolutely
    top: '50%', // Center it vertically
    left: '50%', // Center it horizontally
    transform: [ // Use these two lines to actually center the modal
      { translateX: -160 }, // This moves it half of its width to the left
      { translateY: -75 }, // This moves it half of its height to the top
    ],
  },
  
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -4,
    right: -10,
    zIndex: 1,
  },
  
  closeImage: {
    width: 40,
    height: 40,
  },
  
  })
export default CustomModal;
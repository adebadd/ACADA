import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { StyleSheet } from 'react-native';


const CustomModalSmall = ({
  isVisibleSmall,
  closeModalSmall,
  titleSmall,
  buttonTextSmall,
  buttonActionSmall,
  hasCloseButtonSmall = true,
}) => {
  return (
    <Modal
      visible={isVisibleSmall}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{titleSmall}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={buttonActionSmall}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>{buttonTextSmall}</Text>
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
    marginTop: 14,
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
    height: 120,
    position: 'absolute', // Position it absolutely
   alignSelf: "center",
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
  
  export default CustomModalSmall;
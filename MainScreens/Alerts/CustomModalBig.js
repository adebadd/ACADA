import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from "react-native-responsive-screen";

const CustomModalBig= ({
  isVisibleBig,
  closeModalBig,
  titleBig,
  buttonTextBig,
  buttonActionBig,
  hasCloseButtonBig = true,
}) => {
  return (
    <Modal
      visible={isVisibleBig}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{titleBig}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={buttonActionBig}
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>{buttonTextBig}</Text>
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
    fontFamily: "GalanoGrotesque-Medium",
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
    fontFamily: "GalanoGrotesque-Light",
    textAlign: "center",
    marginTop: 13,
    color: "white",
  },
  
  modalWrapper: {
    backgroundColor: 'white',
    borderRadius: 28,
    width: 320,
    height: hp("16%"),
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
  
  export default CustomModalBig;
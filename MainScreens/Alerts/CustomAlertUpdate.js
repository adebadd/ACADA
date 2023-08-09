import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { StyleSheet } from 'react-native';

const CustomModalUpdate = ({
  isVisible,
  closeModal,
  title,
  buttonText,
  buttonText2,
  buttonAction,
  buttonAction2,
  hasCloseButton = true,
}) => {
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{title}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={buttonAction2} // Swap the buttonAction and buttonAction2
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText}>{buttonText}</Text> 
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton2}
              onPress={buttonAction} // Swap the buttonAction and buttonAction2
              activeOpacity={0.9}
            >
              <Text style={styles.modalButtonText2}>{buttonText2}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({

 
  modalTitle: {
    fontSize: 20,
    fontFamily: "GalanoGrotesque-SemiBold",
    textAlign: "center",
    color: "#0089C2",
    marginTop: 31,
},
modalButton: {
    backgroundColor: "#5AC0EB",
    borderRadius: 16,
    width: 110,
    height: 40,
    marginTop: 85,
    marginLeft: 30,
    alignSelf: "flex-start",
    position: "absolute"

},
modalButtonText2: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "center",
    marginTop: 13,
    color: "white",
},

modalButton2: {
    backgroundColor: "#5AC0EB",
    borderRadius: 16,
    marginLeft: 150,
    width: 110,
    height: 40,
    marginTop: 85,
    position: "absolute"
},
modalButtonText: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Bold",
    textAlign: "center",
    marginTop: 13,
    color: "#0089C2",
},

modalWrapper: {
    backgroundColor: 'white',
    borderRadius: 28,
    width: 290,
    height: 150,
    position: 'absolute', // Position it absolutely
    alignSelf: "center",
    borderColor: "#5AC0EB",
    borderWidth: 0.5,
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

export default CustomModalUpdate;
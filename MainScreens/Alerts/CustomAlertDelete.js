import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { StyleSheet } from 'react-native';


const CustomModalDelete = ({
    isVisible,
    closeModal,
    title,
    buttonText,
    buttonText2,
    buttonAction,
    buttonAction2, // Add this
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
                            activeOpacity={0.6}
                        >
                            <Text style={styles.modalButtonText2}>{buttonText}</Text>
                        </TouchableOpacity>

                      
                        <TouchableOpacity
                        onPress={buttonAction2} // This should be buttonAction2 instead of buttonAction
                        
                        >
                        <Image
          style={styles.closeButton}
          source={require("../../assets/AppIcons/exiticon.png")}
        />
        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalTitle: {
        fontSize: 20,
        fontFamily: "GalanoGrotesque-Medium",
        textAlign: "center",
        color: "#0089C2",
        marginTop: 31,
    },
    closeButton: {
        width: 35,
        height: 35,
        resizeMode: "contain",
        marginTop: -75,
        marginLeft: 274,
    },
    modalButton: {
        backgroundColor: "#5AC0EB",
        borderRadius: 16,
        width: 200,
        height: 40,
        marginTop: 85,
        marginLeft: 30,
        alignSelf: "flex-start",
        position: "absolute",
        alignSelf: "center"

    },
    modalButtonText: {
        fontSize: 18,
        fontFamily: "GalanoGrotesque-Bold",
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
        position: "absolute",
        alignSelf: "center"
    },
    modalButtonText2: {
        fontSize: 20,
        fontFamily: "GalanoGrotesque-Medium",
        textAlign: "center",
        marginTop: 12,
        color: "white",
    },

    modalWrapper: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: 300,
        height: 150,
        position: 'absolute', // Position it absolutely
        alignSelf: "center",
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default CustomModalDelete;
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';

const CustomModalInfo = ({ isVisible, closeModal, title }) => {
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalWrapper}>
                    <View style={styles.modalContainer}>
                        <Text allowFontScaling={false} style={styles.modalTitle}>{title}</Text>

                        <TouchableOpacity
                            onPress={closeModal}
                            activeOpacity={0.6}
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
    modalWrapper: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: 300,
        height: 150,
        position: 'absolute',
        alignSelf: "center",
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default CustomModalInfo;
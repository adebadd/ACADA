import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';

const CustomModalInfo = ({ isVisible, closeModal, title, description, nextHandler, prevHandler, currentIndex }) => {
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalWrapper}>
                    <View style={styles.topbar}>
                        {currentIndex !== 0 && (
                            <TouchableOpacity onPress={prevHandler} style={{ alignItems: "center", paddingRight: 15 }}>
                                <Image
                                    style={styles.prevButton}
                                    source={require("../../assets/AppIcons/prev.png")}
                                />
                            </TouchableOpacity>
                        )}

                        <Text style={[
                            styles.modalTitle, 
                            (currentIndex === 0 || title === "Pomodoro" || title === "Fifty-Two") && { paddingLeft: 15 }
                        ]}>
                            {title}
                        </Text>

                        {/* Conditionally render the next.png image if the title isn't "Fifty-Two" */}
                        {title !== "Fifty-Two" ? (
                            <TouchableOpacity onPress={nextHandler} style={{alignItems: "center", paddingLeft: 15,}}>
                                <Image
                                    style={styles.nextButton}
                                    source={require("../../assets/AppIcons/next.png")}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 35 }} /> // Empty view to add the right arrow's padding for "Fifty-Two"
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={closeModal}
                        activeOpacity={0.6}
                    >
                        <Image
                            style={styles.closeButton}
                            source={require("../../assets/AppIcons/exiticon.png")}
                        />
                    </TouchableOpacity>

                    <Text style={styles.modalDescription}>{description}</Text>
                </View>
            </View>
        </Modal>
    );
}




const styles = StyleSheet.create({
    modalContainer:{
        alignSelf: "center"
    },

    topbar: {
   flexDirection: "row",
   alignSelf: "center"
    },
    nextButton : {
        // Style for next button
        width: 18,
        height: 18,
        resizeMode: "contain",
        marginTop: 31,
        alignItems: "center",
        
    },
    prevButton : {
        // Style for next button
        width: 18,
        height: 18,
        resizeMode: "contain",
        marginTop: 31,
        alignSelf: "center",
        
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: "GalanoGrotesque-Medium",
        textAlign: "center",
        color: "#0089C2",
        marginTop: 31,
    },
    closeButton: {
        width: 25,
        height: 25,
        resizeMode: "contain",
        marginTop: "-18%",
        marginLeft: 318,
    },
    modalDescription: {
        fontSize: 20,
        fontFamily: "GalanoGrotesque-Light",
        textAlign: "center",
        color: "#0089C2",
        marginTop: 20,
        marginHorizontal: 10, // Add some horizontal padding for better readability
    },
    modalWrapper: {
        backgroundColor: 'white',
        borderColor: "#5AC0EB",
        borderRadius: 20,
        borderWidth: 2,
        width: 340,
        height: 280,
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
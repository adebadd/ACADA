import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, getDocs } from "firebase/firestore"; 

const SocialPage = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if(searchTerm) {
      const fetchUsers = async () => {
        try {
          const q = query(collection(db, "users"), where("username", "==", searchTerm));
          const querySnapshot = await getDocs(q);
          let usersArray = [];
          querySnapshot.forEach((doc) => {
            usersArray.push({ ...doc.data(), id: doc.id });
          });
          setUsers(usersArray);
        } catch (error) {
          Alert.alert('Error', 'Error fetching users. Please try again.');
        }
      }

      fetchUsers();
    }
  }, [searchTerm]);

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem}>
      <Text>{item.username}</Text>
      <TouchableOpacity onPress={() => {/* logic to add user as a friend */}}>
        <Text>Add Friend</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social</Text>
      <TextInput 
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search for friends..."
        style={styles.input}
      />
      <FlatList 
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 20,
    marginBottom: 12
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: 'gray'
  }
});

export default SocialPage;
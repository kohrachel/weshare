import React from 'react';
import { Image, Text, View, TextInput, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
import { ButtonGreen } from '../components/button-green';

const styles = StyleSheet.create({
  input: {
    color: 'gray',
    borderColor: 'white',
    height: 40,
    margin: 6,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
});

export default function EditProfile() {
  const [name, onChangeName] = React.useState('Full name');
  const [email, onChangeEmail] = React.useState('Email');
  const [phone, onChangePhone] = React.useState('Phone');
  const [gender, onChangeGender] = React.useState('Gender');

  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#181818"
      }}
    >
      <Image source={require('@/assets/images/back-arrow.png')}
        style={{width: 10,  height: 10}}
      />
      <Text style={{color: 'white'}}>Edit Profile</Text>
      <Image source={require('@/assets/images/camera-icon.png')} style={{width: 50,  height: 50}}/>
      <TextInput style={styles.input} value={name} />
      <TextInput style={styles.input} value={email} />
      <TextInput style={styles.input} value={phone} />
      <TextInput style={styles.input} value={gender} />
      <ButtonGreen  title="Save Changes"  onPress={() => router.navigate('/_sitemap')}/>
    </View>
  );
}

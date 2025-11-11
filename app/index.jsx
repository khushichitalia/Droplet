import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // bypass authentication (for now)
    router.replace("/tabs/homepage");
    // if (username && password) {
    //   alert('Login successful!'); // temporary behavior
    // // later: navigation.navigate('Home');
    // } else {
    //   alert('Please enter both fields');
    // }
  };

  const handleForgotPassword = () => {
    alert("Password reset link sent!"); // Placeholder — later connect to Firebase reset
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>

      {/* Username Field */}
      <View style={styles.inputContainer}>
        <Image
          source={require("../assets/User.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#CAF0F8"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <Image
          source={require("../assets/Lock.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#CAF0F8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Forgot Password button */}
      <TouchableOpacity
        style={styles.forgotButton}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Text style={styles.link}>
        No Account? <Text style={styles.signUp}>Sign up</Text> Now!
      </Text>

      {/* Decorative bubbles */}
      <View
        style={[
          styles.bubble,
          {
            top: 80,
            left: 265,
            backgroundColor: "#CAF0F8",
            width: 90,
            height: 90,
            opacity: 0.8,
          },
        ]}
      />
      <View
        style={[
          styles.bubble,
          {
            top: 475,
            right: 45,
            backgroundColor: "#CAF0F8",
            width: 50,
            height: 50,
            opacity: 0.7,
          },
        ]}
      />
      <View
        style={[
          styles.bubble,
          {
            top: 415,
            left: 30,
            backgroundColor: "#CAF0F8",
            width: 20,
            height: 20,
            opacity: 0.6,
          },
        ]}
      />

      {/* Waves */}
      <Image
        source={require("../assets/Vector1.png")}
        style={[styles.waveImage, { bottom: 20, height: 160, zIndex: 1 }]}
        resizeMode="cover"
      />
      <Image
        source={require("../assets/Vector2.png")}
        style={[styles.waveImage, { bottom: 45, zIndex: 2 }]}
        resizeMode="cover"
      />
      <Image
        source={require("../assets/Vector3.png")}
        style={[styles.waveImage, { bottom: -30, zIndex: 3 }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00B4D8",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 68,
    fontWeight: "bold",
    color: "#CAF0F8",
    textShadowColor: "#023E8A",
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 7,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#023E8A",
    width: "80%",
    marginBottom: 20,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "white",
    paddingVertical: 10,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginRight: "10%",
    marginBottom: 25,
    backgroundColor: "#023E8A",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  forgotText: {
    color: "#CAF0F8",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#CAF0F8",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 32,
    color: "#023E8A",
    fontWeight: "bold",
    textShadowColor: "#0077B6",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    lineHeight: 34,
  },
  link: {
    marginTop: 20,
    color: "#CAF0F8",
  },
  signUp: {
    color: "#023E8A",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  waveImage: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 150,
  },
  bubble: {
    position: "absolute",
    borderRadius: 50,
  },
});

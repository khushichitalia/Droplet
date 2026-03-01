import { router } from "expo-router";
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("Password reset email sent!");
      router.replace("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.title}>Reset</Text>
      <View style={styles.inputContainer}>
        <Image
          source={require("../../assets/User.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#CAF0F8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>

      <Text style={styles.link}>
        Back to{" "}
        <Text style={styles.signUp} onPress={() => router.replace("/login")}>
          Sign In
        </Text>
      </Text>

      {/* waves */}
      <Image
        source={require("../../assets/Vector1.png")}
        style={[styles.waveImage, { bottom: 20, height: 160, zIndex: 1 }]}
        resizeMode="cover"
      />
      <Image
        source={require("../../assets/Vector2.png")}
        style={[styles.waveImage, { bottom: 45, zIndex: 2 }]}
        resizeMode="cover"
      />
      <Image
        source={require("../../assets/Vector3.png")}
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

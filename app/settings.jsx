import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const NAME_STORAGE_KEY = "@droplet/display-name";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const loadName = async () => {
    try {
      const savedName = await AsyncStorage.getItem(NAME_STORAGE_KEY);
      if (savedName) {
        setName(savedName);
      }
    } catch (error) {
      console.log("Failed to load name", error);
    }
  };

  React.useEffect(() => {
    loadName();
  }, []);

  const saveName = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter a display name.");
      return;
    }

    try {
      await AsyncStorage.setItem(NAME_STORAGE_KEY, trimmedName);
      setName(trimmedName);
      setShowNameInput(false);
      Alert.alert("Success", "Name updated!");
    } catch (error) {
      Alert.alert("Save failed", "Could not save your name right now.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      Alert.alert("Log out failed", error.message);
    }
  };

  const handleTare = () => {
    Alert.alert(
      "Tare Water Bottle",
      "This will reset the water bottle weight to zero.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Tare", onPress: () => console.log("Tare pressed") },
      ]
    );
  };

  const handleSleep = () => {
    Alert.alert(
      "Sleep Mode",
      "Put the water bottle into sleep mode?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sleep", onPress: () => console.log("Sleep pressed") },
      ]
    );
  };

  const handlePowerOff = () => {
    Alert.alert(
      "Power Off",
      "Turn off the water bottle?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Power Off", onPress: () => console.log("Power off pressed"), style: "destructive" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        {/* User Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Settings</Text>
          
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => setShowNameInput(!showNameInput)}
          >
            <Text style={styles.buttonText}>Edit Name</Text>
          </TouchableOpacity>

          {showNameInput && (
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity style={styles.saveButton} onPress={saveName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottle Controls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bottle Controls</Text>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleTare}
          >
            <Text style={styles.buttonText}>Tare</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleSleep}
          >
            <Text style={styles.buttonText}>Sleep</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingButton, styles.powerOffButton]}
            onPress={handlePowerOff}
          >
            <Text style={styles.buttonText}>Power Off</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#023E8A",
    padding: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#CAF0F8",
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CAF0F8",
  },
  card: {
    backgroundColor: "#CAF0F8",
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#6FE3F0",
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003B8E",
    marginBottom: 15,
  },
  settingButton: {
    backgroundColor: "#003B8E",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#CAF0F8",
    fontSize: 18,
    fontWeight: "bold",
  },
  powerOffButton: {
    backgroundColor: "#B00020",
  },
  divider: {
    height: 2,
    backgroundColor: "#6FE3F0",
    marginVertical: 20,
  },
  nameInputContainer: {
    marginBottom: 15,
  },
  nameInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#003B8E",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  saveButton: {
    backgroundColor: "#00B4D8",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
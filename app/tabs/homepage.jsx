import React, { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { updateProfile, signOut } from "firebase/auth";
import { router } from "expo-router";
import {
  Image,
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function HomePage() {
  const [showNameModal, setShowNameModal] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName ?? "",
  );
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (auth.currentUser && !auth.currentUser.displayName) {
      setShowNameModal(true);
    }
  }, []);

  const saveName = async () => {
    if (!name.trim()) {
      alert("Please enter a name!");
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      setDisplayName(name.trim());
      setShowNameModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  let greeting = "Welcome!";

  if (displayName) {
    greeting = `Hello, ${displayName}!`;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.gearIcon}
        onPress={() => setShowSettings(true)}
      >
        <Image
          source={require("../../assets/setting.png")}
          style={styles.gearIcon}
        />
      </TouchableOpacity>

      {/* welcome */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>{greeting}</Text>
        <Text style={styles.welcomeSubtitle}>Today you drank</Text>
        <Text style={styles.amount}>______ oz of water</Text>
      </View>

      {/* droplet */}
      <View style={styles.dropletContainer}>
        <Image
          source={require("../../assets/waterdrop.png")}
          style={styles.droplet}
        />
        <View style={styles.dropTextContainer}>
          <Text style={styles.dropGoalText}>Goal: ____ oz</Text>
        </View>
      </View>
      <Modal visible={showNameModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>What should we call you?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="First name"
              placeholderTextColor="white"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={saveName}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showSettings} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModalCard}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                try {
                  await signOut(auth);
                  setShowSettings(false);
                  router.replace("/login");
                } catch (error) {
                  alert(error.message);
                }
              }}
            >
              <Text style={styles.modalButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 10 }]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#023E8A",
    justifyContent: "center",
    alignItems: "center",
  },

  gearPlaceholder: {
    position: "absolute",
    top: 40,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#90E0EF",
  },

  welcomeBox: {
    backgroundColor: "#CAF0F8",
    borderRadius: 25,
    paddingVertical: 25,
    paddingHorizontal: 25,
    alignItems: "center",
    width: 300,
    height: 200,
  },

  welcomeTitle: {
    color: "#03045E",
    fontSize: 35,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 10,
  },

  welcomeSubtitle: {
    color: "black",
    fontSize: 24,
    fontWeight: "500",
  },

  amount: {
    color: "black",
    fontSize: 24,
    fontWeight: "500",
  },

  dropletPlaceholder: {
    marginTop: 25,
    width: 240,
    height: 320,
    borderRadius: 120,
    backgroundColor: "#90E0EF",
    alignItems: "center",
    justifyContent: "center",
  },

  gearIcon: {
    position: "absolute",
    top: 25,
    right: 10,
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  dropletContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  dropTextContainer: {
    position: "absolute",
    top: "55%",
    alignItems: "center",
    justifyContent: "center",
  },

  dropGoalText: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  droplet: {
    marginTop: 20,
    width: 240,
    height: 320,
    resizeMode: "contain",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#48CAE4",
    padding: 15,
    borderRadius: 15,
  },

  settingsModalCard: {
    width: "50%",
    backgroundColor: "#48CAE4",
    padding: 15,
    borderRadius: 15,
  },

  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  modalInput: {
    borderBottomWidth: 2,
    borderBottomColor: "#023E8A",
    color: "white",
    fontSize: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: "#CAF0F8",
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },

  modalButtonText: {
    fontSize: 20,
    color: "#023E8A",
    fontWeight: "bold",
  },
});

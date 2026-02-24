import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Svg, { Path, Rect, Defs, ClipPath, G } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { signOut } from "firebase/auth";

import { auth } from "../../lib/firebase";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const NAME_STORAGE_KEY = "@droplet/display-name";

export default function HomePage() {
  const currentAmount = 40;
  const goalAmount = 80;
  const progressPercent = Math.min((currentAmount / goalAmount) * 100, 100);

  const [name, setName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangeName, setShowChangeName] = useState(false);

  const fillAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fillAnimation.setValue(0);
    Animated.timing(fillAnimation, {
      toValue: progressPercent,
      duration: 2500,
      useNativeDriver: false,
    }).start();
  }, [fillAnimation, progressPercent]);

  useEffect(() => {
    const loadSavedName = async () => {
      try {
        const savedName = await AsyncStorage.getItem(NAME_STORAGE_KEY);
        if (savedName && savedName.trim()) {
          setName(savedName.trim());
          setShowNameModal(false);
          return;
        }
      } catch (error) {
        console.log("Failed to load name", error);
      }
      setShowNameModal(true);
    };

    loadSavedName();
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
      setShowNameModal(false);
      setShowChangeName(false);
    } catch (error) {
      Alert.alert("Save failed", "Could not save your name right now.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowSettings(false);
      router.replace("/login");
    } catch (error) {
      Alert.alert("Log out failed", error.message);
    }
  };

  const greeting = `Welcome back ${name || "friend"}!`;

  const fillY = fillAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [360, 0],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.gearButton}
        onPress={() => {
          setShowSettings(true);
          setShowChangeName(false);
        }}
      >
        <Image
          source={require("../../assets/setting.png")}
          style={styles.gearIcon}
        />
      </TouchableOpacity>

      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>{greeting}</Text>
        <Text style={styles.welcomeSubtitle}>Today you drank</Text>
        <Text style={styles.amount}>{currentAmount} oz of water!</Text>
      </View>

      <View style={styles.dropletContainer}>
        <Svg width="280" height="360" viewBox="0 0 280 360">
          <Defs>
            <ClipPath id="dropletClip">
              <Path
                d="M 140,20
                   C 140,20 100,60 75,110
                   C 50,160 45,190 45,220
                   C 45,265 65,300 90,320
                   C 105,330 122,338 140,338
                   C 158,338 175,330 190,320
                   C 215,300 235,265 235,220
                   C 235,190 230,160 205,110
                   C 180,60 140,20 140,20 Z"
              />
            </ClipPath>
          </Defs>

          <G clipPath="url(#dropletClip)">
            <AnimatedRect
              x="0"
              y={fillY}
              width="280"
              height="360"
              fill="#48CAE4"
            />
          </G>

          <Path
            d="M 140,20
               C 140,20 100,60 75,110
               C 50,160 45,190 45,220
               C 45,265 65,300 90,320
               C 105,330 122,338 140,338
               C 158,338 175,330 190,320
               C 215,300 235,265 235,220
               C 235,190 230,160 205,110
               C 180,60 140,20 140,20 Z"
            stroke="#000000"
            strokeWidth="8"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.dropTextContainer}>
          <Text style={styles.dropPercentText}>
            {Math.round(progressPercent)}%
          </Text>
          <Text style={styles.dropGoalText}>Goal: {goalAmount} oz</Text>
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
              style={[styles.modalButton, { marginBottom: 10 }]}
              onPress={() => setShowChangeName((prev) => !prev)}
            >
              <Text style={styles.modalButtonText}>Edit Name</Text>
            </TouchableOpacity>

            {showChangeName && (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="New display name"
                  placeholderTextColor="white"
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity
                  style={[styles.modalButton, { marginBottom: 10 }]}
                  onPress={saveName}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
              <Text style={styles.modalButtonText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 10 }]}
              onPress={() => {
                setShowSettings(false);
                setShowChangeName(false);
              }}
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
  gearButton: {
    position: "absolute",
    top: 25,
    right: 10,
    width: 50,
    height: 50,
    zIndex: 20,
  },
  gearIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
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
  dropletContainer: {
    position: "relative",
    marginTop: 20,
    width: 280,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  dropTextContainer: {
    position: "absolute",
    top: "50%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  dropPercentText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dropGoalText: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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

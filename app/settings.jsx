import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useBLEContext } from "../lib/BLEContext";
//import * as Battery from "expo-battery";

// let Battery = null;
// try {
//   Battery = require("expo-battery");
// } catch {
//   Battery = null;
// }

const NAME_STORAGE_KEY = "@droplet/display-name";
const GOAL_STORAGE_KEY = "@droplet/daily-goal";
const GOAL_UNIT_STORAGE_KEY = "@droplet/daily-goal-unit";
const BOTTLE_NAME_STORAGE_KEY = "@droplet/bottle-name";

export default function SettingsPage() {
  const { 
    water, 
    connectedDevice, 
    connectedDeviceRef ,
    allDevices, 
    color, 
    currWt,
    battery,
    tare,
    scanForPeripherals,
    connectToDevice 
  } = useBLEContext();

  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [goal, setGoal] = useState("80");
  const [goalUnit, setGoalUnit] = useState("oz");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [bottleName, setBottleName] = useState("");
  const [showBottleNameInput, setShowBottleNameInput] = useState(false);
  
  // Battery states
  const [batteryLevel, setBatteryLevel] = useState(null);
  // const [batteryState, setBatteryState] = useState(null);
  // const [isCharging, setIsCharging] = useState(false);
  // const batteryModuleAvailable = !!Battery;

  const units = ["oz", "ml", "L", "gal", "cups"];

  useEffect(() => {
    loadUserData();
    
    // // Battery API only works on mobile devices, not web
    // if (Platform.OS !== 'web' && batteryModuleAvailable) {
    //   loadBatteryInfo();
      
    //   const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
    //     setBatteryLevel(batteryLevel);
    //   });

    //   const stateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
    //     setBatteryState(batteryState);
    //     setIsCharging(batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL);
    //   });

    //   return () => {
    //     subscription.remove();
    //     stateSubscription.remove();
    //   };
    // } else {
    //   // Fallback when running on web or when native battery module is unavailable.
    //   setBatteryLevel(0.85);
    //   setIsCharging(false);
    // }
  }, []);

  // const loadBatteryInfo = async () => {
  //   if (!Battery) return;

    // try {
    //   // const level = await Battery.getBatteryLevelAsync();
    //   // const state = await Battery.getBatteryStateAsync();
      
    //   // setBatteryLevel(level);
    //   // setBatteryState(state);
    //   // setIsCharging(state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL);
    // } catch (error) {
    //   console.log("Failed to load battery info", error);
    // }
  // };

  const loadUserData = async () => {
    try {
      const savedName = await AsyncStorage.getItem(NAME_STORAGE_KEY);
      const savedGoal = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      const savedGoalUnit = await AsyncStorage.getItem(GOAL_UNIT_STORAGE_KEY);
      const savedBottleName = await AsyncStorage.getItem(BOTTLE_NAME_STORAGE_KEY);
      
      if (savedName) setName(savedName);
      if (savedGoal) setGoal(savedGoal);
      if (savedGoalUnit) setGoalUnit(savedGoalUnit);
      if (savedBottleName) setBottleName(savedBottleName);
    } catch (error) {
      console.log("Failed to load user data", error);
    }
  };

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

  const saveGoal = async () => {
    const goalNumber = parseInt(goal);
    if (isNaN(goalNumber) || goalNumber <= 0) {
      Alert.alert("Invalid Goal", "Please enter a valid number greater than 0.");
      return;
    }

    try {
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, goal);
      await AsyncStorage.setItem(GOAL_UNIT_STORAGE_KEY, goalUnit);
      setShowGoalInput(false);
      Alert.alert("Success", `Daily goal updated to ${goal} ${goalUnit}!`);
    } catch (error) {
      Alert.alert("Save failed", "Could not save your goal right now.");
    }
  };

  const saveBottleName = async () => {
    const trimmedBottleName = bottleName.trim();
    if (!trimmedBottleName) {
      Alert.alert("Name required", "Please enter a bottle name.");
      return;
    }

    try {
      await AsyncStorage.setItem(BOTTLE_NAME_STORAGE_KEY, trimmedBottleName);
      setBottleName(trimmedBottleName);
      setShowBottleNameInput(false);
      Alert.alert("Success", "Bottle name updated!");
    } catch (error) {
      Alert.alert("Save failed", "Could not save bottle name right now.");
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
      "Tare Bottle",
      "Make sure your bottle is empty, then confirm to recalibrate.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            console.log("Taring bottle...");
            // TODO: Send tare command to hardware
            try {
              await tare(connectedDeviceRef.current);
              Alert.alert("Success", "Bottle recalibrated!");
            } catch (error) {
              Alert.alert("Error", "Tare failed.");
            }
          },
        },
      ]
    );
  };

  const handleSleep = () => {
    Alert.alert(
      "Sleep Mode",
      "Put the bottle device into sleep mode?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // TODO: Send sleep command to hardware
            console.log("Putting bottle to sleep...");
            Alert.alert("Success", "Bottle is now in sleep mode");
          },
        },
      ]
    );
  };

  const handlePowerOff = () => {
    Alert.alert(
      "Power Off",
      "Are you sure you want to power off the device? You'll need to physically turn it back on.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Power Off",
          style: "destructive",
          onPress: () => {
            // TODO: Send power off command to hardware
            console.log("Powering off bottle...");
            Alert.alert("Device Powered Off", "Turn on the physical device to reconnect.");
          },
        },
      ]
    );
  };

  const getBatteryIcon = () => {
    if (battery === null) return "🔋";
    
    //if (isCharging) return "⚡";
    
    if (battery > 70) return "🔋";
    if (battery > 30) return "🔋";
    if (battery > 10) return "🪫";
    return "🪫";
  };

  const getBatteryColor = () => {
    //if (!batteryModuleAvailable) return "#999999";
    if (battery === null) return "#90E0EF";
    //if (isCharging) return "#00D084";
    if (battery > 0.3) return "#00D084";
    if (battery > 0.1) return "#FFA500";
    return "#FF0000";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        {/* Card Container */}
        <View style={styles.card}>
          
          {/* Battery Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Status</Text>
            
            <View style={styles.batteryContainer}>
              <Text style={styles.batteryIcon}>{getBatteryIcon()}</Text>
              <View style={styles.batteryInfo}>
                <Text style={styles.batteryLabel}>Water Bottle Battery</Text>
                <Text style={[styles.batteryLevel, { color: getBatteryColor() }]}>
                  {battery !== null 
                    ? `${Math.round(battery)}%` 
                    : "Checking..."}
                </Text>
                {/* {isCharging && (
                  <Text style={styles.chargingText}>Charging</Text>
                )} */}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

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
              onPress={() => setShowGoalInput(!showGoalInput)}
            >
              <Text style={styles.buttonText}>Edit Daily Goal</Text>
            </TouchableOpacity>

            {showGoalInput && (
              <View style={styles.nameInputContainer}>
                <View style={styles.goalInputRow}>
                  <TextInput
                    style={[styles.nameInput, styles.goalNumberInput]}
                    placeholder="Enter goal"
                    placeholderTextColor="#999"
                    value={goal}
                    onChangeText={setGoal}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.unitPicker}
                    onPress={() => setShowUnitPicker(!showUnitPicker)}
                  >
                    <Text style={styles.unitPickerText}>{goalUnit}</Text>
                    <Text style={styles.unitPickerArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
                
                {showUnitPicker && (
                  <View style={styles.unitDropdown}>
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitOption,
                          goalUnit === unit && styles.unitOptionSelected,
                        ]}
                        onPress={() => {
                          setGoalUnit(unit);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text style={styles.unitOptionText}>{unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={saveGoal}>
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

          <View style={styles.divider} />

          {/* Bottle Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bottle Settings</Text>

            <TouchableOpacity
              style={styles.settingButton}
              onPress={() =>
                router.push({
                  pathname: "/onboarding",
                  params: { reconnect: "1" },
                })
              }
            >
              <Text style={styles.buttonText}>Connect Bluetooth Device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => setShowBottleNameInput(!showBottleNameInput)}
            >
              <Text style={styles.buttonText}>Edit Bottle Name</Text>
            </TouchableOpacity>

            {showBottleNameInput && (
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter bottle name"
                  placeholderTextColor="#999"
                  value={bottleName}
                  onChangeText={setBottleName}
                />
                <TouchableOpacity style={styles.saveButton} onPress={saveBottleName}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#023E8A",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  backButtonText: {
    color: "#CAF0F8",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#CAF0F8",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#CAF0F8",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003B8E",
    marginBottom: 16,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  batteryIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  batteryInfo: {
    flex: 1,
  },
  batteryLabel: {
    fontSize: 16,
    color: "#003B8E",
    fontWeight: "600",
    marginBottom: 4,
  },
  batteryLevel: {
    fontSize: 28,
    fontWeight: "bold",
  },
  chargingText: {
    fontSize: 14,
    color: "#00D084",
    fontWeight: "600",
    marginTop: 4,
  },
  divider: {
    height: 2,
    backgroundColor: "#6FE3F0",
    marginVertical: 20,
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
  nameInputContainer: {
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  saveButton: {
    backgroundColor: "#003B8E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  goalInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  goalNumberInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitPicker: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "#6FE3F0",
    width: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitPickerText: {
    fontSize: 16,
    color: "#003B8E",
    fontWeight: "bold",
  },
  unitPickerArrow: {
    fontSize: 12,
    color: "#003B8E",
  },
  unitDropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6FE3F0",
    marginBottom: 10,
    overflow: "hidden",
  },
  unitOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  unitOptionSelected: {
    backgroundColor: "#00B4D8",
  },
  unitOptionText: {
    fontSize: 16,
    color: "#003B8E",
    fontWeight: "600",
    textAlign: "center",
  },
});
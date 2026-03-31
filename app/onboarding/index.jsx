import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useBLEContext } from "../../lib/BLEContext";

const ONBOARDING_COMPLETE_KEY = "@droplet/onboarding-complete";
const NAME_STORAGE_KEY = "@droplet/display-name";
const GOAL_STORAGE_KEY = "@droplet/daily-goal";
const GOAL_UNIT_STORAGE_KEY = "@droplet/daily-goal-unit";
const BOTTLE_NAME_STORAGE_KEY = "@droplet/bottle-name";

export default function OnboardingFlow() {
  const { reconnect } = useLocalSearchParams();
  const isReconnectFlow = reconnect === "1";

  const [step, setStep] = useState(isReconnectFlow ? 2 : 1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [goalUnit, setGoalUnit] = useState("oz");
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [bottleName, setBottleName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasTared, setHasTared] = useState(false);
  const [showTareWarning, setShowTareWarning] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    tare,
    connectToDevice,
    connectedDevice,
  } = useBLEContext();

  const units = ["oz", "ml", "L", "gal", "cups"];

  useEffect(() => {
    const loadOnboardingState = async () => {
      const onboardingComplete = await AsyncStorage.getItem(
        ONBOARDING_COMPLETE_KEY,
      );
      const hasCompletedOnboarding = !!onboardingComplete;
      setIsOnboardingComplete(hasCompletedOnboarding);

      if (isReconnectFlow && hasCompletedOnboarding) {
        setStep(2);
      }
    };

    loadOnboardingState();
  }, [isReconnectFlow]);

  useEffect(() => {
    if (connectedDevice) {
      setScanComplete(true);
      setIsScanning(false);
    }
  }, [connectedDevice]);

  const handleScan = async () => {
    const isPermissionsEnabled = await requestPermissions();

    if (!isPermissionsEnabled) {
      Alert.alert(
        "Bluetooth Permission Needed",
        "Please allow Bluetooth permissions to scan for your water bottle.",
      );
      return;
    }

    setIsScanning(true);
    setScanComplete(false);
    scanForPeripherals();

    setTimeout(() => {
      setIsScanning(false);
    }, 8000);
  };

  const handleConnectDevice = async (device) => {
    const deviceConnection = await connectToDevice(device);

    if (!deviceConnection) {
      Alert.alert(
        "Connection Failed",
        "Could not connect to that device. Please try again.",
      );
    }
  };

  const handleTare = () => {
    if (!hasTared) {
      // First time tare - show warning modal
      setShowTareWarning(true);
    } else {
      // Already tared once - can re-tare without warning
      console.log("Re-taring water bottle...");
      // Show success (using alert for now since it's not critical)
      alert("Success! Water bottle re-calibrated!");
    }
  };

  const confirmTare = async () => {
    // TODO: Send tare command to hardware
    setShowTareWarning(false);
    try {
        console.log("Taring water bottle...");
        await tare(connectedDevice);
        setHasTared(true);
        alert("Success! Water bottle calibrated!");
    } catch (error) {
        alert("Tare Failed", "Could not calibrate the bottle. Please try again.");
    }
  };

  const handleFinishSetup = async () => {
    if (!hasTared) {
      Alert.alert("Not Complete", "Please tare your water bottle first!");
      return;
    }

    try {
      // Save all data
      await AsyncStorage.setItem(NAME_STORAGE_KEY, name);
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, goal);
      await AsyncStorage.setItem(GOAL_UNIT_STORAGE_KEY, goalUnit);
      await AsyncStorage.setItem(BOTTLE_NAME_STORAGE_KEY, bottleName);
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");

      setShowWelcome(true);
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    }
  };

  const canProceedStep1 = name.trim() && goal.trim() && parseInt(goal) > 0;
  const canProceedStep2 = isReconnectFlow
    ? !!connectedDevice
    : !!connectedDevice && bottleName.trim();

  // Step 1: Name and Goal
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Ok, let's get you started!</Text>
          <Text style={styles.subtitle}>First, tell us a bit about yourself</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>What's your daily water goal?</Text>
            <View style={styles.goalRow}>
              <TextInput
                style={[styles.input, styles.goalInput]}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                value={goal}
                onChangeText={setGoal}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() => setShowUnitPicker(!showUnitPicker)}
              >
                <Text style={styles.unitButtonText}>{goalUnit}</Text>
                <Text style={styles.unitArrow}>▼</Text>
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
          </View>
        </View>

        <View style={styles.singleNavigationRow}>
          <TouchableOpacity
            style={[styles.nextButton, !canProceedStep1 && styles.nextButtonDisabled]}
            onPress={() => canProceedStep1 && setStep(2)}
            disabled={!canProceedStep1}
          >
            <Text style={styles.nextButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Bluetooth Setup
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <FlatList
            data={allDevices.length > 0 ? allDevices : []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.content}>
                <Text style={styles.welcomeText}>Connect Your Water Bottle</Text>
                <Text style={styles.subtitle}>Let's find your smart water bottle</Text>

                <View style={styles.instructionSection}>
                  <Text style={styles.instruction}>
                    1. Please make sure your Bluetooth is on
                  </Text>
                  <Text style={styles.instruction}>
                    2. Scan and select your water bottle below
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                  onPress={handleScan}
                  disabled={isScanning}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? "Scanning..." : "Scan for Water Bottle"}
                  </Text>
                </TouchableOpacity>

                {isScanning && <ActivityIndicator style={styles.scanLoader} color="#CAF0F8" size="small" />}

                <View style={styles.deviceListSection}>
                  <Text style={styles.noDevicesText}>No devices found yet. Try scanning again.</Text>
                </View>
              </View>
            }
            ListHeaderComponent={
              allDevices.length > 0 ? (
                <View style={styles.content}>
                  <Text style={styles.welcomeText}>Connect Your Water Bottle</Text>
                  <Text style={styles.subtitle}>Let's find your smart water bottle</Text>

                  <View style={styles.instructionSection}>
                    <Text style={styles.instruction}>
                      1. Please make sure your Bluetooth is on
                    </Text>
                    <Text style={styles.instruction}>
                      2. Scan and select your water bottle below
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                    onPress={handleScan}
                    disabled={isScanning}
                  >
                    <Text style={styles.scanButtonText}>
                      {isScanning ? "Scanning..." : "Scan for Water Bottle"}
                    </Text>
                  </TouchableOpacity>

                  {isScanning && <ActivityIndicator style={styles.scanLoader} color="#CAF0F8" size="small" />}

                  <Text style={styles.deviceListLabel}>Available Devices:</Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              <View>
                {scanComplete && (
                  <View style={styles.scanCompleteSection}>
                    <Text style={styles.scanCompleteText}>✓ Device Connected</Text>

                    {!isReconnectFlow && (
                      <>
                        <Text style={styles.label}>Name your water bottle</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g., My Droplet"
                          placeholderTextColor="#999"
                          value={bottleName}
                          onChangeText={setBottleName}
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                        />
                      </>
                    )}
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => {
              const deviceName = item.name || item.localName || "Unknown Device";
              const isConnected = connectedDevice?.id === item.id;

              return (
                <TouchableOpacity
                  style={[styles.deviceItem, isConnected && styles.deviceItemConnected]}
                  onPress={() => handleConnectDevice(item)}
                >
                  <Text style={styles.deviceItemName}>{deviceName}</Text>
                  <Text style={styles.deviceItemAction}>{isConnected ? "Connected" : "Connect"}</Text>
                </TouchableOpacity>
              );
            }}
          />

        </KeyboardAvoidingView>
        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Keyboard.dismiss();
              if (isReconnectFlow || isOnboardingComplete) {
                router.back();
                return;
              }

              setStep(1);
            }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceedStep2 && styles.nextButtonDisabled,
            ]}
            onPress={() => {
              Keyboard.dismiss();
              if (!canProceedStep2) return;

              if (isReconnectFlow || isOnboardingComplete) {
                router.back();
                return;
              }

              setStep(3);
            }}
            disabled={!canProceedStep2}
          >
            <Text style={styles.nextButtonText}>
              {isReconnectFlow || isOnboardingComplete ? "✓" : "→"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 3: Tare Setup
  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Final Step: Calibration</Text>
          <Text style={styles.subtitle}>Let's calibrate your water bottle</Text>

          <View style={styles.instructionSection}>
            <Text style={styles.instruction}>1. Empty your water bottle completely</Text>
            <Text style={styles.instruction}>2. Attach the device to your water bottle</Text>
            <Text style={styles.instruction}>
              3. Press "Tare" to calibrate the weight
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.tareButton, hasTared && styles.tareButtonComplete]}
            onPress={handleTare}
          >
            <Text style={styles.tareButtonText}>
              {hasTared ? "✓ Calibrated" : "Tare Water Bottle"}
            </Text>
          </TouchableOpacity>

          {hasTared && (
            <Text style={styles.successNote}>
              Great! Your bottle is calibrated and ready to use.
            </Text>
          )}
        </View>

        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.finishButton, !hasTared && styles.finishButtonDisabled]}
            onPress={handleFinishSetup}
            disabled={!hasTared}
          >
            <Text style={styles.finishButtonText}>Finish Setup</Text>
          </TouchableOpacity>
        </View>

        {/* Tare Warning Modal */}
        <Modal visible={showTareWarning} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.warningModal}>
              <Text style={styles.warningModalTitle}>Important!</Text>
              <Text style={styles.warningModalText}>
                Did you empty your water bottle?
              </Text>
              <Text style={styles.warningModalSubtext}>
                The bottle must be completely empty for accurate calibration.
              </Text>
              
              <View style={styles.warningButtonRow}>
                <TouchableOpacity
                  style={styles.warningButtonCancel}
                  onPress={() => setShowTareWarning(false)}
                >
                  <Text style={styles.warningButtonCancelText}>No, go back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.warningButtonConfirm}
                  onPress={confirmTare}
                >
                  <Text style={styles.warningButtonConfirmText}>Yes, it's empty</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Welcome Modal */}
        <Modal visible={showWelcome} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.welcomeModal}>
              <Text style={styles.welcomeModalTitle}>Welcome, {name}! 🎉</Text>
              <Text style={styles.welcomeModalText}>
                You're all set! Your water bottle is ready to track your hydration.
              </Text>
              <Text style={styles.welcomeModalSubtext}>
                You can edit any settings anytime from the settings page.
              </Text>
              <TouchableOpacity
                style={styles.welcomeModalButton}
                onPress={() => {
                  setShowWelcome(false);
                  router.replace("/tabs/homepage");
                }}
              >
                <Text style={styles.welcomeModalButtonText}>Let's Go!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#023E8A",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#CAF0F8",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#90E0EF",
    marginBottom: 40,
  },
  inputSection: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: "#CAF0F8",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#023E8A",
    borderWidth: 2,
    borderColor: "#48CAE4",
  },
  goalRow: {
    flexDirection: "row",
    gap: 12,
  },
  goalInput: {
    flex: 1,
  },
  unitButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#48CAE4",
    width: 90,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitButtonText: {
    fontSize: 16,
    color: "#023E8A",
    fontWeight: "bold",
  },
  unitArrow: {
    fontSize: 12,
    color: "#023E8A",
  },
  unitDropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#48CAE4",
    overflow: "hidden",
  },
  unitOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  unitOptionSelected: {
    backgroundColor: "#90E0EF",
  },
  unitOptionText: {
    fontSize: 16,
    color: "#023E8A",
    fontWeight: "600",
    textAlign: "center",
  },
  instructionSection: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  instruction: {
    fontSize: 18,
    color: "#CAF0F8",
    marginBottom: 12,
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  scanButton: {
    backgroundColor: "#48CAE4",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  scanButtonDisabled: {
    backgroundColor: "#90E0EF",
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#023E8A",
  },
  scanLoader: {
    marginTop: 14,
  },
  deviceListSection: {
    marginTop: 16,
    maxHeight: 220,
  },
  noDevicesText: {
    color: "#CAF0F8",
    textAlign: "center",
    fontSize: 14,
  },
  deviceListContainer: {
    gap: 10,
  },
  deviceItem: {
    backgroundColor: "#CAF0F8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#48CAE4",
  },
  deviceItemConnected: {
    borderColor: "#00D084",
  },
  deviceItemName: {
    color: "#023E8A",
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    marginRight: 10,
  },
  deviceItemAction: {
    color: "#0077B6",
    fontWeight: "700",
    fontSize: 14,
  },
  scanCompleteSection: {
    marginTop: 30,
    alignItems: "center",
  },
  scanCompleteText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00FF00",
    marginBottom: 20,
    textAlign: "center",
  },
  tareButton: {
    backgroundColor: "#48CAE4",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 3,
    borderColor: "#00B4D8",
  },
  tareButtonComplete: {
    backgroundColor: "#00D084",
    borderColor: "#00A86B",
  },
  tareButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#023E8A",
  },
  successNote: {
    fontSize: 16,
    color: "#90E0EF",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  singleNavigationRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: "#48CAE4",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#90E0EF",
    opacity: 0.4,
  },
  nextButtonText: {
    fontSize: 32,
    color: "#023E8A",
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#48CAE4",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 32,
    color: "#023E8A",
    fontWeight: "bold",
  },
  finishButton: {
    backgroundColor: "#48CAE4",
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButtonDisabled: {
    backgroundColor: "#90E0EF",
    opacity: 0.4,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#023E8A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  warningModal: {
    backgroundColor: "#CAF0F8",
    borderRadius: 20,
    padding: 30,
    width: "85%",
    alignItems: "center",
  },
  warningModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#023E8A",
    marginBottom: 16,
    textAlign: "center",
  },
  warningModalText: {
    fontSize: 18,
    color: "#023E8A",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  warningModalSubtext: {
    fontSize: 14,
    color: "#0077B6",
    textAlign: "center",
    marginBottom: 24,
  },
  warningButtonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  warningButtonCancel: {
    flex: 1,
    backgroundColor: "#90E0EF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  warningButtonCancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#023E8A",
  },
  warningButtonConfirm: {
    flex: 1,
    backgroundColor: "#023E8A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  warningButtonConfirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#CAF0F8",
  },
  welcomeModal: {
    backgroundColor: "#CAF0F8",
    borderRadius: 20,
    padding: 30,
    width: "85%",
    alignItems: "center",
  },
  welcomeModalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#023E8A",
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeModalText: {
    fontSize: 16,
    color: "#023E8A",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  welcomeModalSubtext: {
    fontSize: 14,
    color: "#0077B6",
    textAlign: "center",
    marginBottom: 24,
  },
  welcomeModalButton: {
    backgroundColor: "#023E8A",
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  welcomeModalButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#CAF0F8",
  },
});
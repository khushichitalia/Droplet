import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AddFountainModal({
  visible,
  onClose,
  onAdd,
  initialRegion,
}) {
  const [name, setName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a name for the fountain.");
      return;
    }
    if (!selectedLocation) {
      Alert.alert(
        "Missing Location",
        "Please tap on the map to select a location.",
      );
      return;
    }

    try {
      await onAdd({
        name: name.trim(),
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      setName("");
      setSelectedLocation(null);
      onClose();
    } catch (err) {
      Alert.alert("Error", "Failed to add fountain. Please try again.");
    }
  };

  const handleCancel = () => {
    setName("");
    setSelectedLocation(null);
    onClose();
  };

  let keyboardBehavior;
  if (Platform.OS === "ios") {
    keyboardBehavior = "padding";
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={keyboardBehavior}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New Fountain</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            1. Tap on the map to select the fountain location
          </Text>
          <Text style={styles.instructionText}>
            2. Enter the fountain name below
          </Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={40}
                  color="#023E8A"
                />
              </Marker>
            )}
          </MapView>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fountain Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Library Water Fountain"
            placeholderTextColor="#635f5f"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Add Fountain</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

let headerPaddingTop = 16;
if (Platform.OS === "ios") {
  headerPaddingTop = 60;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    paddingTop: headerPaddingTop,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: headerPaddingTop,
  },
  instructions: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#023E8A",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

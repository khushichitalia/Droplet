import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getFountains, createFountain } from "../../lib/api";
import ReviewBottomSheet from "../components/ReviewBottomSheet";
import AddFountainModal from "../components/AddFountainModal";

export default function Map() {
  const [fountains, setFountains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const loadFountains = useCallback(async () => {
    try {
      const data = await getFountains();
      setFountains(data);
    } catch (err) {
      console.error("Failed to load fountains:", err);
    }
  }, []);

  useEffect(() => {
    loadFountains();
  }, [loadFountains]);

  const handleMarkerPress = (fountain) => {
    setSelected(fountain);
    setSheetVisible(true);
  };

  const handleRatingUpdated = (fountainId, avgRating, reviewCount) => {
    setFountains((prev) =>
      prev.map((f) => {
        if (f._id === fountainId) {
          return { ...f, avgRating, reviewCount };
        }
        return f;
      }),
    );
    setSelected((prev) => {
      if (prev && prev._id === fountainId) {
        return { ...prev, avgRating, reviewCount };
      }
      return prev;
    });
  };

  const handleAddFountain = async (fountainData) => {
    const newFountain = await createFountain(fountainData);
    setFountains((prev) => [...prev, newFountain]);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let name;
      if (rating >= i) {
        name = "star";
      } else if (rating >= i - 0.5) {
        name = "star-half-full";
      } else {
        name = "star-outline";
      }
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={name}
          size={12}
          color="#FFB800"
        />,
      );
    }
    return stars;
  };

  const initialRegion = {
    latitude: 29.647,
    longitude: -82.3453,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {fountains.map((f) => {
          const rating = f.avgRating || 0;
          return (
            <Marker
              key={f._id}
              coordinate={{ latitude: f.latitude, longitude: f.longitude }}
              onPress={() => handleMarkerPress(f)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.bubble}>
                  <Text style={styles.label}>{f.name}</Text>
                  <View style={styles.starsRow}>{renderStars(rating)}</View>
                </View>
                <View style={styles.pointer} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>

      <ReviewBottomSheet
        fountain={selected}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onRatingUpdated={handleRatingUpdated}
      />

      <AddFountainModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddFountain}
        initialRegion={initialRegion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerContainer: {
    alignItems: "center",
  },
  bubble: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderColor: "black",
    borderWidth: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  pointer: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
    marginTop: -1,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#023E8A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

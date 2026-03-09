import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getFountains } from "../../lib/api";
import ReviewBottomSheet from "../components/ReviewBottomSheet";

export default function Map() {
  const [fountains, setFountains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 29.647,
          longitude: -82.3453,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {fountains.map((f) => (
          <Marker
            key={f._id}
            coordinate={{ latitude: f.latitude, longitude: f.longitude }}
            onPress={() => handleMarkerPress(f)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.bubble}>
                <Text style={styles.label}>{f.name}</Text>
                <View style={styles.starsRow}>
                  {renderStars(f.avgRating || 0)}
                </View>
              </View>
              <View style={styles.pointer} />
            </View>
          </Marker>
        ))}
      </MapView>

      <ReviewBottomSheet
        fountain={selected}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onRatingUpdated={handleRatingUpdated}
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
});

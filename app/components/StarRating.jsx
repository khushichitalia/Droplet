import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StarRating({
  rating = 0, // current rating value (0–5, supports halves for display)
  size = 24, // icon size, default 24
  color = "#FFB800",
  interactive = false, // when true, stars are tappable
  onRate, // called with (value) when a star is tapped
}) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    let iconName;
    if (rating >= i) {
      iconName = "star";
    } else if (rating >= i - 0.5) {
      iconName = "star-half-full";
    } else {
      iconName = "star-outline";
    }

    const starElement = (
      <MaterialCommunityIcons
        key={i}
        name={iconName}
        size={size}
        color={color}
      />
    );

    if (interactive) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onRate?.(i)}
          activeOpacity={0.6}
        >
          {starElement.props ? (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          ) : (
            starElement
          )}
        </TouchableOpacity>,
      );
    } else {
      stars.push(starElement);
    }
  }

  return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});

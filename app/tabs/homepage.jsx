import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/setting.png")}
        style={styles.gearIcon}
      />

      {/* Welcome Box */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>Welcome back ____!</Text>
        <Text style={styles.welcomeSubtitle}>Today you drank</Text>
        <Text style={styles.amount}>______ oz of water!</Text>
      </View>

      {/* Water Drop with Centered Text */}
      <View style={styles.dropletContainer}>
        <Image
          source={require("../../assets/waterdrop.png")}
          style={styles.droplet}
        />
        <View style={styles.dropTextContainer}>
          <Text style={styles.dropGoalText}>Goal: ____ oz</Text>
        </View>
      </View>
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
    top: 40,
    right: 30,
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
});

import { StyleSheet, Text, View } from "react-native";

export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 120,
  },
  text: {
    fontSize: 20,
  },
});

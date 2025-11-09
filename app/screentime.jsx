import { StyleSheet, Text, View } from "react-native";

export default function Screentime() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Screentime</Text>
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

import { View, Text, StyleSheet } from 'react-native';

export default function Main() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Droplet 💧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 26,
  },
});

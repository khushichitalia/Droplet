import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BLEProvider } from "../lib/BLEContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <BLEProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BLEProvider>
    </SafeAreaProvider>
  );
}

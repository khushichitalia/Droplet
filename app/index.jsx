import { Redirect } from "expo-router";
import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../lib/firebase";

const ONBOARDING_COMPLETE_KEY = "@droplet/onboarding-complete";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check if user is logged in
      const user = auth.currentUser;
      
      if (!user) {
        // Not logged in, redirect to login
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check if onboarding is complete
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      
      if (!onboardingComplete) {
        // User is logged in but hasn't completed onboarding
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.log("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#48CAE4" />
      </View>
    );
  }

  // Not authenticated - go to login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Authenticated but needs onboarding
  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Authenticated and onboarding complete - go to homepage
  return <Redirect href="/tabs/homepage" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#023E8A",
    alignItems: "center",
    justifyContent: "center",
  },
});
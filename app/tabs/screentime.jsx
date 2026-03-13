import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_APPS_KEY = "@droplet/selected-lockscreen-apps";

// Sample function - Replace with real backend API call later
const getInstalledApps = () => {
  // Replace with actual Screen Time API data
  return [
    { id: "instagram", name: "Instagram", icon: require("../../assets/instagram.png"), category: "Social Media" },
    { id: "tiktok", name: "TikTok", icon: require("../../assets/tiktok.png"), category: "Entertainment" },
    { id: "snapchat", name: "Snapchat", icon: require("../../assets/snapchat.png"), category: "Social Media" },
    { id: "messages", name: "Messages", icon: require("../../assets/messages.png"), category: "Communication" },
    // Add more apps as needed - backend
  ];
};

export default function ScreenTime() {
  const [selectedApps, setSelectedApps] = useState([]);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showTimeLimit, setShowTimeLimit] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const availableApps = getInstalledApps();
  const categories = ["All", "Social Media", "Entertainment", "Communication", "Games", "Productivity"];

  // Generate hours (0-23) and minutes (0-59)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    loadSelectedApps();
  }, []);

  const loadSelectedApps = async () => {
    try {
      const saved = await AsyncStorage.getItem(SELECTED_APPS_KEY);
      if (saved) {
        setSelectedApps(JSON.parse(saved));
      }
    } catch (error) {
      console.log("Failed to load selected apps", error);
    }
  };

  const saveSelectedApps = async (apps) => {
    try {
      await AsyncStorage.setItem(SELECTED_APPS_KEY, JSON.stringify(apps));
      setSelectedApps(apps);
    } catch (error) {
      console.log("Failed to save selected apps", error);
    }
  };

  const addApp = (app) => {
    if (!selectedApps.find(a => a.id === app.id)) {
      const updated = [...selectedApps, app];
      saveSelectedApps(updated);
    }
    setShowAppSelector(false);
  };

  const removeApp = (appId) => {
    const updated = selectedApps.filter(a => a.id !== appId);
    saveSelectedApps(updated);
  };

  const handleAppPress = (app) => {
    setSelectedApp(app.name);
    setShowTimeLimit(true);
  };

  const handleSet = () => {
    const totalSeconds = selectedHour * 3600 + selectedMinute * 60;
    console.log(`Set ${selectedHour}h ${selectedMinute}m limit for ${selectedApp}`);
    setTimeRemaining(totalSeconds);
    setShowCountdown(true);
    setShowTimeLimit(false);
  };

  const handleBack = () => {
    setShowTimeLimit(false);
    setSelectedApp(null);
  };

  // Countdown timer effect
  useEffect(() => {
    if (showCountdown && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setShowCountdown(false);
            setSelectedApp(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showCountdown, timeRemaining]);

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes, seconds: secs };
  };

  // Filter apps based on search and category
  const filteredApps = availableApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    const notAlreadySelected = !selectedApps.find(a => a.id === app.id);
    return matchesSearch && matchesCategory && notAlreadySelected;
  });

  // Countdown Screen
  if (showCountdown) {
    const totalSeconds = selectedHour * 3600 + selectedMinute * 60;
    const progress = timeRemaining / totalSeconds;
    const { hours, minutes, seconds } = formatTime(timeRemaining);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{selectedApp}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Time Remaining</Text>

            <View style={styles.circleContainer}>
              <CircularProgress
                size={250}
                strokeWidth={20}
                progress={progress}
                color="#003B8E"
                bgColor="#6FE3F0"
              />
              <View style={styles.timeTextContainer}>
                <Text style={styles.timeText}>
                  {hours > 0 && `${hours}h `}
                  {minutes}m {seconds}s
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCountdown(false);
                setSelectedApp(null);
                setTimeRemaining(0);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel Limit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Time Limit Screen
  if (showTimeLimit) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{selectedApp}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.timeHeader}>
            <Text style={styles.headerText}>Time</Text>
            <TouchableOpacity onPress={handleSet}>
              <Text style={styles.setButton}>Set</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{selectedHour} hours</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pickerContent}
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    onPress={() => setSelectedHour(hour)}
                    style={styles.pickerItem}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedHour === hour && styles.pickerTextSelected,
                      ]}
                    >
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{selectedMinute} min</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pickerContent}
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    onPress={() => setSelectedMinute(minute)}
                    style={styles.pickerItem}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedMinute === minute && styles.pickerTextSelected,
                      ]}
                    >
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main Screen - App List or Empty State
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBox}>
        <Text style={styles.titleText}>Screen Time Limits</Text>
      </View>

      <View style={styles.card}>
        {selectedApps.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No apps added yet</Text>
            <Text style={styles.emptySubtext}>
              Add apps to set time limits and stay focused
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAppSelector(true)}
            >
              <Text style={styles.addButtonText}>+ Add Apps to Lock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // App List
          <ScrollView>
            {selectedApps.map((app) => (
              <View key={app.id} style={styles.row}>
                <Image source={app.icon} style={styles.icon} />
                <Text style={styles.appText}>{app.name}</Text>
                
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.setLimitButton}
                    onPress={() => handleAppPress(app)}
                  >
                    <Text style={styles.setLimitButtonText}>Set Limit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeApp(app.id)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => setShowAppSelector(true)}
            >
              <Text style={styles.addMoreButtonText}>+ Add More Apps</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* App Selector Modal */}
      <Modal visible={showAppSelector} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Apps</Text>
            <TouchableOpacity onPress={() => setShowAppSelector(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search apps..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* App List */}
          <ScrollView style={styles.appList}>
            {filteredApps.length === 0 ? (
              <Text style={styles.noAppsText}>
                {searchQuery ? "No apps found" : "All apps already added"}
              </Text>
            ) : (
              filteredApps.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appSelectorRow}
                  onPress={() => addApp(app)}
                >
                  <Image source={app.icon} style={styles.appSelectorIcon} />
                  <View style={styles.appSelectorInfo}>
                    <Text style={styles.appSelectorName}>{app.name}</Text>
                    <Text style={styles.appSelectorCategory}>{app.category}</Text>
                  </View>
                  <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Circular Progress Component
function CircularProgress({ size, strokeWidth, progress, color, bgColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference * (1 - Math.max(0, Math.min(progress, 1)));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          stroke={bgColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003B8E",
    padding: 16,
  },
  titleBox: {
    backgroundColor: "#D6F5FA",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#6FE3F0",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003B8E",
  },
  card: {
    backgroundColor: "#D6F5FA",
    borderRadius: 20,
    padding: 20,
    flex: 1,
    borderWidth: 3,
    borderColor: "#6FE3F0",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003B8E",
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#0077B6",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: "#003B8E",
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#6FE3F0",
  },
  addButtonText: {
    color: "#CAF0F8",
    fontSize: 20,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#6FAED9",
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 12,
    resizeMode: "contain",
  },
  appText: {
    fontSize: 18,
    color: "#000",
    flex: 1,
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  setLimitButton: {
    backgroundColor: "#003B8E",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setLimitButtonText: {
    color: "#CAF0F8",
    fontSize: 14,
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#B00020",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  addMoreButton: {
    backgroundColor: "#003B8E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  addMoreButtonText: {
    color: "#CAF0F8",
    fontSize: 16,
    fontWeight: "bold",
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#6FAED9",
    marginBottom: 20,
  },
  headerText: {
    color: "#003B8E",
    fontSize: 20,
    fontWeight: "bold",
  },
  setButton: {
    color: "#003B8E",
    fontSize: 20,
    fontWeight: "bold",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    flex: 1,
    paddingTop: 20,
  },
  pickerColumn: {
    alignItems: "center",
    flex: 1,
  },
  pickerLabel: {
    color: "#003B8E",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  pickerItem: {
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  pickerText: {
    color: "#A8D5E2",
    fontSize: 24,
    fontWeight: "600",
  },
  pickerTextSelected: {
    color: "#003B8E",
    fontSize: 28,
    fontWeight: "bold",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#D6F5FA",
    fontSize: 18,
    fontWeight: "bold",
  },
  countdownContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  countdownLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003B8E",
    marginBottom: 40,
  },
  circleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  timeTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#003B8E",
  },
  cancelButton: {
    backgroundColor: "#003B8E",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  cancelButtonText: {
    color: "#D6F5FA",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#023E8A",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#6FE3F0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#CAF0F8",
  },
  modalClose: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6FE3F0",
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: "#CAF0F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#003B8E",
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: "#CAF0F8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  categoryChipSelected: {
    backgroundColor: "#003B8E",
  },
  categoryChipText: {
    color: "#003B8E",
    fontWeight: "600",
  },
  categoryChipTextSelected: {
    color: "#CAF0F8",
  },
  appList: {
    flex: 1,
    padding: 16,
  },
  noAppsText: {
    textAlign: "center",
    color: "#CAF0F8",
    fontSize: 16,
    marginTop: 40,
  },
  appSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CAF0F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#6FE3F0",
  },
  appSelectorIcon: {
    width: 48,
    height: 48,
    marginRight: 16,
    resizeMode: "contain",
  },
  appSelectorInfo: {
    flex: 1,
  },
  appSelectorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003B8E",
  },
  appSelectorCategory: {
    fontSize: 14,
    color: "#0077B6",
    marginTop: 2,
  },
  addIcon: {
    fontSize: 32,
    color: "#003B8E",
    fontWeight: "bold",
  },
});
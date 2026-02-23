import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import Svg, { Circle } from "react-native-svg";

export default function ScreenTime() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [showTimeLimit, setShowTimeLimit] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const apps = [
    { name: "Instagram", icon: require("../../assets/instagram.png") },
    { name: "TikTok", icon: require("../../assets/tiktok.png") },
    { name: "Snapchat", icon: require("../../assets/snapchat.png") },
    { name: "Messages", icon: require("../../assets/messages.png") },
  ];

  // Generate hours (0-23) and minutes (0-59)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleAppPress = (appName) => {
    setSelectedApp(appName);
    setShowTimeLimit(true);
  };

  const handleSet = () => {
    const totalSeconds = (selectedHour * 3600) + (selectedMinute * 60);
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
        setTimeRemaining(prev => {
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

  // Countdown Screen
  if (showCountdown) {
    const totalSeconds = (selectedHour * 3600) + (selectedMinute * 60);
    const progress = timeRemaining / totalSeconds;
    const { hours, minutes, seconds } = formatTime(timeRemaining);
    
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  // Time Limit Screen
  if (showTimeLimit) {
    return (
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{selectedApp}</Text>
        </View>

        {/* Time Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.timeHeader}>
            <Text style={styles.headerText}>Time</Text>
            <TouchableOpacity onPress={handleSet}>
              <Text style={styles.setButton}>Set</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hours Picker */}
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

            {/* Minutes Picker */}
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
      </View>
    );
  }

  // App Selection Screen (default)
  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleBox}>
        <Text style={styles.titleText}>Add Limit</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {apps.map((app, index) => (
          <TouchableOpacity
            key={index}
            style={styles.row}
            onPress={() => handleAppPress(app.name)}
          >
            <View
              style={[
                styles.radio,
                selectedApp === app.name && styles.radioSelected,
              ]}
            />

            <Image source={app.icon} style={styles.icon} />
            <Text style={styles.appText}>{app.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Circular Progress Component
function CircularProgress({ size, strokeWidth, progress, color, bgColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(progress, 1)));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
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
    fontSize: 32,
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#6FAED9",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#003B8E",
    marginRight: 14,
  },

  radioSelected: {
    backgroundColor: "#6FE3F0",
  },

  icon: {
    width: 36,
    height: 36,
    marginRight: 12,
    resizeMode: "contain",
  },

  appText: {
    fontSize: 20,
    color: "#000",
  },

  // Time Limit Screen Styles
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

  // Back Button Styles
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

  // Countdown Screen Styles
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
});
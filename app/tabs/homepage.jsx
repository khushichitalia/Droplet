// import React from "react";
// import { Image, View, Text, StyleSheet } from "react-native";

// export default function HomePage() {
//   return (
//     <View style={styles.container}>
//       <Image
//         source={require("../../assets/setting.png")}
//         style={styles.gearIcon}
//       />

//       {/* Welcome Box */}
//       <View style={styles.welcomeBox}>
//         <Text style={styles.welcomeTitle}>Welcome back ____!</Text>
//         <Text style={styles.welcomeSubtitle}>Today you drank</Text>
//         <Text style={styles.amount}>______ oz of water!</Text>
//       </View>

//       {/* Water Drop with Centered Text */}
//       <View style={styles.dropletContainer}>
//         <Image
//           source={require("../../assets/waterdrop.png")}
//           style={styles.droplet}
//         />
//         <View style={styles.dropTextContainer}>
//           <Text style={styles.dropGoalText}>Goal: ____ oz</Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#023E8A",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   gearPlaceholder: {
//     position: "absolute",
//     top: 40,
//     right: 30,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#90E0EF",
//   },

//   welcomeBox: {
//     backgroundColor: "#CAF0F8",
//     borderRadius: 25,
//     paddingVertical: 25,
//     paddingHorizontal: 25,
//     alignItems: "center",
//     width: 300,
//     height: 200,
//   },

//   welcomeTitle: {
//     color: "#03045E",
//     fontSize: 35,
//     fontWeight: "400",
//     textAlign: "center",
//     marginBottom: 10,
//   },

//   welcomeSubtitle: {
//     color: "black",
//     fontSize: 24,
//     fontWeight: "500",
//   },

//   amount: {
//     color: "black",
//     fontSize: 24,
//     fontWeight: "500",
//   },

//   dropletPlaceholder: {
//     marginTop: 25,
//     width: 240,
//     height: 320,
//     borderRadius: 120,
//     backgroundColor: "#90E0EF",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   gearIcon: {
//     position: "absolute",
//     top: 40,
//     right: 30,
//     width: 50,
//     height: 50,
//     resizeMode: "contain",
//   },

//   dropletContainer: {
//     position: "relative",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   dropTextContainer: {
//     position: "absolute",
//     top: "55%",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   dropGoalText: {
//     fontSize: 20,
//     color: "#FFFFFF",
//   },

//   droplet: {
//     marginTop: 20,
//     width: 240,
//     height: 320,
//     resizeMode: "contain",
//   },
// });
import React, { useEffect, useRef } from "react";
import { Image, View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Path, Rect, Defs, ClipPath, G } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function HomePage() {
  // DUMMY DATA - Replace with real data from your app
  const currentAmount = 40; // oz drank so far
  const goalAmount = 80; // oz goal
  const progressPercent = (currentAmount / goalAmount) * 100; // Calculate percentage

  // Animated value for water fill
  const fillAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animation value
    fillAnimation.setValue(0);
    
    // Animate the water fill when component mounts
    Animated.timing(fillAnimation, {
      toValue: progressPercent,
      duration: 2500, // 2.5 seconds animation
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  // Convert percentage to Y position (0% at bottom = y:360, 100% at top = y:0)
  const fillY = fillAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [360, 0],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.gearIcon}
      />
      
      {/* Welcome Box */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>{greeting}</Text>
        <Text style={styles.welcomeSubtitle}>Today you drank</Text>
        <Text style={styles.amount}>{currentAmount} oz of water!</Text>
      </View>

      {/* Water Drop with Animated Fill */}
      <View style={styles.dropletContainer}>
        <Svg width="280" height="360" viewBox="0 0 280 360">
          <Defs>
            {/* Define smooth droplet shape with rounded bottom */}
            <ClipPath id="dropletClip">
              <Path d="M 140,20 
                       C 140,20 100,60 75,110 
                       C 50,160 45,190 45,220 
                       C 45,265 65,300 90,320 
                       C 105,330 122,338 140,338 
                       C 158,338 175,330 190,320 
                       C 215,300 235,265 235,220 
                       C 235,190 230,160 205,110 
                       C 180,60 140,20 140,20 Z" 
              />
            </ClipPath>
          </Defs>
          
          {/* Water fill - animated rectangle clipped to droplet shape */}
          <G clipPath="url(#dropletClip)">
            <AnimatedRect
              x="0"
              y={fillY}
              width="280"
              height="360"
              fill="#48CAE4"
            />
          </G>
          
          {/* Smooth droplet outline with rounded bottom */}
          <Path 
            d="M 140,20 
               C 140,20 100,60 75,110 
               C 50,160 45,190 45,220 
               C 45,265 65,300 90,320 
               C 105,330 122,338 140,338 
               C 158,338 175,330 190,320 
               C 215,300 235,265 235,220 
               C 235,190 230,160 205,110 
               C 180,60 140,20 140,20 Z" 
            stroke="#000000"
            strokeWidth="8"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>

        {/* Text Overlay */}
        <View style={styles.dropTextContainer}>
          <Text style={styles.dropPercentText}>{Math.round(progressPercent)}%</Text>
          <Text style={styles.dropGoalText}>Goal: {goalAmount} oz</Text>
        </View>
      </View>
      <Modal visible={showNameModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>What should we call you?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="First name"
              placeholderTextColor="white"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={saveName}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showSettings} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModalCard}>
            <TouchableOpacity
              style={[styles.modalButton, { marginBottom: 10 }]}
              onPress={() => setShowChangeName(true)}
            >
              <Text style={[styles.modalButtonText]}>Edit Name</Text>
            </TouchableOpacity>
            {showChangeName && (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="New display name"
                  placeholderTextColor="white"
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity
                  style={[styles.modalButton, { marginBottom: 10 }]}
                  onPress={saveName}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                try {
                  await signOut(auth);
                  setShowSettings(false);
                  router.replace("/login");
                } catch (error) {
                  alert(error.message);
                }
              }}
            >
              <Text style={styles.modalButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 10 }]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  gearIcon: {
    position: "absolute",
    top: 40,
    right: 30,
    width: 50,
    height: 50,
    resizeMode: "contain",
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
    top: 25,
    right: 10,
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  dropletContainer: {
    position: "relative",
    marginTop: 20,
    width: 280,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  dropTextContainer: {
    position: "absolute",
    top: "50%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  dropPercentText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dropGoalText: {
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

  droplet: {
    marginTop: 20,
    width: 240,
    height: 320,
    resizeMode: "contain",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#48CAE4",
    padding: 15,
    borderRadius: 15,
  },

  settingsModalCard: {
    width: "50%",
    backgroundColor: "#48CAE4",
    padding: 15,
    borderRadius: 15,
  },

  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  modalInput: {
    borderBottomWidth: 2,
    borderBottomColor: "#023E8A",
    color: "white",
    fontSize: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: "#CAF0F8",
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },

  modalButtonText: {
    fontSize: 20,
    color: "#023E8A",
    fontWeight: "bold",
  },
});

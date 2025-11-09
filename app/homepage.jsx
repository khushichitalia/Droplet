import React from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';


export default function HomePage() {
  return (
    <View style={styles.container}>
      {/* Settings Icon */}
      <Image
        source={require('../assets/setting.png')}
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
        source={require('../assets/waterdrop.png')}
        style={styles.droplet}
    />
    <View style={styles.dropTextContainer}>
        <Text style={styles.dropGoalText}>Goal: ____ oz</Text>
    </View>
    </View>


    {/* Bottom Navigation Bar */}
<View style={styles.navBar}>
  <TouchableOpacity style={styles.navButton}>
    <Image source={require('../assets/home.png')} style={styles.navIcon} />
  </TouchableOpacity>
  <TouchableOpacity style={styles.navButton}>
    <Image source={require('../assets/calendar.png')} style={styles.navIcon} />
  </TouchableOpacity>
  <TouchableOpacity style={styles.navButton}>
    <Image source={require('../assets/phonelock.png')} style={styles.navIcon} />
  </TouchableOpacity>
  <TouchableOpacity style={styles.navButton}>
    <Image source={require('../assets/map.png')} style={styles.navIcon} />
  </TouchableOpacity>
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#023E8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearIcon: {
    position: 'absolute',
    top: 40,
    right: 30,
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  welcomeBox: {
    backgroundColor: '#CAF0F8',
    borderRadius: 25,
    paddingVertical: 25,
    paddingHorizontal: 25,
    alignItems: 'center',
    width: 300,    
    height: 200,   
  },
  welcomeTitle: {
    color: '#03045E',
    fontSize: 35,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    color: 'black',
    fontSize: 24,
    fontWeight: '500',
  },
  amount: {
    color: 'black',
    fontSize: 24,
    fontWeight: '500',
  },
  droplet: {
    marginTop: 20,
    width: 240,
    height: 320,
    resizeMode: 'contain',
  },
  navBar: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: 100,
  backgroundColor: '#48CAE4',
  borderTopWidth: 3,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingBottom: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 10,
},
navButton: {
  backgroundColor: '#CAF0F8',
  borderRadius: 50,
  padding: 10,
  elevation: 3,
},
navIcon: {
  width: 40,
  height: 40,
  tintColor: '#000000ff', 
  resizeMode: 'contain',
},
dropletContainer: {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
},

dropTextContainer: {
  position: 'absolute',
  top: '55%',
  alignItems: 'center',
  justifyContent: 'center',
},

dropGoalText: {
  fontSize: 20,
  color: '#FFFFFF',     
},


});


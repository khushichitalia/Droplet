// import { StyleSheet, View, Text } from "react-native";
// import MapView, { Marker } from "react-native-maps";

// export default function Map() {
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: 29.647,
//           longitude: -82.3453,
//           latitudeDelta: 0.005,
//           longitudeDelta: 0.005,
//         }}
//       >
//         <Marker coordinate={{ latitude: 29.6481, longitude: -82.3437 }}>
//           <View style={styles.markerContainer}>
//             <View style={styles.bubble}>
//               <Text style={styles.label}>Marston Library</Text>
//             </View>
//             <View style={styles.pointer} />
//           </View>
//         </Marker>
//         <Marker coordinate={{ latitude: 29.649, longitude: -82.345 }}>
//           <View style={styles.markerContainer}>
//             <View style={styles.bubble}>
//               <Text style={styles.label}>Newell Hall</Text>
//             </View>
//             <View style={styles.pointer} />
//           </View>
//         </Marker>
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   markerContainer: {
//     alignItems: "center",
//   },
//   bubble: {
//     backgroundColor: "white",
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     borderRadius: 30,
//     borderColor: "black",
//     borderWidth: 1,
//   },
//   label: {
//     fontSize: 12.5,
//   },
//   pointer: {
//     borderLeftWidth: 6,
//     borderRightWidth: 6,
//     borderTopWidth: 10,
//     borderLeftColor: "transparent",
//     borderRightColor: "transparent",
//     borderTopColor: "white",
//     marginTop: -1,
//   },
// });

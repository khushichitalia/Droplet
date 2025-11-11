import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

function TabIcon({ name, focused }) {
  let bg = "#CAF0F8";
  let color = "black";

  if (focused) {
    bg = "#023E8A";
    color = "white";
  }

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 35,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 45,
      }}
    >
      <MaterialCommunityIcons name={name} size={28} color={color} />
    </View>
  );
}

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#48CAE4",
            height: 90,
            borderTopWidth: 0,
            paddingBottom: 10,
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Tabs.Screen
          name="homepage"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="home-outline" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="calendar-month-outline" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="screentime"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="cellphone-lock" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name="map-outline" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

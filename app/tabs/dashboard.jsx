import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { BarChart } from "react-native-gifted-charts";
import { Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWaterIntake } from "../../lib/api";
import { useBLEContext } from "../../lib/BLEContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Dashboard() {
  const [selected, setSelected] = useState("Week");
  const [userId, setUserId] = useState(null);

  // Get battery from BLE context
  const { battery } = useBLEContext();

  const [data, setData] = useState({
    today: { amount: 1.8, goal: 3 },
    week: { amount: 17.9, goal: 21 },
    weekDays: [3.0, 2.2, 3.3, 3.0, 3.0, 2.2, 1.8],
    monthDays: [17.9, 18.2, 19.0, 16.5],
    monthDaysDaily: [
      1.5, 2.8, 3.0, 2.7, 3.3, 2.9, 3.0, 2.2, 3.1, 3.0, 2.6, 2.9, 3.2, 3.0, 2.5,
      2.7, 3.0, 3.1, 2.8, 3.0, 3.2, 2.9, 2.6, 3.0, 2.7, 3.0, 3.1, 2.8, 3.0, 2.5,
    ],
    yearData: [70, 75, 80, 78, 85, 88, 90, 82, 76, 70, 68, 72],
    streak: 3,
  });

  // Fetch user ID and water intake data on component mount
  useEffect(() => {
    const fetchUserAndWaterData = async () => {
      try {
        // Get user ID from AsyncStorage
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) return;

        setUserId(storedUserId);

        // Fetch water intake data from backend using API helper
        const bottleData = await getWaterIntake(storedUserId);

        // Update dashboard data with real water intake
        setData((prevData) => ({
          ...prevData,
          today: {
            amount: (bottleData.waterDrankDaily || 0) / 1000, // Convert ml to L
            goal: (bottleData.dailyGoal || 2000) / 1000,
          },
          // You can add logic here to populate week/month/year data from your backend
        }));
      } catch (error) {
        console.error("Error fetching water data:", error);
      }
    };

    fetchUserAndWaterData();

    // Fetch data every 5 seconds to show real-time updates
    const interval = setInterval(fetchUserAndWaterData, 5000);
    return () => clearInterval(interval);
  }, []);

  const todayProgress =
    data.today.goal > 0 ? data.today.amount / data.today.goal : 0;
  const weekProgress =
    data.week.goal > 0 ? data.week.amount / data.week.goal : 0;
  const todayText = `${Math.round(todayProgress * 100)}%`;
  const weekText = `${Math.round(weekProgress * 100)}%`;
  const todayLabel = `${data.today.amount}/${data.today.goal} L`;
  const weekLabel = `${data.week.amount}/${data.week.goal} L`;
  // Compute streak dynamically from monthDaysDaily using perDayGoal
  const today = new Date();
  const todayIdx = today.getDate() - 1;
  const monthDaysDaily = data.monthDaysDaily || [];
  let streakNumber = 0;
  for (let i = todayIdx; i >= 0; i--) {
    if (
      typeof monthDaysDaily[i] === "number" &&
      monthDaysDaily[i] >= data.today.goal
    ) {
      streakNumber++;
    } else {
      break;
    }
  }

// Get Monday-based week start
const dayOfWeek = (today.getDay() + 6) % 7;
const startOfWeek = Math.max(0, todayIdx - dayOfWeek);


const weekDays = monthDaysDaily.slice(startOfWeek, todayIdx + 1);

  const perDayGoal = data.today.goal; // Single source of truth for daily goal
  const weekMax = Math.max(perDayGoal, 3, ...weekDays);
  const weekAvg = weekDays.length
    ? weekDays.reduce((s, v) => s + v, 0) / weekDays.length
    : 0;
  const weekAvgText = `${weekAvg.toFixed(1)}L/Day`;
  const monthDays = data.monthDays || [];
  const yearData = data.yearData || [];

  // Calculate which months to show in year view
  const currentMonth = new Date().getMonth(); // 0-11
  const currentDayOfMonth = new Date().getDate();
  const daysInCurrentMonth = new Date(
    new Date().getFullYear(),
    currentMonth + 1,
    0,
  ).getDate();

  // Only show months up to and including current month
  const displayedYearData = yearData.slice(0, currentMonth + 1);

  // Calculate current month progress (percentage based on days completed)
  const currentMonthProgress = (currentDayOfMonth / daysInCurrentMonth) * 100;
  const [chartKey, setChartKey] = useState(0);
  let activeData = weekDays;
  if (selected === "Month") activeData = monthDays;
  if (selected === "Year") activeData = yearData;

  let activeLabels = [];
  if (selected === "Week") {
  const allLabels = ["M", "T", "W", "R", "F", "S", "Su"];
  activeLabels = allLabels.slice(0, weekDays.length);
 }
  else if (activeData.length === 4) activeLabels = ["W1", "W2", "W3", "W4"];
  else if (activeData.length === 12)
    activeLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  else activeLabels = activeData.map((_, i) => `#${i + 1}`);

  const activeMax = Math.max(perDayGoal, 3, ...activeData);
  const activeAvg = activeData.length
    ? activeData.reduce((s, v) => s + v, 0) / activeData.length
    : 0;
  const activeAvgText = `${activeAvg.toFixed(1)}${selected === "Week" ? "L/Day" : selected === "Month" ? "L/Week" : ""}`;

  const barsAreaTop = 50;
  const barsAreaHeight = 180;
  const goalTop =
    activeMax > 0
      ? barsAreaTop + (1 - Math.min(perDayGoal / activeMax, 1)) * barsAreaHeight
      : barsAreaTop;

  const [selectedDay, setSelectedDay] = useState(0);

  const monthName = new Date().toLocaleString("default", { month: "long" });
  const monthYearLabel = `${monthName} ${new Date().getFullYear()}`;
  const monthAvg = monthDaysDaily.length
    ? monthDaysDaily.reduce((s, v) => s + v, 0) / monthDaysDaily.length
    : 0;

  const isCurrentMonth =
    today.getMonth() === new Date().getMonth() &&
    today.getFullYear() === new Date().getFullYear();
  const isFutureDay = isCurrentMonth && selectedDay > today.getDate() - 1;
  const selectedDayValue = monthDaysDaily[selectedDay];
  const hasData = typeof selectedDayValue === "number";
  
  // Format battery percentage for display
  const batteryPercentage = Math.round((battery || 0) * 100);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardInner}>
          {/* Battery Indicator */}
          <View style={styles.batteryIndicator}>
            <View style={[styles.batteryBar, { 
              backgroundColor: batteryPercentage > 20 ? '#4CAF50' : '#FF5252',
              width: `${batteryPercentage}%` 
            }]} />
          </View>
          <Text style={styles.batteryText}>Bottle Battery: {batteryPercentage}%</Text>
          
          <View style={styles.topRow}>
            <View style={styles.statCol}>
              <View style={styles.titleWrap}>
                <Text style={styles.statTitle}>Today</Text>
              </View>
              <View style={styles.circleWrap}>
                <CircularProgress
                  size={84}
                  strokeWidth={10}
                  progress={todayProgress}
                  color="#073B66"
                  bgColor="#8ED6F9"
                  innerColor="#E6FBFF"
                  text={todayText}
                />
              </View>
              <Text style={styles.smallText}>{todayLabel}</Text>
            </View>

            <View style={styles.statCol}>
              <View style={styles.titleWrap}>
                <Text style={styles.statTitle}>This Week</Text>
              </View>
              <View style={styles.circleWrap}>
                <CircularProgress
                  size={84}
                  strokeWidth={10}
                  progress={weekProgress}
                  color="#073B66"
                  bgColor="#8ED6F9"
                  innerColor="#E6FBFF"
                  text={weekText}
                />
              </View>
              <Text style={styles.smallText}>{weekLabel}</Text>
            </View>

            <View style={styles.statColRight}>
              <View style={styles.titleWrap}>
                <Text style={styles.statTitle}>Streak</Text>
              </View>
              <View style={styles.circleWrap}>
                <View style={styles.streakCircle}>
                  <Text style={styles.streakNumber}>{streakNumber}</Text>
                </View>
              </View>
              <Text style={styles.smallText}>Days</Text>
            </View>
          </View>

          <View style={styles.segmentWrap}>
            <View style={styles.segmentBackground}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  selected === "Week" && styles.segmentSelected,
                ]}
                onPress={() => {
                  setSelected("Week");
                  setChartKey(prev => prev + 1);
                }}
              >
                <Text
                  style={
                    selected === "Week"
                      ? styles.segmentSelectedText
                      : styles.segmentText
                  }
                >
                  Week
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  selected === "Month" && styles.segmentSelected,
                ]}
                onPress={() => {
                setSelected("Month");
                setChartKey(prev => prev + 1);
              }}
              >
                <Text
                  style={
                    selected === "Month"
                      ? styles.segmentSelectedText
                      : styles.segmentText
                  }
                >
                  Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  selected === "Year" && styles.segmentSelected,
                ]}
                onPress={() => {
                setSelected("Year");
                setChartKey(prev => prev + 1);
              }}
              >
                <Text
                  style={
                    selected === "Year"
                      ? styles.segmentSelectedText
                      : styles.segmentText
                  }
                >
                  Year
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {selected === "Week" && (
            <View style={styles.chartArea}>
              <Text style={styles.avgText}>
                AVG: <Text style={styles.avgNum}>{activeAvgText}</Text>
              </Text>
              <View style={{ alignItems: "center", overflow: "hidden" }}>
                <BarChart
                key={chartKey}
                data={weekDays.map((val, i) => ({
                  value: val,
                  label: activeLabels[i],
                  frontColor: val >= perDayGoal ? "#073B66" : "#8EBDE0",
                }))}

                barWidth={16}
                spacing={16}

                // ✅ ADD THESE
                isAnimated
                animationDuration={800}
                animationEasing="easeOutCubic"

                noOfSections={4}
                maxValue={Math.max(perDayGoal, ...weekDays, 3)}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#B9EEF6"

                yAxisTextStyle={{
                  color: "#0A4A7A",
                  fontWeight: "800",
                  fontSize: 12,
                }}
                xAxisLabelTextStyle={{
                  color: "#073B66",
                  fontWeight: "900",
                  fontSize: 11,
                }}

                barBorderRadius={8}
                height={150}
                width={280}

                rulesType="solid"
                rulesColor="#CDF6FB"
                rulesThickness={1}
                hideRules={false}

                yAxisLabelSuffix=" L"
                initialSpacing={10}
                endSpacing={10}
              />
              </View>
            </View>
          )}

          {selected === "Month" && (
            <View style={styles.monthArea}>
              <Text style={styles.monthTitle}>{monthYearLabel}</Text>

              <View style={styles.monthGrid}>
                {(() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = now.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const todayIndex = isCurrentMonth ? today.getDate() - 1 : -1;

                  const rows = Math.ceil(daysInMonth / 7);
                  return Array.from({ length: rows }).map((_, row) => (
                    <View key={row} style={styles.monthRow}>
                      {Array.from({ length: 7 }).map((__, idx) => {
                        const i = row * 7 + idx;
                        if (i >= daysInMonth) {
                          return (
                            <View
                              key={idx}
                              style={[styles.daySquare, styles.daySquareEmpty]}
                            />
                          );
                        }

                        const val = monthDaysDaily[i];
                        const isFuture = i > todayIndex;
                        const hasValue = typeof val === "number";
                        const meets = hasValue && val >= perDayGoal;

                        const bgColor =
                          !hasValue || isFuture
                            ? "transparent"
                            : meets
                              ? "#073B66"
                              : "#8EBDE0";
                        const textColor =
                          !hasValue || isFuture
                            ? "#073B66"
                            : meets
                              ? "#FFFFFF"
                              : "#073B66";

                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.daySquare,
                              !hasValue && styles.daySquareEmpty,
                              i === selectedDay && styles.daySquareSelected,
                              { backgroundColor: bgColor },
                            ]}
                            onPress={() => setSelectedDay(i)}
                          >
                            <Text
                              style={[styles.dayNumber, { color: textColor }]}
                            >
                              {i + 1}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ));
                })()}
              </View>

              {!isFutureDay && hasData && (
                <View style={styles.monthFooter}>
                  <View style={styles.selectedDayPill}>
                    <Text
                      style={styles.selectedDayText}
                    >{`${monthName} ${selectedDay + 1}`}</Text>
                  </View>

                  <View style={styles.dayDetails}>
                    <Text style={styles.detailText}>
                      You Drank {selectedDayValue} L.
                    </Text>
                    <Text style={styles.detailText}>
                      Your Goal was {data.today.goal} L.
                    </Text>
                  </View>

                  <View style={styles.monthAvgWrap}>
                    <View style={styles.avgCircle}>
                      <Text style={styles.avgNumLarge}>
                        {monthAvg.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.avgLabel}>AVG</Text>
                    <Text style={styles.avgUnit}>L/Day</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {selected === "Year" && (
            <View style={styles.yearArea}>
              <Text style={styles.monthTitle}>Year</Text>
              <View style={styles.yearGrid}>
                {displayedYearData.map((val, i) => {
                  const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  const isCurrentMonthItem = i === currentMonth;
                  // For current month, scale progress by how far through the month we are
                  const pct = isCurrentMonthItem
                    ? Math.max(0, Math.min(1, (val / 100) * (currentDayOfMonth / daysInCurrentMonth)))
                    : Math.max(0, Math.min(1, val / 100));
                  return (
                    <View key={i} style={styles.yearItem}>
                      <CircularProgress
                        size={48}
                        strokeWidth={6}
                        progress={pct}
                        color="#073B66"
                        bgColor="#8ED6F9"
                        innerColor="#E6FBFF"
                        text={`${Math.round(pct * 100)}%`}
                      />
                      <Text style={[styles.barLabel, { marginTop: 6 }]}>
                        {months[i]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function CircularProgress({
  size = 96,
  strokeWidth = 12,
  progress = 0.5,
  color = "#073B66",
  bgColor = "#8ED6F9",
  innerColor = "#E6FBFF",
  text = "",
}) {
  const animated = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.max(0, Math.min(progress, 1)),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

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
          strokeLinecap="round"
        />
        <AnimatedCircle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View
        style={{
          position: "absolute",
          width: size - strokeWidth * 1.5,
          height: size - strokeWidth * 1.5,
          borderRadius: (size - strokeWidth * 1.5) / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: innerColor,
        }}
      >
        <Text style={[styles.donutText, { fontSize: size > 50 ? 16 : 12 }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#023E8A",
    alignItems: "center",
    paddingTop: 24,
  },
  card: {
    width: "90%",
    flex: 0.92,
    backgroundColor: "#CAF0F8",
    borderColor: "#48CAE4",
    borderWidth: 4,
    borderRadius: 16,
    padding: 20,
    alignSelf: "center",
    justifyContent: "flex-start",
  },
  cardInner: {
    flex: 1,
    backgroundColor: "#E6FBFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B9EEF6",
    padding: 16,
  },
  batteryIndicator: {
    width: "100%",
    height: 20,
    backgroundColor: "#D0E8F2",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#8ED6F9",
  },
  batteryBar: {
    height: "100%",
    borderRadius: 9,
    transition: "width 0.3s ease",
  },
  batteryText: {
    color: "#073B66",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statColRight: {
    flex: 1,
    alignItems: "center",
  },
  statTitle: {
    color: "#0A4A7A",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  titleWrap: {
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  donutOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 12,
    borderColor: "#8ED6F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  donutInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E6FBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  donutText: {
    color: "#073B66",
    fontWeight: "800",
    fontSize: 20,
  },
  donutOuterLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 12,
    borderColor: "#8ED6F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  donutInnerLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E6FBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  donutTextLarge: {
    color: "#073B66",
    fontWeight: "900",
    fontSize: 20,
  },
  smallText: {
    color: "#0A4A7A",
    fontWeight: "700",
    marginTop: 6,
  },
  circleWrap: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  streakCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 10,
    borderColor: "#073B66",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: "transparent",
    position: "relative",
    overflow: "visible",
  },
  streakNumber: {
    color: "#073B66",
    fontSize: 28,
    fontWeight: "800",
  },
  dayNumber: {
    color: "#073B66",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 26,
  },
  segmentWrap: {
    marginVertical: 10,
    alignItems: "center",
  },
  segmentBackground: {
    width: "100%",
    backgroundColor: "#CDF6FB",
    borderRadius: 22,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    marginHorizontal: 6,
    borderRadius: 18,
  },
  segmentSelected: {
    backgroundColor: "#073B66",
  },
  segmentSelectedText: {
    color: "#fff",
    fontWeight: "800",
  },
  segmentText: {
    color: "#0A4A7A",
    fontWeight: "800",
  },
  chartArea: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: "hidden",
  },
  chartLeftAxis: {
    width: 30,
    alignItems: "center",
    paddingTop: 8,
  },
  axisLabel: {
    color: "#0A4A7A",
    fontWeight: "900",
    marginBottom: 12,
  },
  axisNumber: {
    color: "#0A4A7A",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 18,
  },
  chartMain: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 6,
    paddingTop: 10,
    position: "relative",
    zIndex: 1,
    height: 200,
  },
  avgText: {
    color: "#4CCCE6",
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 8,
    fontSize: 14,
  },
  avgNum: {
    color: "#4CCCE6",
    fontWeight: "900",
  },
  goalLine: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "#073B66",
  },
  avgLine: {
    borderTopWidth: 2,
    borderStyle: "solid",
    borderColor: "#4CCCE6",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flex: 0,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  barContainer: {
    alignItems: "center",
    flex: 0,
    width: 44,
    marginHorizontal: 6,
  },
  bar: {
    width: 18,
    borderRadius: 8,
    backgroundColor: "#073B66",
    marginBottom: 6,
  },
  barTall: {
    height: "70%",
  },
  barMedLight: {
    height: "45%",
    backgroundColor: "#8EBDE0",
  },
  barShort: {
    height: "30%",
    backgroundColor: "#8EBDE0",
  },
  barLabel: {
    marginTop: 6,
    color: "#073B66",
    fontWeight: "900",
  },
  monthArea: {
    paddingTop: 8,
  },
  monthTitle: {
    textAlign: "center",
    color: "#073B66",
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 10,
  },
  monthGrid: {
    paddingHorizontal: 6,
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  daySquare: {
    width: 34,
    height: 26,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  daySquareSelected: {
    borderWidth: 3,
    borderColor: "#4CCCE6",
  },
  daySquareEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#CDF6FB",
  },
  monthFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  selectedDayPill: {
    backgroundColor: "#73F0FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectedDayText: {
    color: "#073B66",
    fontWeight: "900",
    fontSize: 12,
  },
  dayDetails: {
    flex: 1,
    paddingHorizontal: 12,
  },
  detailText: {
    color: "#073B66",
    fontWeight: "700",
    fontSize: 11,
  },
  monthAvgWrap: {
    alignItems: "center",
  },
  avgCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#073B66",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    backgroundColor: "transparent",
  },
  avgNumLarge: {
    color: "#073B66",
    fontWeight: "900",
    fontSize: 16,
  },
  avgLabel: { color: "#4CCCE6", fontWeight: "800", fontSize: 10 },
  avgUnit: { color: "#073B66", fontWeight: "800", fontSize: 10 },
  yearArea: {
    paddingTop: 8,
    alignItems: "center",
    width: "100%",
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 16,
  },
  yearItem: {
    width: 64,
    alignItems: "center",
    marginBottom: 4,
  },
  text: {
    fontSize: 20,
    color: "white",
  },
  connectButton: {
    backgroundColor: "#073B66",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#073B66",
    marginBottom: 16,
    textAlign: "center",
  },
  deviceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  deviceName: {
    fontSize: 16,
    color: "#073B66",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#073B66",
  },
});

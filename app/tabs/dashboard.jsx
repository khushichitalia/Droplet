import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { BarChart } from "react-native-gifted-charts";
import { Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { getBottleData } from "../../lib/bottleApi";

const GOAL_STORAGE_KEY = "@droplet/daily-goal";
const GOAL_UNIT_STORAGE_KEY = "@droplet/daily-goal-unit";

const CONVERSION_FACTORS = {
  ml: 1,
  oz: 0.033814,
  L: 0.001,
  gal: 0.000264172,
  cups: 0.00422675,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Dashboard() {
  const [selected, setSelected] = useState("Week");
  const [loading, setLoading] = useState(true);
  const [userUnit, setUserUnit] = useState("oz");
  const [userGoal, setUserGoal] = useState(80);

  const [data, setData] = useState({
    today: { amount: 0, goal: 2 },
    week: { amount: 0, goal: 14 },
    weekDays: [0, 0, 0, 0, 0, 0, 0],
    monthDays: [0, 0, 0, 0],
    monthDaysDaily: Array(30).fill(0),
    yearData: Array(12).fill(0),
    streak: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const savedGoal = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
          const savedUnit = await AsyncStorage.getItem(GOAL_UNIT_STORAGE_KEY);
          if (savedGoal) setUserGoal(parseFloat(savedGoal));
          if (savedUnit) setUserUnit(savedUnit);
        } catch (error) {
          console.error("Failed to load settings", error);
        }
      };
      loadSettings();
    }, [])
  );

  useEffect(() => {
    const fetchBottleData = async () => {
      setLoading(true);
      try {
        const bottleData = await getBottleData();
        if (bottleData) {
          const factor = CONVERSION_FACTORS[userUnit] || 1;
          const dailyGoal = userGoal; // use the goal from settings
          
          const convert = (val) => (val ? val * factor : 0);
          
          setData({
            today: {
              amount: convert(bottleData.waterDrankDaily),
              goal: dailyGoal,
            },
            week: {
              amount: convert(bottleData.waterDrankMonthly ? bottleData.waterDrankMonthly / 4 : 0),
              goal: dailyGoal * 7,
            },
            weekDays: (bottleData.weekDays || [0, 0, 0, 0, 0, 0, 0]).map(convert),
            monthDays: (bottleData.monthWeeks || [0, 0, 0, 0]).map(convert),
            monthDaysDaily: (bottleData.monthDaysDaily || Array(30).fill(0)).map(convert),
            yearData: (bottleData.yearData || Array(12).fill(0)).map(val => (val / 100)), // Year data seems to be percentage already in the original code, but let's check
            streak: bottleData.goalsReachedConsistently || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load bottle data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBottleData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBottleData, 30000);
    return () => clearInterval(interval);
  }, [userUnit, userGoal]);

  const todayProgress =
    data.today.goal > 0 ? data.today.amount / data.today.goal : 0;
  const weekProgress =
    data.week.goal > 0 ? data.week.amount / data.week.goal : 0;
  const todayText = `${Math.round(todayProgress * 100)}%`;
  const weekText = `${Math.round(weekProgress * 100)}%`;
  const todayLabel = `${data.today.amount.toFixed(2)}/${data.today.goal} ${userUnit}`;
  const weekLabel = `${data.week.amount.toFixed(1)}/${data.week.goal.toFixed(1)} ${userUnit}`;
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
  const weekAvgText = `${weekAvg.toFixed(1)}${userUnit}/Day`;
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
  const activeAvgText = `${activeAvg.toFixed(1)}${selected === "Week" ? `${userUnit}/Day` : selected === "Month" ? `${userUnit}/Week` : ""}`;

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
  
  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#48CAE4" />
        </View>
      ) : (
        <View style={styles.card}>
        <View style={styles.cardInner}>
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

                yAxisLabelSuffix={` ${userUnit}`}
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
                      You Drank {selectedDayValue.toFixed(2)} {userUnit}.
                    </Text>
                    <Text style={styles.detailText}>
                      Your Goal was {data.today.goal} {userUnit}.
                    </Text>
                  </View>

                  <View style={styles.monthAvgWrap}>
                    <View style={styles.avgCircle}>
                      <Text style={styles.avgNumLarge}>
                        {monthAvg.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.avgLabel}>AVG</Text>
                    <Text style={styles.avgUnit}>{userUnit}/Day</Text>
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
      )}
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

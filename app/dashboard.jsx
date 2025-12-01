import React, { useState } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Modal,            
    SafeAreaView      
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {BarChart} from "react-native-gifted-charts";
import { PieChart } from "react-native-gifted-charts";
import Svg, { Circle } from 'react-native-svg';
import {Calendar, LocaleConfig} from 'react-native-calendars';

export default function Dashboard() {
  let GOAL = 500;
  let dayAmt = 0, monthAmt = 0;
  //CONSTANTS
  const SUCCESS_COLOR = '#023E8A'; 
  const DEFAULT_COLOR = 'lightgray';
  //END CONSTANTS 

  // ====================
  // STATE MANAGEMENT 
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState(''); //calendar, month
  const options = ['Week', 'Month', 'Year'];

  //DATA
  //CURRENT DAY
  const TODAY_PERCENTAGE = 70; 

  const todayProgressData = [
    {
      value: TODAY_PERCENTAGE,
      color: '#023E8A', // Progress color (e.g., a strong blue)
      text: `${TODAY_PERCENTAGE}%`, // Optional: text property is not used for center text
    },
    {
      value: 100 - TODAY_PERCENTAGE,
      color: '#E0E0E0', // Remainder color (e.g., light gray)
    },
  ];

  const WEEK_PERCENTAGE = 50; 

  const weekProgressData = [
    {
      value: WEEK_PERCENTAGE,
      color: '#023E8A', // Progress color (e.g., a strong blue)
      text: `${WEEK_PERCENTAGE}%`, // Optional: text property is not used for center text
    },
    {
      value: 100 - WEEK_PERCENTAGE,
      color: '#E0E0E0', // Remainder color (e.g., light gray)
    },
  ];

  //WEEK
  const weekData = [
        {value: 250, label: 'M'},
        {value: 500, label: 'T'},
        {value: 745, label: 'W'},
        {value: 320, label: 'T'},
        {value: 600, label: 'F'},
        {value: 256, label: 'S'},
        {value: 300, label: 'S'},
  ];
  //MONTH
  const monthData = [
        
  ];
  //YEAR
  const yearData = [
        {value: 80, color: '#177AD5', text: '54%'},
        {value: 20, color: '#79D2DE', text: '30%'},

        // {value: 80, color: '#177AD5', text: '54%'},
        // {value: 20, color: '#79D2DE', text: '30%'},

        // {value: 80, color: '#177AD5', text: '54%'},
        // {value: 20, color: '#79D2DE', text: '30%'},


  ];

  // HANDLER FUNCTION ADDITION
  const handleSelect = (period) => {
    setSelectedPeriod(period);
    setIsModalVisible(false);
  };

  //format raw chart data 
  const formatChartData = (rawData) => {
    return rawData.map(item => ({
        ...item,
        // Set the frontColor based on the value
        frontColor: item.value >= GOAL? SUCCESS_COLOR : DEFAULT_COLOR,
    }));
};

const calendarDate = () => {
  const today = new Date();
  
  // Get the current year (e.g., 2025)
  const year = today.getFullYear(); 
  
  // Get the month (0-indexed, so 10 for November). Add 1 and pad with '0'.
  // Current month is November, so month is 11.
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  
  // We use '01' as the day since the calendar's `current` prop 
  // only cares about the year and month to show the correct page.
  return `${year}-${month}-01`; 
};

  // CONDITIONAL RENDERING FUNCTION 
  const renderGraphic = () => {
    if (selectedPeriod === 'Week') {
      let weekStreak = 0;

      let chartData = formatChartData(weekData);
      let total = weekData.reduce((sum, item) => sum + item.value, 0);
      let average = total / weekData.length; 
      let lineData = weekData.map(() => ({
        value: average,
      }));
      return (
        
           <View style={styles.chartArea}>
                <View style={styles.ringsWrapper}>
                  <View style={styles.chartBlock}>
                    <Text style={styles.selectorText}>TODAY</Text>
                    <PieChart
                    donut
                    showText={false}
                    backgroundColor="#CAF0F8"
                    textColor="black"
                    radius={60} 
                    innerRadius={40}
                    textSize={10}
                    showTextBackground={false}
                    textBackgroundRadius={13}
                    data={todayProgressData}
                    centerLabelComponent={() => (
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#023E8A' }}>
                            {TODAY_PERCENTAGE}%
                        </Text>
                    )}
                  />
                  <Text style={styles.selectorText}>{dayAmt} / {GOAL} L</Text>
                  </View>
                  
                  <View style={styles.chartBlock}>
                    <Text style={styles.selectorText}>THIS WEEK</Text>
                    <PieChart
                      donut
                      showText={false}
                      backgroundColor="#CAF0F8"
                      textColor="black"
                      radius={60}
                      innerRadius={40}
                      textSize={10}
                      showTextBackground={false}
                      textBackgroundRadius={13}
                      data={weekProgressData}
                      centerLabelComponent={() => (
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#023E8A' }}>
                            {WEEK_PERCENTAGE}%
                        </Text>
                      )}
                    />
                    <Text style={styles.selectorText}>{dayAmt} / {GOAL * 7} L</Text>
                  </View>

                  <View style={styles.chartBlock}>
                    <Text style={styles.selectorText}>LONGEST STREAK</Text>
                    <PieChart
                      donut
                      isAnimated
                      showText={false}
                      backgroundColor="#CAF0F8"
                      textColor="black"
                      radius={60}
                      innerRadius={55}
                      textSize={10}
                      showTextBackground={false}
                      textBackgroundRadius={13}
                      data={[{value: 100, color: SUCCESS_COLOR}]}
                      centerLabelComponent={() => (
                        <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#023E8A'}}>
                            {weekStreak}
                        </Text>
                      )}
                    />
                     <Text style={styles.selectorText}>DAYS</Text>
                  </View>
                </View>


              <View style={styles.mainChartWrapper}>
                  <BarChart
                    data={chartData}
                    showLine
                    lineData={lineData}
                    //style line
                    lineConfig={{
                      color: '#48CAE4',          
                      thickness: 2,         
                      hideDataPoints: true,  
                      isDashed: true,        
                    }}
                    
                    //avg line labe;
                    yAxisExtraData={[
                        {
                            value: average,
                            label: `Avg: ${average}`,
                            labelTextStyle: { color: 'red', fontSize: 12, fontWeight: 'bold' },
                            labelBackgroundColor: 'orange',
                        }
                    ]}

                    yAxisThickness={1.5}
                    yAxisColor={'#023E8A'}
                    xAxisThickness={1.5}
                    xAxisColor={'#023E8A'}
                    barWidth={22}
                    noOfSections={3}
                    barBorderRadius={10}
                    frontColor={DEFAULT_COLOR} 
                    
                    isAnimated={true}
                    height={200}
                    initialSpacing={10}
                    spacing={25}
                    backgroundColor={'#CAF0F8'}
                />
              </View>
             
           </View>
        );
    
    } else if (selectedPeriod === 'Month') {
      return (
          <View style={styles.chartArea}>
            <View style={styles.ringsWrapper}>
                <View style={styles.calendarBlock}>
              <Calendar
                // Customize the appearance of the calendar
                style={{
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: 'gray',
                  height: 400,
                  width: 400
                }}
                // Specify the current date
                current={calendarDate()}
                // Callback that gets called when the user selects a day
                onDayPress={day => {
                  setSelected(day.dateString);
                }}
                markedDates={{
                  [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
                }}
              />
              </View>

              <View style={styles.chartBlock}>
                    <Text style={styles.selectorText}>THIS MONTH</Text>
                    <PieChart
                      donut
                      showText={false}
                      backgroundColor="#CAF0F8"
                      textColor="black"
                      radius={60}
                      innerRadius={40}
                      textSize={10}
                      showTextBackground={false}
                      textBackgroundRadius={13}
                      data={weekProgressData}
                      centerLabelComponent={() => (
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#023E8A' }}>
                            {WEEK_PERCENTAGE}%
                        </Text>
                      )}
                    />
                    <Text style={styles.selectorText}>{dayAmt} / {GOAL} L</Text>
                  </View>
            </View>
            
            
          </View>
        ); 
    } else if (selectedPeriod === 'Year') {
      return (
        <View style={styles.chartArea}>
          <Text style={styles.graphicPlaceholder}>YEAR</Text>
        </View>
      );
    } else
    {
      return <Text style={styles.graphicPlaceholder}>No data selected.</Text>
    }

  };
  // ====================


  return (
    // ====================
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Updated header style */}
        <Text style={styles.headerText}>Dashboard</Text>

        {/* --- Custom Selector Button --- */}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.selectorButton}
        >
          <Text style={styles.selectorText}>{selectedPeriod}</Text>
          <Ionicons name="chevron-down" size={12} color="#023E8A" style={styles.selectorIcon} />
        </TouchableOpacity>

        {/* --- Graphics Display Area --- */}
        <View style={styles.graphicContainer}>
          {renderGraphic()} {/* Call the conditional function */}
        </View>
      </View>

      {/* --- Selection Modal (The Dropdown Menu) --- */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
        {options.map((period) => { // ************** START OF CONDITIONAL STYLE LOGIC **************
              const isSelected = period === selectedPeriod; // Check if the item matches the state

              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.optionItem,
                    isSelected && styles.selectedOptionBackground // Apply background if selected
                  ]}
                  onPress={() => handleSelect(period)}
                  activeOpacity={0.7} 
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText // Apply text style if selected
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              );            // ************** END OF CONDITIONAL STYLE LOGIC **************
            })} 

          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
    // ====================
  );
}

// ====================
// UPDATED AND NEW STYLES
const styles = StyleSheet.create({
  safeArea: { // New style for full screen area
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    position: "relative",
    paddingTop: 60, // Used padding instead of margin
    paddingHorizontal: 20,
    backgroundColor: "#023E8A",
  },
  headerText: { // Updated from original 'text' style
    fontSize: 24,
    marginBottom: 20,
    alignSelf: "center",
    color: '#ffffff',
  },
  
  // Styles for the Custom Selector Button
  selectorButton: {
    position: 'absolute',
    top: 70,    // Pin distance from the top (adjust this to move it higher or lower)
    right: 60,  // Pin distance from the right (matches the horizontal padding)
    zIndex: 10,

    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#023E8A',
    borderRadius: 8,
    backgroundColor: '#CAF0F8',
    marginBottom: 30,
  },
  selectorText: {
    fontSize: 16,
    color: '#023E8A',
    fontWeight: 'bold',
  },
  selectorIcon: {
    marginLeft: 8,
  },

  // Styles for the Graphics Area
  graphicContainer: {
    marginTop: 10,
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffffff', 
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
  },
  graphicPlaceholder: {
    fontSize: 18, 
    padding: 20,
  },

  // Styles for the Modal Overlay and Content
  modalOverlay: {
    flex: 1,
    paddingTop: 130, // Aligns modal vertically below the button
    paddingRight: 20, // Aligns modal horizontally to the right edge
    justifyContent: 'flex-start',
    alignItems: 'flex-end', 
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
   width: 180,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  selectedOptionBackground: {
    backgroundColor: '#CAF0F8', 
  },
  selectedOptionText: {
    color: '#023E8A',
    fontWeight: 'bold',
  },
  chartArea: {
    //ringsWrapper and Bar Chart stacked vertically (default is column)
    flex: 1, 
    width: '100%', 
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    backgroundColor: "#CAF0F8",
    borderRadius: 10,
  },
  mainChartWrapper: {
    flex: 1, 
    paddingTop: 40,
    paddingBottom: 20,
  },
  ringsWrapper: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 40,
    alignItems: 'center', 
    width: '100%', 
    paddingVertical: 10,
  },
  
  chartBlock: {
    alignItems: 'center', 
},
  calendarBlock: {
    alignItems: 'center',
    alignSelf: 'flex-start', 
    paddingRight: 100,
}

});


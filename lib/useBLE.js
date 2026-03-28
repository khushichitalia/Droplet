/* expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app */

import { useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import { Buffer } from "buffer";

const DATA_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const COLOR_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1217";
const WEIGHT_CHARACTERISTIC_UUID = "12345678-1234-5678-1234-56789abcdef1";
const BATTERY_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1217";
const CMD_CHARACTERISTIC_UUID = "12345678-1234-5678-1234-56789abcdef2";
const TARGET_DEVICE_NAME = "ESP_BTL";

//moving average/filter for weight
const WINDOW_SIZE = 10; 
const STABLE_THRESHOLD = 5; //check if weight has changed by more than this amount (g)
const STABLE_DURATION = 3000;
const FILL_THRESHOLD = 15;

const bleManager = new BleManager();

const isTargetDevice = (device) => {
  const advertisedName = device?.name?.trim();
  const localName = device?.localName?.trim();

  return (
    advertisedName === TARGET_DEVICE_NAME || localName === TARGET_DEVICE_NAME
  );
};

function useBLE() {
  const [allDevices, setAllDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [color, setColor] = useState("white");

  const [water, setWater] = useState(0);
  const [currWt, setCurrentWeight] = useState(0);
  const [battery, setBattery] = useState(0);

  const readings = useRef([]);
  const wasTared = useRef(false);
  const waterRunningTotal = useRef(0);
  const currentWeight = useRef(0);
  const maxWeight = useRef(0);
  const lastStableWeight = useRef(0);
  const stableStartTime = useRef(null);

  




  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const connectToDevice = async (device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();

      startStreamingData(deviceConnection);
      return deviceConnection;
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
      return null;
    }
  };

  const isDuplicteDevice = (devices, nextDevice) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }

      if (device && isTargetDevice(device)) {
        setAllDevices((prevState) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  
  //weight processing
  const tare = async (device) => {
      if (!device) return;
      const encoded = base64.encode("T"); 
      await device.writeCharacteristicWithoutResponseForService(
          DATA_SERVICE_UUID,
          CMD_CHARACTERISTIC_UUID,
          encoded
      );




  };

  //check if we have enough readings and check if all readings are within a small enough
  //range of the average
  const isReadingsClose = () => {
    if (readings.current.length < WINDOW_SIZE) return false;
    const avg = readings.current.reduce((a, b) => a + b, 0) / readings.current.length;
    return readings.current.every(r => Math.abs(r - avg) < STABLE_THRESHOLD);
  };

  //check that the weight has been stable (within threshold) long enough
  const isStable = (stableDuration) => {
    if (!isReadingsClose()) return false;
    const timeStable = stableStartTime.current !== null &&
                        Date.now() - stableStartTime.current > stableDuration;
    return timeStable;
  };

  const updateAndDetectFill = (rawWeight) => {
    readings.current.push(rawWeight);
    if (readings.current.length > WINDOW_SIZE) {
        readings.current.shift();
    }

    //if not enough readings 
    if (readings.current.length < WINDOW_SIZE) return;

    const avg = readings.current.reduce((a, b) => a + b, 0) / readings.current.length;

    if (isReadingsClose()) {
        if (stableStartTime.current === null) {
            stableStartTime.current = Date.now();
        }
    } else {
        stableStartTime.current = null;
    }

    //3s stable duration
    if (isStable(3000)) { 
        currentWeight.current = avg;
        setCurrentWeight(avg);
        console.log("CURRENT WEIGHT: ", avg);
        if (avg > (lastStableWeight.current + FILL_THRESHOLD)) {
          if(avg > maxWeight.current){
            maxWeight.current = avg;
            console.log("Max weight NEW: ", maxWeight.current);
          }
        }
        else{
          waterRunningTotal.current += Math.abs(currentWeight.current - lastStableWeight.current);
          setWater(waterRunningTotal.current);
        }
        
        lastStableWeight.current = avg;
    }
};


  const onDataUpdate = (error, characteristic) => {
    if (error) {
      console.log(error);
      return;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return;
    }


    //WEIGHT
    if(characteristic.uuid == WEIGHT_CHARACTERISTIC_UUID){
      //keep as binary 
      const rawBytes = Buffer.from(characteristic.value, 'base64');
      const wt = rawBytes.readFloatLE(0);

      //tared, then bottle filled so weight should never be negative 
      //(would only be negative if removed bottle)

      // if(!wasTared){
      //   tare();
      // }

      if(wt >= 0){
        updateAndDetectFill(wt);
      }
    }

    //BATTERY
    // if(characteristic.uuid == BATTERY_CHARACTERISTIC_UUID){
    //   const rawBat = Buffer.from(characteristic.value, 'base64');
    //   battery.current = rawBat.readFloatLE(0);
    // }

    //const colorCode = base64.decode(characteristic.value);

    // let color = "white";
    // if (colorCode === "B") {
    //   color = "blue";
    // } else if (colorCode === "R") {
    //   color = "red";
    // } else if (colorCode === "G") {
    //   color = "green";
    // }

    // setColor(color);
  };

  const startStreamingData = async (device) => {
    if (device) {

      //weight
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        WEIGHT_CHARACTERISTIC_UUID,
        onDataUpdate,
      );

      //battery
      // device.

    } else {
      console.log("No Device Connected");
    }
  };

  return {
    connectToDevice,
    allDevices,
    connectedDevice,
    color,
    water,
    currWt,
    battery,
    requestPermissions,
    scanForPeripherals,
    startStreamingData,
  };
}

export default useBLE;

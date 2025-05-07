import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert,Image} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";


export default function HomeScreen() {
  // Initialize states
  const [mode, setMode] = useState("Manual");
  const [isSwinging, setIsSwinging] = useState(false);
  const [notification, setNotification] = useState("");
  const [devices, setDevices] = useState([]); // List of paired Bluetooth devices                                               
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const checkBluetoothEnabled = async () => {
      const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!isEnabled) {
        // Request to enable Bluetooth
        const enableBTIntent = await RNBluetoothClassic.requestEnable();
        if (enableBTIntent) {
          fetchPairedDevices(); // Fetch devices if Bluetooth is enabled
        } else {
          Alert.alert("Bluetooth Disabled", "Please enable Bluetooth to use this feature.");
        }
      } else {
        fetchPairedDevices();
      }
    };

    checkBluetoothEnabled();
  }, []);

  const fetchPairedDevices = async () => {
    setLoading(true);
    try {
      const pairedDevices = await RNBluetoothClassic.getBondedDevices();
      console.log("All Paired Devices:", pairedDevices); // Log all paired devices
  
      // Filter devices to find those named "HC-05"
      const hc05Devices = pairedDevices.filter(device => device.name && device.name.includes("HC-05"));
  
      console.log("Filtered HC-05 Devices:", hc05Devices); // Log filtered devices
  
      if (hc05Devices.length === 0) {
        Alert.alert("No Devices Found", "Smart Cradle is unreachable.");
      } else {
        setDevices(hc05Devices); // Set the state with HC-05 devices
        Alert.alert("Devices Found", `Found ${hc05Devices.length} device(s) named 'Smart Cradle'.`);
      }
    } catch (error) {
      console.error("Error fetching paired devices:", error); // Log the error
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Connect to a selected Bluetooth device
  const handleBluetoothPairing = () => {
    if (devices.length === 0) {
      Alert.alert("No Devices Found", "Smart Cradle is unreachable!");
      return;
    }

    // Display a list of devices to choose from
    Alert.alert(
      "Paired Devices",
      "Select a device to connect to.",
      devices.map((device) => ({
        text: device.name || "Unnamed Device",
        onPress: () => connectToDevice(device),
      }))
    );
  };

  const connectToDevice = async (device) => {
    try {
      const isConnected = await device.connect();
      if (isConnected) {
        setConnectedDevice(device);
        Alert.alert("Connected", `Connected to ${device.name}`);
      }
    } catch (error) {
      Alert.alert("Connection Failed", error.message);
    }
  };

  // Send a command to the Bluetooth device
  const sendBluetoothCommand = async (command) => {
    if (!connectedDevice) {
      Alert.alert("Not Connected", "Please pair and connect to a device first.");
      return;
    }

    try {
      await connectedDevice.write(command);
      setNotification(`Command Sent: ${command}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Handle mode change and send appropriate commands
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "Smart") {
      sendBluetoothCommand("0"); // Send 0 when "Smart" mode is selected
    } else if (newMode === "Manual") {
      sendBluetoothCommand("1"); // Send 1 when "Manual" mode is selected
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0d1b2a", padding: 20,  }}>
      {/* Title */}
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 24 }}>
        Smart Cradle App
      </Text>

      {/* Loading Indicator */}
      {loading && <Text>Loading devices...</Text>}

      {/* Mode Buttons */}
      <View style={{ flexDirection: "row", marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginRight: 8,
            backgroundColor: mode === "Manual" ? "#3b82f6" : "#e5e7eb",
            borderColor: "#3b82f6",
            borderWidth: mode === "Manual" ? 0 : 1,
          }}
          onPress={() => handleModeChange("Manual")}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: mode === "Manual" ? "#ffffff" : "#3b82f6" }}>
            Manual
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: mode === "Smart" ? "#3b82f6" : "#e5e7eb",
            borderColor: "#3b82f6",
            borderWidth: mode === "Smart" ? 0 : 1,
          }}
          onPress={() => handleModeChange("Smart")}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: mode === "Smart" ? "#ffffff" : "#3b82f6" }}>
            Smart
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cradle Status Indicator */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
  <Text style={{ fontSize: 18, color: "#ffffff", marginBottom: 8 }}>Cradle Status:</Text>
  <Text
    style={{
      fontSize: 24,
      fontWeight: "bold",
      color: mode === "Smart" ? "#3b82f6" : isSwinging ? "#10b981" : "#ef4444",
    }}
  >
    {mode === "Smart" ? "Smart Mode" : isSwinging ? "Swinging" : "Not Swinging"}
  </Text>
</View>
<View style={{alignItems: "center"}}>
<Image
      source={
        mode === "Smart"
          ? require("./images/Smart.gif")
          : isSwinging
          ? require("./images/StartSwinging.gif")
          : require("./images/StopSwinging.gif")
      }
      style={{ width: 200, height: 200 }}
    />
    </View>

      

      {/* Simulate Actions */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 48,
          opacity: mode === "Manual" ? 1 : 0,
          pointerEvents: mode === "Manual" ? "auto" : "none",
        }}
      >
        <TouchableOpacity
          style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: "#10b981", borderRadius: 8, marginRight: 8 }}
          onPress={() => {
            setIsSwinging(true);
            sendBluetoothCommand("2"); // Command to start swinging
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Start Swinging</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: "#ef4444", borderRadius: 8 }}
          onPress={() => {
            setIsSwinging(false);
            sendBluetoothCommand("3"); // Command to stop swinging
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Stop Swinging</Text>
        </TouchableOpacity>
      </View>

      {/* Bluetooth Pairing Button */}
      <View style={{ marginTop: 32 }}>
        <TouchableOpacity
          style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#1d4ed8", borderRadius: 8 }}
          onPress={handleBluetoothPairing}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 18 }}>Pair with Smart Cradle</Text>
        </TouchableOpacity>
      </View>
    </View>   
  );
}

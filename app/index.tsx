import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MidiView from "../components/MidiView";
import { MidiKeyboard as MidiAPI, MidiDevice } from "../modules/simple-midi";

const midi = new MidiAPI();

export default function Index() {
  const [devices, setDevices] = useState<MidiDevice[]>([]);

  useEffect(() => {
    midi.getDevices().then((devices) => {
      setDevices(devices);
    });
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 30, padding: 10 }}
      automaticallyAdjustContentInsets={true}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>
        From React Native:
      </Text>
      <Text style={{ marginTop: 10, marginBottom: 20, fontSize: 20 }}>
        Devices: {devices.length}
      </Text>
      {devices.map((device) => (
        <View key={device.id} style={{ marginBottom: 10 }}>
          <Text style={{ marginLeft: 10, fontSize: 20 }}>• {device.name}</Text>
          <TouchableOpacity
            style={{ marginTop: 5, marginBottom: 10 }}
            onPress={async () => {
              await midi.connect(device.id);
              console.log("[native] Connected to", device.name);
              await midi.playNote(60);
              console.log("[native] Send C4 note on message to", device.name);
            }}
          >
            <Text style={{ marginLeft: 10, color: "blue", fontSize: 18 }}>
              Connect and send C4 note on message
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          flex: 1,
          marginTop: 30,
          marginHorizontal: 5,
        }}
      />
      <MidiView
        devices={devices}
        connectToDevice={async (device: MidiDevice) => {
          await midi.connect(device.id);
        }}
        playNote={async (note: number) => {
          await midi.playNote(note);
        }}
        dom={{ matchContents: true }}
      />
    </ScrollView>
  );
}

"use dom";

import { MidiDevice } from "../modules/simple-midi/src/SimpleMidi.types";

export default function MidiView({
  dom,
  devices,
  connectToDevice,
  playNote,
}: {
  dom: import("expo/dom").DOMProps;
  devices: MidiDevice[];
  connectToDevice: (device: MidiDevice) => Promise<void>;
  playNote: (note: number) => Promise<void>;
}) {
  return (
    <div>
      <h1 style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>
        From WebView:
      </h1>
      <p style={{ marginTop: 10, marginBottom: 20, fontSize: 20 }}>
        Devices: {devices.length}
      </p>
      <ul style={{ marginLeft: -15 }}>
        {devices.map((device) => (
          <li key={device.id} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 20 }}>{device.name}</div>
            <button
              style={{
                marginBottom: 10,
                color: "blue",
                fontSize: 18,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              onClick={async () => {
                await connectToDevice(device);
                console.log("[dom] Connected to", device.name);
                await playNote(60);
                console.log("[dom] Send C4 note on message to", device.name);
              }}
            >
              Connect and send C4 note on message
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

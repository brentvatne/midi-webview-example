# Simple MIDI Expo Module

An Expo module that provides MIDI functionality for iOS, allowing you to connect to MIDI devices and send messages required for implementing a basic MIDI keyboard.

## Features

- 🎹 **Device Management**: List, connect, and disconnect from MIDI devices
- 🎵 **Note Control**: Send Note On/Off messages with velocity
- 🎛️ **Control Changes**: Send control messages (sustain pedal, volume, pan, etc.)
- 🎼 **Program Changes**: Change instrument patches
- 🎸 **Pitch Bend**: Send pitch bend messages
- 📡 **Real-time Events**: Device connection/disconnection notifications
- 🛡️ **Type Safety**: Full TypeScript support

## Platform Support

Currently, this module only supports **iOS**. Android support can be added by implementing the corresponding Kotlin module.

## Basic Usage

### Import the Module

```typescript
import SimpleMidiModule, { MidiKeyboard, MidiDevice } from 'simple-midi';
```

### Using the MidiKeyboard Helper Class

The `MidiKeyboard` class provides a high-level interface for common MIDI keyboard operations:

```typescript
// Create a MIDI keyboard instance
const keyboard = new MidiKeyboard();

// Get available MIDI devices
const devices = await keyboard.getDevices();

// Connect to a device
const success = await keyboard.connect(deviceId);

// Play a note (Middle C with velocity 64)
await keyboard.playNote(60, 64);

// Release the note
await keyboard.releaseNote(60);

// Set sustain pedal
await keyboard.setSustainPedal(true);

// Change volume (0-1)
await keyboard.setVolume(0.8);

// Disconnect when done
keyboard.disconnect();
```

### Using the Low-Level Module API

For more control, you can use the module directly:

```typescript
import SimpleMidiModule from 'simple-midi';

// Send a Note On message
await SimpleMidiModule.sendNoteOn(60, 127, 0); // note, velocity, channel

// Send a Control Change message
await SimpleMidiModule.sendControlChange(64, 127, 0); // controller, value, channel

// Send a Pitch Bend message
await SimpleMidiModule.sendPitchBend(8192, 0); // value (0-16383), channel
```

## Complete Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { MidiKeyboard, MidiDevice } from 'simple-midi';

export function MidiExample() {
  const [keyboard] = useState(() => new MidiKeyboard());
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Load devices on mount
    keyboard.getDevices().then(setDevices);

    // Set up device listeners
    const cleanup = keyboard.addDeviceListener(
      (deviceId, deviceName) => {
        console.log(`Connected to ${deviceName}`);
        setConnected(true);
      },
      (deviceId, deviceName) => {
        console.log(`Disconnected from ${deviceName}`);
        setConnected(false);
      },
      (devices) => {
        setDevices(devices);
      }
    );

    return cleanup;
  }, []);

  const playChord = async () => {
    // Play a C major chord
    await keyboard.playNote(60, 100); // C
    await keyboard.playNote(64, 100); // E
    await keyboard.playNote(67, 100); // G
    
    // Hold for 1 second
    setTimeout(async () => {
      await keyboard.releaseNote(60);
      await keyboard.releaseNote(64);
      await keyboard.releaseNote(67);
    }, 1000);
  };

  return (
    <View>
      <Text>MIDI Devices:</Text>
      {devices.map(device => (
        <Button
          key={device.id}
          title={device.name}
          onPress={() => keyboard.connect(device.id)}
        />
      ))}
      
      {connected && (
        <Button title="Play Chord" onPress={playChord} />
      )}
    </View>
  );
}
```

## API Reference

### MidiKeyboard Class

#### Constructor
- `new MidiKeyboard(channel?: number)` - Create a new keyboard instance (default channel: 0)

#### Device Management
- `getDevices(): Promise<MidiDevice[]>` - Get list of available MIDI devices
- `connect(deviceId: string): Promise<boolean>` - Connect to a device
- `disconnect(): void` - Disconnect from current device
- `isConnected(): boolean` - Check connection status
- `getConnectionInfo(): ConnectionInfo | null` - Get current connection details

#### Note Control
- `playNote(note: number, velocity?: number): Promise<void>` - Play a note
- `releaseNote(note: number, velocity?: number): Promise<void>` - Release a note
- `releaseAllNotes(): Promise<void>` - Release all active notes

#### Control Functions
- `setSustainPedal(on: boolean): Promise<void>` - Control sustain pedal
- `setVolume(volume: number): Promise<void>` - Set volume (0-1)
- `setPan(pan: number): Promise<void>` - Set pan (-1 to 1)
- `setModulation(modulation: number): Promise<void>` - Set modulation (0-1)
- `setPitchBend(bend: number): Promise<void>` - Set pitch bend (-1 to 1)
- `changeProgram(program: number): Promise<void>` - Change instrument program

#### Utility Functions
- `panic(): Promise<void>` - Send All Notes Off and Reset All Controllers

### Helper Functions

- `noteToFrequency(note: number): number` - Convert MIDI note to frequency in Hz
- `noteToName(note: number): string` - Convert MIDI note to name (e.g., "C4")
- `nameToNote(name: string): number` - Convert note name to MIDI note number

### Constants

#### MidiNotes
Common MIDI note numbers:
```typescript
MidiNotes.MIDDLE_C // 60
MidiNotes.C4       // 60
MidiNotes.A4       // 69
```

#### MidiControllers
Common MIDI controller numbers:
```typescript
MidiControllers.SUSTAIN_PEDAL    // 64
MidiControllers.MAIN_VOLUME      // 7
MidiControllers.PAN              // 10
MidiControllers.MODULATION_WHEEL // 1
```

## Types

```typescript
interface MidiDevice {
  id: string;
  name: string;
  isConnected: boolean;
}

interface ConnectionInfo {
  connected: boolean;
  deviceId?: string;
  deviceName?: string;
}
```

## Events

The module emits the following events:

- `onDeviceConnected` - Fired when a device is connected
- `onDeviceDisconnected` - Fired when a device is disconnected
- `onDevicesChanged` - Fired when the device list changes
- `onMidiMessage` - Reserved for future MIDI input support

## Notes

- The module uses real Note Off messages (0x80) rather than Note On with velocity 0
- Pitch bend is centered at 8192 (0x2000)
- All MIDI channels are 0-indexed (0-15)
- The module properly handles device disconnections and cleans up resources

## Contributing

To add Android support, implement the corresponding functionality in `android/SimpleMidiModule.kt` using Android's MIDI API.

## License

This module is part of your Expo project and follows your project's license. 
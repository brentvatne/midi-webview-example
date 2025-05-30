import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export interface MidiDevice {
  id: string;
  name: string;
  isConnected: boolean;
}

export interface ConnectionInfo {
  connected: boolean;
  deviceId?: string;
  deviceName?: string;
}

export type SimpleMidiModuleEvents = {
  onDeviceConnected: (params: { deviceId: string; deviceName: string }) => void;
  onDeviceDisconnected: (params: {
    deviceId: string;
    deviceName: string;
  }) => void;
  onDevicesChanged: (params: { devices: MidiDevice[] }) => void;
  onMidiMessage: (params: { data: number[] }) => void;
};

// MIDI Constants
export const MIDI_CHANNELS = 16;
export const MIDI_NOTES = 128;
export const MIDI_VELOCITY_MAX = 127;

// Common MIDI Controller Numbers
export const MidiControllers = {
  MODULATION_WHEEL: 1,
  BREATH_CONTROLLER: 2,
  FOOT_CONTROLLER: 4,
  PORTAMENTO_TIME: 5,
  DATA_ENTRY_SLIDER: 6,
  MAIN_VOLUME: 7,
  BALANCE: 8,
  PAN: 10,
  EXPRESSION: 11,
  SUSTAIN_PEDAL: 64,
  PORTAMENTO: 65,
  SOSTENUTO_PEDAL: 66,
  SOFT_PEDAL: 67,
  HOLD_2: 69,
  ALL_SOUND_OFF: 120,
  RESET_ALL_CONTROLLERS: 121,
  LOCAL_CONTROL: 122,
  ALL_NOTES_OFF: 123,
} as const;

// Common MIDI Note Numbers
export const MidiNotes = {
  C0: 12,
  C1: 24,
  C2: 36,
  C3: 48,
  C4: 60,
  C5: 72,
  C6: 84,
  C7: 96,
  C8: 108,
  D0: 14,
  D1: 26,
  D2: 38,
  D3: 50,
  D4: 62,
  D5: 74,
  D6: 86,
  D7: 98,
  D8: 110,
  E0: 16,
  E1: 28,
  E2: 40,
  E3: 52,
  E4: 64,
  E5: 76,
  E6: 88,
  E7: 100,
  E8: 112,
  F0: 17,
  F1: 29,
  F2: 41,
  F3: 53,
  F4: 65,
  F5: 77,
  F6: 89,
  F7: 101,
  F8: 113,
  G0: 19,
  G1: 31,
  G2: 43,
  G3: 55,
  G4: 67,
  G5: 79,
  G6: 91,
  G7: 103,
  G8: 115,
  A0: 21,
  A1: 33,
  A2: 45,
  A3: 57,
  A4: 69,
  A5: 81,
  A6: 93,
  A7: 105,
  A8: 117,
  B0: 23,
  B1: 35,
  B2: 47,
  B3: 59,
  B4: 71,
  B5: 83,
  B6: 95,
  B7: 107,
  B8: 119,
  MIDDLE_C: 60,
} as const;

export type ChangeEventPayload = {
  value: string;
};

export type SimpleMidiViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

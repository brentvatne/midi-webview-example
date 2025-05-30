import { NativeModule, requireNativeModule } from "expo";

import {
  ConnectionInfo,
  MidiDevice,
  SimpleMidiModuleEvents,
} from "./SimpleMidi.types";

declare class SimpleMidiModule extends NativeModule<SimpleMidiModuleEvents> {
  // Device Management
  getDevices(): Promise<MidiDevice[]>;
  connectToDevice(deviceId: string): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
  getConnectionInfo(): ConnectionInfo | null;

  // MIDI Message Sending
  sendNoteOn(note: number, velocity: number, channel: number): Promise<void>;
  sendNoteOff(note: number, velocity: number, channel: number): Promise<void>;
  sendControlChange(
    controller: number,
    value: number,
    channel: number,
  ): Promise<void>;
  sendProgramChange(program: number, channel: number): Promise<void>;
  sendPitchBend(value: number, channel: number): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<SimpleMidiModule>("SimpleMidi");

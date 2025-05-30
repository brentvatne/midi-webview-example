import { EventEmitter } from "expo-modules-core";
import {
  ConnectionInfo,
  MidiDevice,
  SimpleMidiModuleEvents,
} from "./SimpleMidi.types";

class SimpleMidiModuleWeb extends EventEmitter<SimpleMidiModuleEvents> {
  async getDevices(): Promise<MidiDevice[]> {
    console.warn("MIDI is not supported on web platform");
    return [];
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    console.warn("MIDI is not supported on web platform");
    return false;
  }

  disconnect(): void {
    console.warn("MIDI is not supported on web platform");
  }

  isConnected(): boolean {
    return false;
  }

  getConnectionInfo(): ConnectionInfo | null {
    return { connected: false };
  }

  async sendNoteOn(
    note: number,
    velocity: number,
    channel: number,
  ): Promise<void> {
    console.warn("MIDI is not supported on web platform");
  }

  async sendNoteOff(
    note: number,
    velocity: number,
    channel: number,
  ): Promise<void> {
    console.warn("MIDI is not supported on web platform");
  }

  async sendControlChange(
    controller: number,
    value: number,
    channel: number,
  ): Promise<void> {
    console.warn("MIDI is not supported on web platform");
  }

  async sendProgramChange(program: number, channel: number): Promise<void> {
    console.warn("MIDI is not supported on web platform");
  }

  async sendPitchBend(value: number, channel: number): Promise<void> {
    console.warn("MIDI is not supported on web platform");
  }
}

export default new SimpleMidiModuleWeb();

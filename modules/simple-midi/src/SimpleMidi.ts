import {
  ConnectionInfo,
  MIDI_CHANNELS,
  MidiControllers,
  MidiDevice,
  MidiNotes,
} from "./SimpleMidi.types";
import SimpleMidiModule from "./SimpleMidiModule";

/**
 * MidiKeyboard - A helper class for implementing a MIDI keyboard
 */
export class MidiKeyboard {
  private module = SimpleMidiModule;
  private currentChannel: number = 0;
  private activeNotes: Set<number> = new Set();

  constructor(channel: number = 0) {
    this.currentChannel = Math.max(0, Math.min(MIDI_CHANNELS - 1, channel));
  }

  // Device Management
  async getDevices(): Promise<MidiDevice[]> {
    return this.module.getDevices();
  }

  async connect(deviceId: string): Promise<boolean> {
    return this.module.connectToDevice(deviceId);
  }

  disconnect(): void {
    // Release all active notes before disconnecting
    this.releaseAllNotes();
    this.module.disconnect();
  }

  isConnected(): boolean {
    return this.module.isConnected();
  }

  getConnectionInfo(): ConnectionInfo | null {
    return this.module.getConnectionInfo();
  }

  // Channel Management
  setChannel(channel: number): void {
    this.currentChannel = Math.max(0, Math.min(MIDI_CHANNELS - 1, channel));
  }

  getChannel(): number {
    return this.currentChannel;
  }

  // Note Playing
  async playNote(note: number, velocity: number = 64): Promise<void> {
    if (this.activeNotes.has(note)) {
      // Release the note first if it's already playing
      await this.releaseNote(note);
    }

    this.activeNotes.add(note);
    return this.module.sendNoteOn(note, velocity, this.currentChannel);
  }

  async releaseNote(note: number, velocity: number = 64): Promise<void> {
    this.activeNotes.delete(note);
    return this.module.sendNoteOff(note, velocity, this.currentChannel);
  }

  async releaseAllNotes(): Promise<void> {
    const promises = Array.from(this.activeNotes).map((note) =>
      this.releaseNote(note),
    );
    await Promise.all(promises);
  }

  // Control Functions
  async setSustainPedal(on: boolean): Promise<void> {
    return this.module.sendControlChange(
      MidiControllers.SUSTAIN_PEDAL,
      on ? 127 : 0,
      this.currentChannel,
    );
  }

  async setVolume(volume: number): Promise<void> {
    const value = Math.max(0, Math.min(127, Math.round(volume * 127)));
    return this.module.sendControlChange(
      MidiControllers.MAIN_VOLUME,
      value,
      this.currentChannel,
    );
  }

  async setPan(pan: number): Promise<void> {
    // Pan: -1 (left) to 1 (right), center is 0
    const value = Math.max(0, Math.min(127, Math.round((pan + 1) * 63.5)));
    return this.module.sendControlChange(
      MidiControllers.PAN,
      value,
      this.currentChannel,
    );
  }

  async setModulation(modulation: number): Promise<void> {
    const value = Math.max(0, Math.min(127, Math.round(modulation * 127)));
    return this.module.sendControlChange(
      MidiControllers.MODULATION_WHEEL,
      value,
      this.currentChannel,
    );
  }

  async setPitchBend(bend: number): Promise<void> {
    // Bend: -1 to 1, center is 0
    const value = Math.max(0, Math.min(16383, Math.round((bend + 1) * 8191.5)));
    return this.module.sendPitchBend(value, this.currentChannel);
  }

  async resetPitchBend(): Promise<void> {
    return this.module.sendPitchBend(8192, this.currentChannel); // Center position
  }

  async changeProgram(program: number): Promise<void> {
    return this.module.sendProgramChange(program, this.currentChannel);
  }

  async panic(): Promise<void> {
    // Send All Notes Off and Reset All Controllers
    await this.module.sendControlChange(
      MidiControllers.ALL_NOTES_OFF,
      0,
      this.currentChannel,
    );
    await this.module.sendControlChange(
      MidiControllers.RESET_ALL_CONTROLLERS,
      0,
      this.currentChannel,
    );
    this.activeNotes.clear();
  }

  // Event Listeners
  addDeviceListener(
    onConnected?: (deviceId: string, deviceName: string) => void,
    onDisconnected?: (deviceId: string, deviceName: string) => void,
    onDevicesChanged?: (devices: MidiDevice[]) => void,
  ): () => void {
    const subscriptions: any[] = [];

    if (onConnected) {
      subscriptions.push(
        this.module.addListener(
          "onDeviceConnected",
          ({ deviceId, deviceName }) => {
            onConnected(deviceId, deviceName);
          },
        ),
      );
    }

    if (onDisconnected) {
      subscriptions.push(
        this.module.addListener(
          "onDeviceDisconnected",
          ({ deviceId, deviceName }) => {
            onDisconnected(deviceId, deviceName);
          },
        ),
      );
    }

    if (onDevicesChanged) {
      subscriptions.push(
        this.module.addListener("onDevicesChanged", ({ devices }) => {
          onDevicesChanged(devices);
        }),
      );
    }

    // Return cleanup function
    return () => {
      subscriptions.forEach((sub) => sub.remove());
    };
  }
}

// Helper functions for note calculations
export function noteToFrequency(note: number): number {
  // A4 (note 69) = 440 Hz
  return 440 * Math.pow(2, (note - 69) / 12);
}

export function noteToName(note: number): string {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octave = Math.floor(note / 12) - 1;
  const noteName = noteNames[note % 12];
  return `${noteName}${octave}`;
}

export function nameToNote(name: string): number {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const match = name.match(/^([A-G]#?)(\-?\d+)$/);

  if (!match) {
    throw new Error(`Invalid note name: ${name}`);
  }

  const [, noteName, octaveStr] = match;
  const noteIndex = noteNames.indexOf(noteName);

  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${name}`);
  }

  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + noteIndex;
}

// Re-export everything
export {
  ConnectionInfo,
  MidiControllers,
  MidiDevice,
  MidiNotes,
  SimpleMidiModule,
};

// Export the native module
export { default } from "./src/SimpleMidiModule";

// Export the helper class and utilities
export {
  MidiKeyboard,
  nameToNote,
  noteToFrequency,
  noteToName,
} from "./src/SimpleMidi";

// Export types and constants
export * from "./src/SimpleMidi.types";

// Remove the view export as we're not using it for MIDI
// export { default as SimpleMidiView } from './src/SimpleMidiView';

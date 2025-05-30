import ExpoModulesCore
import CoreMIDI
import Foundation

public class SimpleMidiModule: Module {
  // MIDI related properties
  private var midiClient: MIDIClientRef = 0
  private var outputPort: MIDIPortRef = 0
  private var connectedDevice: MIDIEndpointRef = 0
  private var devices: [(id: String, name: String, isConnected: Bool)] = []
  
  // Module definition
  public func definition() -> ModuleDefinition {
    Name("SimpleMidi")
    
    // Events that can be sent to JavaScript
    Events("onDeviceConnected", "onDeviceDisconnected", "onDevicesChanged", "onMidiMessage")
    
    // Initialize MIDI when module loads
    OnCreate {
      self.initializeMIDI()
    }
    
    // Clean up when module is destroyed
    OnDestroy {
      self.cleanup()
    }
    
    // Get list of available MIDI devices
    AsyncFunction("getDevices") { () -> [[String: Any]] in
      return self.getMIDIDevices()
    }
    
    // Connect to a MIDI device by ID
    AsyncFunction("connectToDevice") { (deviceId: String) -> Bool in
      return self.connectToMIDIDevice(deviceId: deviceId)
    }
    
    // Disconnect from current device
    Function("disconnect") {
      self.disconnectFromDevice()
    }
    
    // Send Note On message
    AsyncFunction("sendNoteOn") { (note: Int, velocity: Int, channel: Int) in
      self.sendNoteOnMessage(note: UInt8(note), velocity: UInt8(velocity), channel: UInt8(channel))
    }
    
    // Send Note Off message
    AsyncFunction("sendNoteOff") { (note: Int, velocity: Int, channel: Int) in
      self.sendNoteOffMessage(note: UInt8(note), velocity: UInt8(velocity), channel: UInt8(channel))
    }
    
    // Send Control Change message
    AsyncFunction("sendControlChange") { (controller: Int, value: Int, channel: Int) in
      self.sendControlChangeMessage(controller: UInt8(controller), value: UInt8(value), channel: UInt8(channel))
    }
    
    // Send Program Change message
    AsyncFunction("sendProgramChange") { (program: Int, channel: Int) in
      self.sendProgramChangeMessage(program: UInt8(program), channel: UInt8(channel))
    }
    
    // Send Pitch Bend message
    AsyncFunction("sendPitchBend") { (value: Int, channel: Int) in
      self.sendPitchBendMessage(value: value, channel: UInt8(channel))
    }
    
    // Check if connected to a device
    Function("isConnected") { () -> Bool in
      return self.connectedDevice != 0
    }
    
    // Get current connection info
    Function("getConnectionInfo") { () -> [String: Any]? in
      if self.connectedDevice != 0 {
        return [
          "connected": true,
          "deviceId": String(self.connectedDevice),
          "deviceName": self.getDeviceName(device: self.connectedDevice)
        ]
      }
      return ["connected": false]
    }
  }
  
  // MARK: - Private MIDI Methods
  
  private func initializeMIDI() {
    // Create MIDI client
    let clientName = "SimpleMidiClient" as CFString
    let status = MIDIClientCreateWithBlock(clientName, &midiClient) { notification in
      self.handleMIDINotification(notification)
    }
    
    if status != noErr {
      print("Failed to create MIDI client: \(status)")
      return
    }
    
    // Create output port
    let portName = "SimpleMidiOutput" as CFString
    let portStatus = MIDIOutputPortCreate(midiClient, portName, &outputPort)
    
    if portStatus != noErr {
      print("Failed to create output port: \(portStatus)")
    }
  }
  
  private func cleanup() {
    if outputPort != 0 {
      MIDIPortDispose(outputPort)
    }
    if midiClient != 0 {
      MIDIClientDispose(midiClient)
    }
  }
  
  private func getMIDIDevices() -> [[String: Any]] {
    var deviceList: [[String: Any]] = []
    
    let destinationCount = MIDIGetNumberOfDestinations()
    for i in 0..<destinationCount {
      let destination = MIDIGetDestination(i)
      let device: [String: Any] = [
        "id": String(destination),
        "name": getDeviceName(device: destination),
        "isConnected": destination == connectedDevice
      ]
      deviceList.append(device)
    }
    
    sendEvent("onDevicesChanged", ["devices": deviceList])
    return deviceList
  }
  
  private func getDeviceName(device: MIDIEndpointRef) -> String {
    var name: Unmanaged<CFString>?
    let status = MIDIObjectGetStringProperty(device, kMIDIPropertyName, &name)
    
    if status == noErr, let name = name {
      return name.takeRetainedValue() as String
    }
    return "Unknown Device"
  }
  
  private func connectToMIDIDevice(deviceId: String) -> Bool {
    guard let deviceRef = MIDIEndpointRef(deviceId) else { return false }
    
    // Verify device exists
    let destinationCount = MIDIGetNumberOfDestinations()
    var found = false
    for i in 0..<destinationCount {
      if MIDIGetDestination(i) == deviceRef {
        found = true
        break
      }
    }
    
    if !found { return false }
    
    // Disconnect from previous device if any
    if connectedDevice != 0 {
      disconnectFromDevice()
    }
    
    connectedDevice = deviceRef
    sendEvent("onDeviceConnected", [
      "deviceId": deviceId,
      "deviceName": getDeviceName(device: deviceRef)
    ])
    
    return true
  }
  
  private func disconnectFromDevice() {
    if connectedDevice != 0 {
      let deviceId = String(connectedDevice)
      let deviceName = getDeviceName(device: connectedDevice)
      connectedDevice = 0
      
      sendEvent("onDeviceDisconnected", [
        "deviceId": deviceId,
        "deviceName": deviceName
      ])
    }
  }
  
  private func handleMIDINotification(_ notification: UnsafePointer<MIDINotification>) {
    let messageID = notification.pointee.messageID
    
    switch messageID {
    case .msgSetupChanged:
      // Refresh device list when setup changes
      _ = getMIDIDevices()
    case .msgObjectAdded, .msgObjectRemoved:
      // Handle device additions/removals
      _ = getMIDIDevices()
    default:
      break
    }
  }
  
  // MARK: - MIDI Message Sending
  
  private func sendNoteOnMessage(note: UInt8, velocity: UInt8, channel: UInt8) {
    guard connectedDevice != 0 else { return }
    
    var packet = MIDIPacket()
    packet.timeStamp = 0
    packet.length = 3
    packet.data.0 = 0x90 | (channel & 0x0F)  // Note On status
    packet.data.1 = note & 0x7F               // Note number
    packet.data.2 = velocity & 0x7F           // Velocity
    
    var packetList = MIDIPacketList(numPackets: 1, packet: packet)
    MIDISend(outputPort, connectedDevice, &packetList)
  }
  
  private func sendNoteOffMessage(note: UInt8, velocity: UInt8, channel: UInt8) {
    guard connectedDevice != 0 else { return }
    
    var packet = MIDIPacket()
    packet.timeStamp = 0
    packet.length = 3
    packet.data.0 = 0x80 | (channel & 0x0F)  // Note Off status
    packet.data.1 = note & 0x7F               // Note number
    packet.data.2 = velocity & 0x7F           // Velocity
    
    var packetList = MIDIPacketList(numPackets: 1, packet: packet)
    MIDISend(outputPort, connectedDevice, &packetList)
  }
  
  private func sendControlChangeMessage(controller: UInt8, value: UInt8, channel: UInt8) {
    guard connectedDevice != 0 else { return }
    
    var packet = MIDIPacket()
    packet.timeStamp = 0
    packet.length = 3
    packet.data.0 = 0xB0 | (channel & 0x0F)  // Control Change status
    packet.data.1 = controller & 0x7F         // Controller number
    packet.data.2 = value & 0x7F              // Controller value
    
    var packetList = MIDIPacketList(numPackets: 1, packet: packet)
    MIDISend(outputPort, connectedDevice, &packetList)
  }
  
  private func sendProgramChangeMessage(program: UInt8, channel: UInt8) {
    guard connectedDevice != 0 else { return }
    
    var packet = MIDIPacket()
    packet.timeStamp = 0
    packet.length = 2
    packet.data.0 = 0xC0 | (channel & 0x0F)  // Program Change status
    packet.data.1 = program & 0x7F            // Program number
    
    var packetList = MIDIPacketList(numPackets: 1, packet: packet)
    MIDISend(outputPort, connectedDevice, &packetList)
  }
  
  private func sendPitchBendMessage(value: Int, channel: UInt8) {
    guard connectedDevice != 0 else { return }
    
    // Pitch bend value is 14-bit, centered at 0x2000 (8192)
    let pitchBendValue = max(0, min(16383, value))
    let lsb = UInt8(pitchBendValue & 0x7F)
    let msb = UInt8((pitchBendValue >> 7) & 0x7F)
    
    var packet = MIDIPacket()
    packet.timeStamp = 0
    packet.length = 3
    packet.data.0 = 0xE0 | (channel & 0x0F)  // Pitch Bend status
    packet.data.1 = lsb                       // LSB
    packet.data.2 = msb                       // MSB
    
    var packetList = MIDIPacketList(numPackets: 1, packet: packet)
    MIDISend(outputPort, connectedDevice, &packetList)
  }
}

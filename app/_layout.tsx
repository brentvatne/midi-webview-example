import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "iOS MIDI APIs",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "light",
          headerShadowVisible: true,
        }}
      />
    </Stack>
  );
}

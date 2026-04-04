import React from 'react';
import { Stack } from 'expo-router';

export default function OrderStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: 'Back'
      }}
    >
      <Stack.Screen name="confirm" />
    </Stack>
  );
}

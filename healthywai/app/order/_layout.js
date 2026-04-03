import React from 'react';
import { Stack } from 'expo-router';

export default function OrderStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back'
      }}
    >
      <Stack.Screen
        name="confirm"
        options={{ title: 'Place order', headerShown: true }}
      />
    </Stack>
  );
}

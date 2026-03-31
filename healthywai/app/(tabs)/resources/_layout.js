import React from 'react';
import { Stack } from 'expo-router';

export default function ResourcesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Resources' }} />
      <Stack.Screen name="[resourceId]" options={{ title: 'Resource Details' }} />
    </Stack>
  );
}


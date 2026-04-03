import React from 'react';
import { Stack } from 'expo-router';

export default function OrdersStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ title: 'My orders' }} />
      <Stack.Screen name="[orderId]" options={{ title: 'Order detail' }} />
    </Stack>
  );
}

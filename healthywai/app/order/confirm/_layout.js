import { Stack } from 'expo-router';

export default function ConfirmLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        title: 'Place order'
      }}
    />
  );
}

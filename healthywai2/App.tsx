import React from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeOrderScreen from './src/screens/HomeOrderScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <HomeOrderScreen />
    </>
  );
}

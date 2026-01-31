import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ResourceDetailScreen from '../screens/ResourceDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ 
          title: 'HealthyWAI2',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

function ResourcesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ResourcesList" 
        component={ResourcesScreen}
        options={{ title: 'Resources' }}
      />
      <Stack.Screen 
        name="ResourceDetail" 
        component={ResourceDetailScreen}
        options={{ title: 'Resource Details' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93'
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesStack}
        options={{ title: 'Resources' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}



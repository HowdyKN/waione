import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RepositoriesScreen from '../screens/RepositoriesScreen';
import RepositoryDetailScreen from '../screens/RepositoryDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RepositoriesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RepositoriesList"
        component={RepositoriesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RepositoryDetail"
        component={RepositoryDetailScreen}
        options={{
          title: 'Repository',
          headerStyle: {
            backgroundColor: '#161b22',
          },
          headerTintColor: '#c9d1d9',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#238636',
        tabBarInactiveTintColor: '#8b949e',
        tabBarStyle: {
          backgroundColor: '#161b22',
          borderTopColor: '#21262d',
        },
      }}
    >
      <Tab.Screen
        name="Repositories"
        component={RepositoriesStack}
        options={{
          title: 'Repositories',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}


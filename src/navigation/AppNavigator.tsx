import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AddChannelScreen } from '../screens/AddChannelScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { Video } from '../types';

export type RootStackParamList = {
  Home: undefined;
  AddChannel: undefined;
  Player: { playlist: Video[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#000',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'My Channels',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="AddChannel"
          component={AddChannelScreen}
          options={{
            title: 'Add Channel',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            title: 'Now Playing',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

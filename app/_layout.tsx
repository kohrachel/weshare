import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="rsvp"
        options={{
          title: 'RSVP',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
    </Stack>
  );
}

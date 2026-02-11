import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { RoutePoint } from '../types/route';

type RouteMapProps = {
  points: RoutePoint[];
  style?: StyleProp<ViewStyle>;
};

export default function RouteMap({ points, style }: RouteMapProps) {
  return (
    <View style={[style, styles.fallback]}>
      <Text style={styles.title}>Podglad mapy</Text>
      <Text style={styles.info}>Widok mapy nie jest dostepny w wersji web tej aplikacji.</Text>
      <Text style={styles.info}>Liczba punktow: {points.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#eef3fb',
    borderWidth: 1,
    borderColor: '#d8dee9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8
  },
  title: {
    fontWeight: '700',
    color: '#14213d'
  },
  info: {
    color: '#33415c',
    textAlign: 'center'
  }
});

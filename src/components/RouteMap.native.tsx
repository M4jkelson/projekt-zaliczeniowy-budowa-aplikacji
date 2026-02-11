import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { RoutePoint } from '../types/route';

type RouteMapProps = {
  points: RoutePoint[];
  style?: StyleProp<ViewStyle>;
};

export default function RouteMap({ points, style }: RouteMapProps) {
  return (
    <MapView
      style={style}
      initialRegion={{
        latitude: points[0]?.latitude ?? 52.2297,
        longitude: points[0]?.longitude ?? 21.0122,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
      }}
    >
      {points.map((point) => (
        <Marker
          key={`${point.latitude}-${point.longitude}-${point.timestamp}`}
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
        />
      ))}
      {points.length > 1 ? (
        <Polyline
          coordinates={points.map((point) => ({ latitude: point.latitude, longitude: point.longitude }))}
          strokeWidth={4}
          strokeColor="#1f6feb"
        />
      ) : null}
    </MapView>
  );
}

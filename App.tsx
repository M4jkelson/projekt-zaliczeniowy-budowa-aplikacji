import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { createRoute, deleteRoute, fetchRoutes, updateRoute } from './src/services/api';
import RouteMap from './src/components/RouteMap';
import { loadRoutesFromStorage, saveRoutesToStorage } from './src/storage/routesStorage';
import { FitRoute, RoutePoint } from './src/types/route';

export default function App() {
  const { width } = useWindowDimensions();
  const [routes, setRoutes] = useState<FitRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isWideLayout = Platform.OS === 'web' || width >= 900;

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId]
  );

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    void saveRoutesToStorage(routes);
  }, [routes]);

  function mergeRoutes(primary: FitRoute[], secondary: FitRoute[]) {
    const map = new Map<string, FitRoute>();
    [...primary, ...secondary].forEach((route) => {
      map.set(route.id, route);
    });
    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const loadRoutes = useCallback(async () => {
    const cached = await loadRoutesFromStorage();
    if (cached.length > 0) {
      setRoutes(cached);
      setStatusMessage('Loaded routes from local storage.');
    }

    try {
      setLoading(true);
      const data = await fetchRoutes();
      setRoutes((previous) => mergeRoutes(data, previous));
      setStatusMessage(null);
    } catch {
      if (cached.length > 0) {
        setStatusMessage('Offline mode: loaded routes from local storage.');
      } else {
        setStatusMessage('API is unavailable and there are no local routes yet.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function addCurrentLocationPoint() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow GPS access to add route points.');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

    const point: RoutePoint = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      timestamp: new Date().toISOString()
    };

    setPoints((previous) => [...previous, point]);
    setStatusMessage(null);
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow gallery access to add a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function clearForm() {
    setName('');
    setPoints([]);
    setPhotoUri(undefined);
    setSelectedRouteId(null);
  }

  async function saveRoute() {
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage('Validation: route name is required.');
      return;
    }

    if (points.length < 2) {
      setStatusMessage('Validation: add at least 2 GPS points.');
      return;
    }

    try {
      if (selectedRouteId) {
        const updated = await updateRoute(selectedRouteId, { name: name.trim(), points, photoUri });
        setRoutes((previous) => previous.map((route) => (route.id === selectedRouteId ? updated : route)));
        setStatusMessage('Route updated successfully.');
      } else {
        const created = await createRoute({ name: name.trim(), points, photoUri });
        setRoutes((previous) => [created, ...previous]);
        setStatusMessage('Route created successfully.');
      }
      clearForm();
    } catch {
      if (selectedRouteId) {
        setRoutes((previous) =>
          previous.map((route) =>
            route.id === selectedRouteId ? { ...route, name: name.trim(), points, photoUri } : route
          )
        );
        setStatusMessage('API unavailable: route updated locally.');
      } else {
        const localRoute: FitRoute = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: name.trim(),
          points,
          photoUri,
          createdAt: new Date().toISOString()
        };
        setRoutes((previous) => [localRoute, ...previous]);
        setStatusMessage('API unavailable: route created locally.');
      }
      clearForm();
    }
  }

  function editRoute(route: FitRoute) {
    setSelectedRouteId(route.id);
    setName(route.name);
    setPoints(route.points);
    setPhotoUri(route.photoUri);
    setStatusMessage(null);
  }

  async function removeRoute(id: string) {
    try {
      await deleteRoute(id);
      setRoutes((previous) => previous.filter((route) => route.id !== id));
      if (selectedRouteId === id) {
        clearForm();
      }
      setStatusMessage('Route deleted.');
    } catch {
      setRoutes((previous) => previous.filter((route) => route.id !== id));
      if (selectedRouteId === id) {
        clearForm();
      }
      setStatusMessage('API unavailable: route deleted locally.');
    }
  }

  const mapPoints = selectedRoute ? selectedRoute.points : points;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>FitRoute</Text>
        <Text style={styles.subtitle}>CRUD for walking and cycling routes</Text>
        {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

        <View style={styles.formCard}>
          <Text style={styles.label}>Route name</Text>
          <TextInput
            testID="route-name-input"
            value={name}
            onChangeText={setName}
            placeholder="Example: Riverside loop"
            style={styles.input}
          />

          <View style={styles.rowButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={addCurrentLocationPoint}>
              <Text style={styles.buttonText}>Add GPS point</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={pickPhoto}>
              <Text style={styles.buttonText}>Add photo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helper}>Route points: {points.length}</Text>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : null}

          <View style={styles.rowButtons}>
            <TouchableOpacity testID="save-route-button" style={styles.primaryButton} onPress={saveRoute}>
              <Text style={styles.buttonText}>{selectedRouteId ? 'Save changes' : 'Create route'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.mapPointsContainer, isWideLayout ? styles.mapPointsRow : styles.mapPointsColumn]}>
          <RouteMap points={mapPoints} style={[styles.map, isWideLayout ? styles.mapHalf : null]} />

          <View style={[styles.pointsCard, isWideLayout ? styles.pointsHalf : null]}>
            <Text style={styles.sectionTitle}>Points list</Text>
            <ScrollView style={styles.pointsScroll} contentContainerStyle={styles.pointsScrollContent}>
              {mapPoints.length === 0 ? <Text style={styles.routeMeta}>No points yet.</Text> : null}
              {mapPoints.map((point, index) => (
                <View key={`${point.timestamp}-${index}`} style={styles.pointRow}>
                  <Text style={styles.pointTitle}>Point {index + 1}</Text>
                  <Text style={styles.routeMeta}>
                    lat: {point.latitude.toFixed(5)} | lon: {point.longitude.toFixed(5)}
                  </Text>
                  <Text style={styles.routeMeta}>{new Date(point.timestamp).toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Your routes</Text>
          {loading ? <Text>Loading...</Text> : null}
          {!loading && routes.length === 0 ? <Text>No routes yet. Create your first route.</Text> : null}

          {routes.map((route) => (
            <View key={route.id} style={styles.routeRow}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.routeMeta}>Points: {route.points.length}</Text>
              </View>
              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.smallButton} onPress={() => editRoute(route)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallDangerButton} onPress={() => removeRoute(route.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 14 },
  title: { fontSize: 30, fontWeight: '700', color: '#14213d' },
  subtitle: { color: '#33415c' },
  status: { color: '#0b7285', fontWeight: '600' },
  formCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 10 },
  label: { fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d8dee9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  helper: { color: '#415a77' },
  photoPreview: { width: '100%', height: 160, borderRadius: 8 },
  rowButtons: { flexDirection: 'row', gap: 8 },
  primaryButton: { flex: 1, backgroundColor: '#1f6feb', padding: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButton: { flex: 1, backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  mapPointsContainer: { gap: 10 },
  mapPointsRow: { flexDirection: 'row' },
  mapPointsColumn: { flexDirection: 'column' },
  map: { width: '100%', height: 260, borderRadius: 10 },
  mapHalf: { flex: 1, width: undefined },
  pointsCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 8, minHeight: 260 },
  pointsHalf: { flex: 1 },
  pointsScroll: { maxHeight: 220 },
  pointsScrollContent: { gap: 8, paddingBottom: 6 },
  pointRow: { borderWidth: 1, borderColor: '#e5e9f0', borderRadius: 8, padding: 8, gap: 4 },
  pointTitle: { fontWeight: '700', color: '#1b263b' },
  listCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 16 },
  routeRow: {
    borderWidth: 1,
    borderColor: '#e5e9f0',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  routeInfo: { flex: 1, gap: 2 },
  routeName: { fontWeight: '600', color: '#1b263b' },
  routeMeta: { color: '#415a77' },
  smallButton: { backgroundColor: '#2a9d8f', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  smallDangerButton: { backgroundColor: '#d62828', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 }
});

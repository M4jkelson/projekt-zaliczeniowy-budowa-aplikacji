# Funkcja natywna

## GPS + mapa

Aplikacja używa:

- `expo-location` – pobranie bieżącej lokalizacji użytkownika i dodanie punktu do trasy.
- `react-native-maps` – wizualizacja punktów i polilinii trasy na mapie.

## Uprawnienia

- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`.
- iOS: `NSLocationWhenInUseUsageDescription`.
- iOS (zdjęcia): `NSPhotoLibraryUsageDescription`.

## Dodatkowo

- `expo-image-picker` – opcjonalne dodanie zdjęcia trasy.
- `@react-native-async-storage/async-storage` – lokalny fallback danych w trybie offline.

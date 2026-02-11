import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-maps', () => {
  const { View } = jest.requireActual('react-native');

  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polyline: View
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 52.23, longitude: 21.01 } })),
  Accuracy: { High: 'high' }
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
  MediaTypeOptions: { Images: 'Images' }
}));

jest.mock('../src/services/api', () => ({
  fetchRoutes: jest.fn(async () => []),
  createRoute: jest.fn(),
  updateRoute: jest.fn(),
  deleteRoute: jest.fn()
}));

jest.mock('../src/storage/routesStorage', () => ({
  loadRoutesFromStorage: jest.fn(async () => []),
  saveRoutesToStorage: jest.fn(async () => undefined)
}));

describe('App', () => {
  it('renders without crashing', async () => {
    let tree: renderer.ReactTestRenderer;

    await renderer.act(async () => {
      tree = renderer.create(<App />);
    });

    expect(tree!.toJSON()).toBeTruthy();
    tree!.unmount();
  });
});

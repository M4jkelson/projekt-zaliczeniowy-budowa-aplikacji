export type RoutePoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type FitRoute = {
  id: string;
  name: string;
  points: RoutePoint[];
  photoUri?: string;
  createdAt: string;
};

export type RoutePayload = {
  name: string;
  points: RoutePoint[];
  photoUri?: string;
};

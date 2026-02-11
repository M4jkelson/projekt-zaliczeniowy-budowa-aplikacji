# API FitRoute

Bazowy endpoint:

- `http://localhost:3000/routes`

## Model

```json
{
  "id": "1",
  "name": "Bulwary Wisły",
  "points": [
    { "latitude": 52.23, "longitude": 21.01, "timestamp": "2026-01-01T12:00:00.000Z" }
  ],
  "photoUri": "file:///.../photo.jpg",
  "createdAt": "2026-01-01T12:00:00.000Z"
}
```

## Endpointy

- `GET /routes` – pobranie wszystkich tras.
- `POST /routes` – utworzenie trasy.
- `PUT /routes/:id` – aktualizacja trasy.
- `DELETE /routes/:id` – usunięcie trasy.

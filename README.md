# FitRoute (React Native + Expo)

FitRoute to aplikacja mobilna CRUD do zarządzania trasami spacerowymi i rowerowymi.

## Zakres funkcjonalny

- **Create**: tworzenie nowej trasy (nazwa, punkty GPS, opcjonalne zdjęcie).
- **Read**: pobieranie i wyświetlanie tras z REST API.
- **Update**: edycja istniejącej trasy.
- **Delete**: usuwanie trasy.
- **Funkcja natywna**: GPS (`expo-location`) + mapa (`react-native-maps`).
- **Storage fallback**: lokalna pamięć (`AsyncStorage`) w przypadku braku API.

## Wymagania

- Node.js 18+
- npm
- Expo Go lub emulator Android/iOS
- Backend REST API pod adresem `http://localhost:3000/routes`

## Uruchomienie

```bash
npm install
npm run start
```

## Skrypty

```bash
npm run lint
npm run test
npm run build
npm run typecheck
```

## CI/CD (GitHub Actions)

Pipeline: `.github/workflows/ci-cd.yml`

Etapy:
1. lint
2. test
3. build (Android export przez Expo)

Trigger:
- przy `pull_request` do `develop` i `main`
- przy `push` na `main`

## Strategia gałęzi (Git)

Wymagane gałęzie:
- `main`
- `develop`
- `feature/ui`
- `feature/api`
- `feature/native`
- `feature/storage`
- `feature/tests`

Przepływ:
1. praca na feature branchach,
2. minimum 2 Pull Requesty na `develop`,
3. finalny merge `develop -> main`.

## Przykładowe REST API (json-server)

1. Zainstaluj json-server:

```bash
npm install -g json-server
```

2. Utwórz plik `db.json`:

```json
{
  "routes": []
}
```

3. Uruchom API:

```bash
json-server --watch db.json --port 3000
```

## Dokumentacja końcowa

Znajduje się w folderze `/docs`:
- `docs/api.md` – opis API,
- `docs/native-feature.md` – opis funkcji natywnej,
- `docs/screenshots/` – miejsce na screeny aplikacji.

import { createRoute, deleteRoute, fetchRoutes, updateRoute } from '../src/services/api';

const originalFetch = global.fetch;

describe('api service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('fetchRoutes uses GET and parses JSON', async () => {
    global.fetch = jest.fn(async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: '1', name: 'A', points: [], createdAt: 'now' }]
      }) as Response
    );

    const result = await fetchRoutes();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/routes', expect.any(Object));
    expect(result).toHaveLength(1);
  });

  it('deleteRoute handles 204 without json body', async () => {
    global.fetch = jest.fn(async () =>
      ({
        ok: true,
        status: 204,
        headers: new Headers()
      }) as Response
    );

    await expect(deleteRoute('123')).resolves.toBeUndefined();
  });

  it('createRoute uses POST and updateRoute uses PUT', async () => {
    global.fetch = jest.fn(async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '1', name: 'Trasa', points: [], createdAt: 'now' })
      }) as Response
    );

    await createRoute({ name: 'Trasa', points: [] });
    await updateRoute('1', { name: 'Trasa2', points: [] });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/routes',
      expect.objectContaining({ method: 'POST' })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/routes/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

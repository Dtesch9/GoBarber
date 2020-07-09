import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';
import { useAuth, AuthProvider } from '../../hooks/auth';

const spySetItem = jest.spyOn(Storage.prototype, 'setItem');
const spyRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
const spyGetItem = jest.spyOn(Storage.prototype, 'getItem');

const mockApi = new MockAdapter(api);

describe('Auth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    spyGetItem.mockImplementation(() => null);
  });

  it('should be able to use hook', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBe(undefined);
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
    expect(typeof result.current.updateUser).toBe('function');
  });

  it('should be able to sign in', async () => {
    const apiResponse = {
      token: 'token-1234',
      user: {
        id: 'user-id',
        name: 'user-name',
        email: 'user@email.com',
      },
    };

    mockApi.onPost('sessions').reply(200, apiResponse);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'user@email.com',
      password: 'user-password',
    });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('user@email.com');

    expect(spySetItem).toHaveBeenCalledWith(
      '@GoBarber:token',
      apiResponse.token,
    );

    expect(spySetItem).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(apiResponse.user),
    );
  });

  it('should be able to receive data from local storage', () => {
    const mockData = {
      token: 'token-1234',
      user: {
        id: 'user-id',
        name: 'user-name',
        email: 'user@email.com',
      },
    };

    spyGetItem.mockImplementation(key => {
      switch (key) {
        case '@GoBarber:token':
          return mockData.token;

        case '@GoBarber:user':
          return JSON.stringify(mockData.user);

        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(spyGetItem).toHaveBeenCalledTimes(2);

    expect(result.current.user).toEqual(expect.objectContaining(mockData.user));
  });

  it('should be able to sign out', () => {
    spyGetItem.mockImplementation(key => {
      switch (key) {
        case '@GoBarber:token':
          return 'token-1234';

        case '@GoBarber:user':
          return JSON.stringify({
            id: 'user-id',
            name: 'user-name',
            email: 'user@email.com',
          });

        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual('user@email.com');

    act(() => {
      result.current.signOut();
    });

    expect(spyRemoveItem).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it('should be able to update user', () => {
    const mockData = {
      token: 'token-1234',
      user: {
        id: 'user-id',
        name: 'user-name',
        email: 'user@email.com',
      },
    };

    const updatedUser = {
      id: 'user-id-updated',
      name: 'user-name-updated',
      email: 'user-updated@email.com',
      avatar_url: 'updated-avatar.jpg',
    };

    spyGetItem.mockImplementation(key => {
      switch (key) {
        case '@GoBarber:token':
          return mockData.token;

        case '@GoBarber:user':
          return JSON.stringify(mockData.user);

        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual('user@email.com');

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(spySetItem).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(updatedUser),
    );

    expect(result.current.user).toEqual(updatedUser);
  });
});

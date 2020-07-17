import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import MockAdapter from 'axios-mock-adapter';

import { useAuth, AuthProvider } from '../../hooks/auth';
import api from '../../services/api';

const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
const multiSetSpy = jest.spyOn(AsyncStorage, 'multiSet');
const multiGetSpy = jest.spyOn(AsyncStorage, 'multiGet');
const multiRemoveSpy = jest.spyOn(AsyncStorage, 'multiRemove');

const mockApi = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able get context', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      expect(result.current.user).toBeUndefined();
      expect(result.current.loading).toBe(true);
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
    });
  });

  it('should be able to sign in', async () => {
    const apiResponse = {
      user: {
        id: 'user-id',
        name: 'user-name',
        email: 'user@email.com',
        avatar_url: 'user-avatar.png',
      },
      token: 'user-token',
    };

    mockApi.onPost('/sessions').reply(200, apiResponse);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'user@email.com',
      password: 'user-password',
    });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('user@email.com');

    expect(multiSetSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['@GoBarber:token', apiResponse.token],
        ['@GoBarber:user', JSON.stringify(apiResponse.user)],
      ]),
    );
  });

  it('should be able recover data from AsyncStorage', async () => {
    const mockData = {
      user: {
        id: 'user-id',
        name: 'user-name',
        email: 'user@email.com',
        avatar_url: 'user-avatar.png',
      },
      token: 'user-token',
    };

    multiGetSpy.mockImplementation(
      (keys: string[]): Promise<[string, string | null][]> => {
        return new Promise(resolve => {
          const values = keys.map(key => {
            switch (key) {
              case '@GoBarber:user':
                return ['@GoBarber:user', JSON.stringify(mockData.user)];

              case '@GoBarber:token':
                return ['@GoBarber:token', JSON.stringify(mockData.token)];

              default:
                return [key, null];
            }
          });

          const returningValue = values as [string, string | null][];

          setTimeout(() => {
            resolve(returningValue);
          }, 200);
        });
      },
    );

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitForNextUpdate();

    expect(result.current.user).toEqual(expect.objectContaining(mockData.user));
  });

  it('should be able to sign out', async () => {
    const mockData = {
      user: {
        id: 'user-id',
        name: 'user-name',
        email: 'user@email.com',
        avatar_url: 'user-avatar.png',
      },
      token: 'user-token',
    };

    multiGetSpy.mockImplementation(
      (keys: string[]): Promise<[string, string | null][]> => {
        return new Promise(resolve => {
          const values = keys.map(key => {
            switch (key) {
              case '@GoBarber:user':
                return ['@GoBarber:user', JSON.stringify(mockData.user)];

              case '@GoBarber:token':
                return ['@GoBarber:token', JSON.stringify(mockData.token)];

              default:
                return [key, null];
            }
          });

          const returningValue = values as [string, string | null][];

          setTimeout(() => {
            resolve(returningValue);
          }, 200);
        });
      },
    );

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitForNextUpdate();

    expect(result.current.user).toEqual(expect.objectContaining(mockData.user));

    result.current.signOut();

    expect(multiRemoveSpy).toHaveBeenCalledWith([
      '@GoBarber:token',
      '@GoBarber:user',
    ]);

    await waitForNextUpdate();

    expect(result.current.user).toBeUndefined();
  });

  it('should be able updateProfile', async () => {
    const user = {
      id: 'user-id',
      name: 'user-name',
      email: 'user@email.com',
      avatar_url: 'user-avatar.png',
    };

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.updateUser(user);

    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(user),
    );

    await waitForNextUpdate();

    expect(result.current.user).toEqual(expect.objectContaining(user));
  });
});

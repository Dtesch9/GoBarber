import React from 'react';
import { render, waitFor, fireEvent } from 'react-native-testing-library';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import Dashboard from '../../pages/Dashboard';

const mockUser = {
  id: 'user-id',
  name: 'user-name',
  email: 'user@email.com',
  avatar_url: 'user-avatar.png',
};

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

const mockApi = new MockAdapter(api);

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should be able to render Dashboard page', async () => {
    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    mockApi.onGet('/providers').reply(200, providers);

    const { getByText, getByTestId } = render(<Dashboard />);

    await waitFor(() => {
      expect(getByText('user-name')).toBeTruthy();
    });

    expect(getByText('provider-1')).toBeTruthy();
    expect(getByTestId('provider-provider-id-1-button')).toBeTruthy();

    expect(getByText('provider-2')).toBeTruthy();
    expect(getByTestId('provider-provider-id-2-button')).toBeTruthy();
  });

  it('should be able to display a standad avatar if avatar not provided', async () => {
    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-1',
      },
    ];

    mockApi.onGet('/providers').reply(200, providers);

    const { getByText, getByTestId } = render(<Dashboard />);

    await waitFor(() => {
      expect(getByText('user-name')).toBeTruthy();
    });

    const avatarUrl = getByTestId('avatar-provider-id-1');

    expect(getByText('provider-1')).toBeTruthy();
    expect(getByTestId('provider-provider-id-1-button')).toBeTruthy();
    expect(avatarUrl.props.source.uri).toBe(
      'https://api.adorable.io/avatars/55/abott@adorable.png',
    );
  });

  it('should be able to navigate to profile', async () => {
    const { getByTestId } = render(<Dashboard />);

    const profileButton = getByTestId('profile-button');

    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });
  });

  it('should be able to navigate to create appointment page', async () => {
    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    mockApi.onGet('/providers').reply(200, providers);

    const { getByTestId } = render(<Dashboard />);

    await waitFor(() => {
      getByTestId('provider-provider-id-1-button');
    });

    const providerButton = getByTestId('provider-provider-id-2-button');

    fireEvent.press(providerButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        'CreateAppointment',
        expect.objectContaining({
          providerId: 'provider-id-2',
        }),
      );
    });
  });
});

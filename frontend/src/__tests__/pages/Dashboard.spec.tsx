import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { isToday } from 'date-fns';

import api from '../../services/api';

import Dashboard from '../../pages/Dashboard';

const mockedHistoryPush = jest.fn();
const mockedSignOut = jest.fn();
const mockedAddToast = jest.fn();

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useHistory: () => ({
    push: mockedHistoryPush,
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    signOut: mockedSignOut,
    user: {
      id: 'user-id',
      name: 'John Doe Foo',
      email: 'johndoe@email.com',
      avatar_url: 'image.png',
    },
  }),
}));

jest.mock('../../hooks/toast', () => ({
  useToast: () => ({
    addToast: mockedAddToast,
  }),
}));

const mockIsToday = {
  isToday,
};

const mockedApi = new MockAdapter(api);

describe('Dashboard page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
    mockedSignOut.mockClear();

    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 7, 25, 7).getTime();
    });

    jest.spyOn(mockIsToday, 'isToday').mockImplementation(dateToCompare => {
      return dateToCompare === new Date(2020, 7, 25, 7);
    });
  });

  it('should be able to load the appointments', async () => {
    const meUrl = '/appointments/me';
    const monthAvailabilityUrl = '/providers/user-id/month-availability';

    const ownedAppointments = [
      {
        id: 1,
        date: new Date(2020, 7, 25, 8),
        user: {
          id: 'user-id-1',
          name: 'Jhon',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 2,
        date: new Date(2020, 7, 25, 13),
        user: {
          id: 'user-id-2',
          name: 'Doe',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 3,
        date: new Date(2020, 7, 25, 15),
        user: {
          id: 'user-id-3',
          name: 'Foo',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
    ];

    const monthAvailability = [
      {
        day: '25',
        available: true,
      },
      {
        day: '26',
        available: false,
      },
      {
        day: '27',
        available: true,
      },
    ];

    mockedApi.onGet(meUrl).reply(200, ownedAppointments);
    mockedApi.onGet(monthAvailabilityUrl).reply(200, monthAvailability);

    const { getByText, getAllByText, debug } = render(<Dashboard />);

    await waitFor(() => {
      expect(getByText('Foo')).toBeTruthy();
    });

    expect(getAllByText('Jhon')).toHaveLength(2);
    expect(getAllByText('08:00')).toHaveLength(2);
    expect(getByText('13:00')).toBeTruthy();
    expect(getByText('Doe')).toBeTruthy();
    expect(getByText('Foo')).toBeTruthy();
  });

  it('should be able to sign out', async () => {
    const meUrl = '/appointments/me';
    const monthAvailabilityUrl = '/providers/user-id/month-availability';

    const ownedAppointments = [
      {
        id: 1,
        date: new Date(2020, 7, 25, 8),
        user: {
          id: 'user-id-1',
          name: 'Jhon',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 2,
        date: new Date(2020, 7, 25, 13),
        user: {
          id: 'user-id-2',
          name: 'Doe',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 3,
        date: new Date(2020, 7, 25, 15),
        user: {
          id: 'user-id-3',
          name: 'Foo',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
    ];

    const monthAvailability = [
      {
        day: '25',
        available: true,
      },
      {
        day: '26',
        available: false,
      },
      {
        day: '27',
        available: true,
      },
    ];

    mockedApi.onGet(meUrl).reply(200, ownedAppointments);
    mockedApi.onGet(monthAvailabilityUrl).reply(200, monthAvailability);

    const { getByTestId } = render(<Dashboard />);

    const signOutButton = getByTestId('sign-out-button');

    await act(async () => {
      fireEvent.click(signOutButton);
    });

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalled();
    });
  });

  it('should be able to pick another date', async () => {
    const meUrl = '/appointments/me';
    const monthAvailabilityUrl = '/providers/user-id/month-availability';

    const ownedAppointments = [
      {
        id: 1,
        date: new Date(2020, 7, 25, 8),
        user: {
          id: 'user-id-1',
          name: 'Jhon',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 2,
        date: new Date(2020, 7, 25, 13),
        user: {
          id: 'user-id-2',
          name: 'Doe',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 3,
        date: new Date(2020, 7, 25, 15),
        user: {
          id: 'user-id-3',
          name: 'Foo',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
    ];

    const monthAvailability = [
      {
        day: '25',
        available: true,
      },
      {
        day: '26',
        available: false,
      },
      {
        day: '27',
        available: true,
      },
    ];

    mockedApi.onGet(meUrl).reply(200, ownedAppointments);
    mockedApi.onGet(monthAvailabilityUrl).reply(200, monthAvailability);

    const { getByText } = render(<Dashboard />);

    await act(async () => {
      fireEvent.click(getByText('27'));
    });

    await waitFor(() => {
      expect(getByText('Dia 27 de julho')).toBeTruthy();
    });
  });

  it('should be able to pick another month', async () => {
    const meUrl = '/appointments/me';
    const monthAvailabilityUrl = '/providers/user-id/month-availability';

    const currentDay = new Date(2020, 7, 25);

    const params = {
      year: currentDay.getFullYear(),
      month: currentDay.getMonth() + 1,
    };

    const ownedAppointments = [
      {
        id: 1,
        date: new Date(2020, 7, 25, 8),
        user: {
          id: 'user-id-1',
          name: 'Jhon',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 2,
        date: new Date(2020, 7, 25, 13),
        user: {
          id: 'user-id-2',
          name: 'Doe',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
      {
        id: 3,
        date: new Date(2020, 7, 25, 15),
        user: {
          id: 'user-id-3',
          name: 'Foo',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
    ];

    const nextMonthAppointments = [
      {
        id: 1,
        date: new Date(2020, 8, 8, 8),
        user: {
          id: 'user-id-1',
          name: 'Next Jhon',
          email: 'updated@email.com',
          avatar_url: 'updated-image.png',
        },
      },
    ];

    const monthAvailability = [
      {
        day: '25',
        available: true,
      },
      {
        day: '26',
        available: false,
      },
      {
        day: '27',
        available: true,
      },
      {
        day: '8',
        available: true,
      },
    ];

    mockedApi.onGet(meUrl, { params }).reply(200, ownedAppointments);
    mockedApi.onGet(meUrl).reply(200, nextMonthAppointments);
    mockedApi.onGet(monthAvailabilityUrl).reply(200, monthAvailability);

    const { getByText, container, getAllByText } = render(<Dashboard />);

    const datePicker = container.querySelector('[aria-label="Next Month"]');

    if (datePicker) {
      await act(async () => {
        fireEvent.click(datePicker);
      });
    }

    await act(async () => {
      fireEvent.click(getByText('10'));
    });

    await waitFor(() => {
      expect(getByText('Dia 10 de agosto')).toBeTruthy();
    });

    expect(getAllByText('Nenhum agendamento neste período')).toHaveLength(1);

    expect(getByText('08:00')).toBeTruthy();
    expect(getByText('Next Jhon')).toBeTruthy();
  });
});

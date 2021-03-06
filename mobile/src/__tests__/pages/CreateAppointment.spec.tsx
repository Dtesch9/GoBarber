import React from 'react';
import { render, waitFor, fireEvent } from 'react-native-testing-library';
import MockAdapter from 'axios-mock-adapter';
import { Alert } from 'react-native';

import api from '../../services/api';

import CreateAppointment from '../../pages/CreateAppointment';

const mockUser = {
  id: 'user-id',
  name: 'user-name',
  email: 'user@email.com',
  avatar_url: 'user-avatar.png',
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
  }),
  useRoute: () => ({
    params: {
      providerId: 'provider-id-1',
    },
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: () => null,
}));

const mockApi = new MockAdapter(api);

type MockResponse = [string, string, number, any?];

describe('CreateAppointment page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.reset();

    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 6, 12, 8).getTime();
    });
  });

  it('should be able to render CreateAppointment page', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availability = eachHourArray.map(hour => {
      return {
        hour,
        available: hour % 2 === 0,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    const responses: MockResponse[] = [
      ['GET', 'providers', 200, providers],
      ['GET', 'providers/provider-id-1/day-availability', 200, availability],
    ];

    mockApi.onAny().reply(config => {
      const result = responses.shift();

      const [method, url, ...response] = result as MockResponse;

      if (config.url === url && config.method?.toUpperCase() === method) {
        return response;
      }

      return [500, {}];
    });

    const { getByText } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByText('provider-name-1')).toBeTruthy();
    expect(getByText('provider-name-2')).toBeTruthy();
  });

  it('should be able to select provider showing his day availability', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availabilityOne = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const availabilityTwo = eachHourArray.map(hour => {
      return {
        hour,
        available: hour % 2 === 0,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    const responses: MockResponse[] = [
      ['GET', 'providers', 200, providers],
      ['GET', 'providers/provider-id-1/day-availability', 200, availabilityOne],
      ['GET', 'providers/provider-id-2/day-availability', 200, availabilityTwo],
    ];

    mockApi.onAny().reply(config => {
      const result = responses.shift();

      const [method, url, ...response] = result as MockResponse;

      if (config.url === url && config.method?.toUpperCase() === method) {
        return response;
      }

      return [500, {}];
    });

    const { getByText, getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    expect(getByTestId('morning-hour-container-9')).toHaveStyle({
      opacity: 1,
      backgroundColor: '#3e3b47',
    });
    expect(getByTestId('morning-hour-container-9').props.enabled).toBeTruthy();

    const providerTwoContainer = getByTestId(
      'provider-provider-id-2-container',
    );

    expect(providerTwoContainer).toHaveStyle({
      backgroundColor: '#3e3b47',
    });

    fireEvent.press(providerTwoContainer);

    await waitFor(() => {
      expect(providerTwoContainer).toHaveStyle({
        backgroundColor: '#ff9000',
      });
    });

    expect(getByText('08:00')).toHaveStyle({
      color: '#f4ede8',
    });
    expect(getByText('17:00')).toHaveStyle({
      color: '#f4ede8',
    });

    expect(getByTestId('morning-hour-container-8')).toHaveStyle({
      opacity: 1,
      backgroundColor: '#3e3b47',
    });
    expect(getByTestId('morning-hour-container-8').props.enabled).toBeTruthy();

    expect(getByTestId('morning-hour-container-9')).toHaveStyle({
      opacity: 0.3,
      backgroundColor: '#3e3b47',
    });
    expect(getByTestId('morning-hour-container-9').props.enabled).toBeFalsy();

    expect(getByTestId('afternoon-hour-container-14')).toHaveStyle({
      opacity: 1,
      backgroundColor: '#3e3b47',
    });
    expect(
      getByTestId('afternoon-hour-container-14').props.enabled,
    ).toBeTruthy();

    expect(getByTestId('afternoon-hour-container-17')).toHaveStyle({
      opacity: 0.3,
      backgroundColor: '#3e3b47',
    });
    expect(
      getByTestId('afternoon-hour-container-17').props.enabled,
    ).toBeFalsy();
  });

  it('should be able to create an appointment on available time by the morning', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availability = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    mockApi
      .onGet('providers')
      .reply(200, providers)
      .onGet('providers/provider-id-1/day-availability')
      .reply(200, availability);

    mockApi.onPost('/appointments').reply(200);

    const { getByText, getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    const nineHourContainer = getByTestId('morning-hour-container-9');

    expect(nineHourContainer).toHaveStyle({
      opacity: 1,
      backgroundColor: '#3e3b47',
    });
    expect(nineHourContainer.props.enabled).toBeTruthy();

    fireEvent.press(nineHourContainer);

    expect(nineHourContainer.props.selected).toBeTruthy();
    expect(nineHourContainer).toHaveStyle({ backgroundColor: '#ff9000' });

    const bookAppointmentButton = getByText('Agendar');

    fireEvent.press(bookAppointmentButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith(
        expect.objectContaining({
          routes: [
            {
              name: 'AppointmentCreated',
              params: { date: expect.any(Number) },
            },
          ],
          index: 0,
        }),
      );
    });
  });

  it('should be able to create an appointment on available time by the afternoon', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availability = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    mockApi
      .onGet('providers')
      .reply(200, providers)
      .onGet('providers/provider-id-1/day-availability')
      .reply(200, availability);

    mockApi.onPost('/appointments').reply(200);

    const { getByText, getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    const sixteenHourContainer = getByTestId('afternoon-hour-container-16');

    expect(sixteenHourContainer).toHaveStyle({
      opacity: 1,
      backgroundColor: '#3e3b47',
    });
    expect(sixteenHourContainer.props.enabled).toBeTruthy();

    fireEvent.press(sixteenHourContainer);

    expect(sixteenHourContainer.props.selected).toBeTruthy();
    expect(sixteenHourContainer).toHaveStyle({ backgroundColor: '#ff9000' });

    const bookAppointmentButton = getByText('Agendar');

    fireEvent.press(bookAppointmentButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith(
        expect.objectContaining({
          routes: [
            {
              name: 'AppointmentCreated',
              params: { date: expect.any(Number) },
            },
          ],
          index: 0,
        }),
      );
    });
  });

  it('should not display DatePicker automatically on android', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availability = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    mockApi
      .onGet('providers')
      .reply(200, providers)
      .onGet('providers/provider-id-1/day-availability')
      .reply(200, availability);

    mockApi.onPost('/appointments').reply(200);

    const { getByText, getByTestId, queryByTestId } = render(
      <CreateAppointment />,
    );

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    const sixteenHourContainer = getByTestId('afternoon-hour-container-16');

    fireEvent.press(sixteenHourContainer);

    expect(sixteenHourContainer.props.selected).toBeTruthy();
    expect(sixteenHourContainer).toHaveStyle({ backgroundColor: '#ff9000' });

    expect(queryByTestId('date-picker')).toBeNull();

    const bookAppointmentButton = getByText('Agendar');

    fireEvent.press(bookAppointmentButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith(
        expect.objectContaining({
          routes: [
            {
              name: 'AppointmentCreated',
              params: { date: expect.any(Number) },
            },
          ],
          index: 0,
        }),
      );
    });
  });

  it('should display an error if create appointment fails', async () => {
    const spyAlert = jest.spyOn(Alert, 'alert');

    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availability = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    mockApi
      .onGet('providers')
      .reply(200, providers)
      .onGet('providers/provider-id-1/day-availability')
      .reply(200, availability);

    mockApi.onPost('/appointments').reply(500);

    const { getByText, getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    const nineHourContainer = getByTestId('morning-hour-container-9');

    fireEvent.press(nineHourContainer);

    expect(nineHourContainer.props.selected).toBeTruthy();
    expect(nineHourContainer).toHaveStyle({ backgroundColor: '#ff9000' });

    fireEvent.press(getByText('Agendar'));

    await waitFor(() => {
      expect(spyAlert).toHaveBeenCalledWith(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar agendamento, tente novamente',
      );
    });
  });

  it('should be able to display a standard avatar if avatar not provided', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availabilityOne = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: '',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    const responses: MockResponse[] = [
      ['GET', 'providers', 200, providers],
      ['GET', 'providers/provider-id-1/day-availability', 200, availabilityOne],
    ];

    mockApi.onAny().reply(config => {
      const result = responses.shift();

      const [method, url, ...response] = result as MockResponse;

      if (config.url === url && config.method?.toUpperCase() === method) {
        return response;
      }

      return [500, {}];
    });

    const { getByText, getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    const providerAvatar = getByTestId('provider-provider-id-1-avatar');

    expect(providerAvatar.props.source.uri).toBe(
      'https://api.adorable.io/avatars/55/abott@adorable.png',
    );
  });

  it('should be able to change date from DatePicker', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    const availabilityOne = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const availabilityTwo = eachHourArray.map(hour => {
      return {
        hour,
        available: hour % 2 === 0,
      };
    });

    const responses: MockResponse[] = [
      ['GET', 'providers', 200, providers],
      ['GET', 'providers/provider-id-1/day-availability', 200, availabilityOne],
      ['GET', 'providers/provider-id-1/day-availability', 200, availabilityTwo],
    ];

    mockApi.onAny().reply(config => {
      const result = responses.shift();

      const [method, url, ...response] = result as MockResponse;

      const exceptionCase = config.url === 'providers';

      if (exceptionCase) {
        if (config.url === url && config.method?.toUpperCase() === method) {
          return response;
        }
      }

      if (config.params.day === 12 || config.params.day === 13) {
        if (config.url === url && config.method?.toUpperCase() === method) {
          return response;
        }
      }

      return [500, {}];
    });

    const { getByTestId, getByText } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    expect(getByTestId('morning-hour-container-8')).toHaveStyle({ opacity: 1 });
    expect(getByTestId('morning-hour-container-8').props.enabled).toBeTruthy();

    expect(getByTestId('morning-hour-container-9')).toHaveStyle({ opacity: 1 });
    expect(getByTestId('morning-hour-container-9').props.enabled).toBeTruthy();

    expect(getByTestId('afternoon-hour-container-17')).toHaveStyle({
      opacity: 1,
    });
    expect(
      getByTestId('afternoon-hour-container-17').props.enabled,
    ).toBeTruthy();

    fireEvent.press(getByText('Selecionar outra Data'));

    const datePicker = getByTestId('date-picker');

    expect(datePicker).toBeTruthy();

    await waitFor(() => {
      fireEvent(datePicker, 'onChange', {
        type: 'change',
        nativeEvent: {
          timestamp: new Date(2020, 6, 13).getTime(),
        },
      });
    });

    expect(getByTestId('morning-hour-container-8')).toHaveStyle({ opacity: 1 });
    expect(getByTestId('morning-hour-container-8').props.enabled).toBeTruthy();

    expect(getByTestId('morning-hour-container-9')).toHaveStyle({
      opacity: 0.3,
    });
    expect(getByTestId('morning-hour-container-9').props.enabled).toBeFalsy();

    expect(getByTestId('afternoon-hour-container-17')).toHaveStyle({
      opacity: 0.3,
    });
    expect(
      getByTestId('afternoon-hour-container-17').props.enabled,
    ).toBeFalsy();
  });

  it('should not be able to select an unavailable day', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availabilityOne = eachHourArray.map(hour => {
      return {
        hour,
        available: false,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: 'provider-1-avatar.png',
      },
      {
        id: 'provider-id-2',
        name: 'provider-name-2',
        avatar_url: 'provider-2-avatar.png',
      },
    ];

    const responses: MockResponse[] = [
      ['GET', 'providers', 200, providers],
      ['GET', 'providers/provider-id-1/day-availability', 200, availabilityOne],
    ];

    mockApi.onAny().reply(config => {
      const result = responses.shift();

      const [method, url, ...response] = result as MockResponse;

      if (config.url === url && config.method?.toUpperCase() === method) {
        return response;
      }

      return [500, {}];
    });

    const { getByText, getByTestId } = render(<CreateAppointment />);

    await waitFor(() => {
      expect(getByText('Cabeleireiros')).toBeTruthy();
    });

    expect(getByTestId('provider-provider-id-1-container')).toHaveStyle({
      backgroundColor: '#ff9000',
    });

    const nineHourContainer = getByTestId('morning-hour-container-9');

    expect(nineHourContainer).toHaveStyle({
      opacity: 0.3,
      backgroundColor: '#3e3b47',
    });
    expect(nineHourContainer.props.enabled).toBeFalsy();

    fireEvent.press(nineHourContainer);

    expect(nineHourContainer.props.selected).toBeFalsy();
    expect(nineHourContainer).not.toHaveStyle({ backgroundColor: '#ff9000' });
  });

  it('should be able to navigate to previous screen by pressing back button', async () => {
    const hourStart = 8;

    const eachHourArray = Array.from(
      { length: 10 },
      (_, index) => index + hourStart,
    );

    const availabilityOne = eachHourArray.map(hour => {
      return {
        hour,
        available: true,
      };
    });

    const providers = [
      {
        id: 'provider-id-1',
        name: 'provider-name-1',
        avatar_url: '',
      },
    ];

    const responses: MockResponse[] = [
      ['GET', 'providers', 200, providers],
      ['GET', 'providers/provider-id-1/day-availability', 200, availabilityOne],
    ];

    mockApi.onAny().reply(config => {
      const result = responses.shift();

      const [method, url, ...response] = result as MockResponse;

      if (config.url === url && config.method?.toUpperCase() === method) {
        return response;
      }

      return [500, {}];
    });

    const { getByTestId } = render(<CreateAppointment />);

    const backButton = getByTestId('back-button');

    fireEvent.press(backButton);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });
});

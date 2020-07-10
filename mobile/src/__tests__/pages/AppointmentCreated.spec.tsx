import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';

import AppointmentCreated from '../../pages/AppointmentCreated';

const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    reset: mockReset,
  }),
  useRoute: () => ({
    params: {
      date: new Date(2020, 9, 12, 12, 12),
    },
  }),
}));

jest.mock('date-fns', () => ({
  format: jest
    .fn()
    .mockReturnValue('Segunda, dia 12 de outubro de 2020 ás 12:12h'),
}));

describe('AppointmentCreated page', () => {
  it('should be able to render appointment created page', () => {
    const { getByText } = render(<AppointmentCreated />);

    expect(getByText('OK')).toBeTruthy();
    expect(
      getByText('Segunda, dia 12 de outubro de 2020 ás 12:12h'),
    ).toBeTruthy();
  });

  it('should be able to navigate to dashboard', () => {
    const { getByText } = render(<AppointmentCreated />);

    const okButton = getByText('OK');

    fireEvent.press(okButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import ResetPassword from '../../pages/ResetPassword';

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();

let mockedSearchValue = '';

const mockedApi = new MockAdapter(api);

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockedHistoryPush,
  }),
  useLocation: () => ({
    search: mockedSearchValue,
  }),
}));

jest.mock('../../hooks/toast', () => ({
  useToast: () => ({
    addToast: mockedAddToast,
  }),
}));

describe('Reset Password page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();

    mockedSearchValue = '?token=mocked-token';
  });

  it('should render ResetPassword page', () => {
    const { debug } = render(<ResetPassword />);

    expect(debug).toBeTruthy();
  });

  it('should be able to reset the password', async () => {
    mockedApi.onPost('/password/reset').reply(200);

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const newPasswordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );

    fireEvent.change(newPasswordField, { target: { value: 'new-password' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'new-password' },
    });

    const resetButton = getByText('Alterar senha');

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
    });
  });

  it('should not be able to reset the password without token', async () => {
    mockedSearchValue = '';

    mockedApi.onPost('/password/reset').reply(200);

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const newPasswordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );

    fireEvent.change(newPasswordField, { target: { value: 'new-password' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'new-password' },
    });

    const resetButton = getByText('Alterar senha');

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });

  it('should be able to reset the password invalid Credentials', async () => {
    mockedApi.onPost('/password/reset').reply(200);

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const newPasswordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );

    fireEvent.change(newPasswordField, { target: { value: 'invalid' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'invalid-credential' },
    });

    const resetButton = getByText('Alterar senha');

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });
});

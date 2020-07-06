import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import api from '../../services/api';

import SignUp from '../../pages/SignUp';

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();

const mockedApi = new MockAdapter(api);

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockedHistoryPush,
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../hooks/toast', () => ({
  useToast: () => ({
    addToast: mockedAddToast,
  }),
}));

describe('SignUp Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
  });

  it('should be able to sign up', async () => {
    mockedApi.onPost('/users').reply(200);

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');

    const submitButton = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'user-name' } });
    fireEvent.change(emailField, { target: { value: 'user@email.com' } });
    fireEvent.change(passwordField, { target: { value: 'user-password' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');

      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  it('should not be able to sign up with not valid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');

    const submitButton = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'user-name' } });
    fireEvent.change(emailField, { target: { value: 'not-valid-email' } });
    fireEvent.change(passwordField, { target: { value: 'user-password' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should display an toast error message', async () => {
    mockedApi.onPost('/users').reply(500, () => {
      throw new Error();
    });

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');

    const submitButton = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'user-name' } });
    fireEvent.change(emailField, { target: { value: 'user@email.com' } });
    fireEvent.change(passwordField, { target: { value: 'user-password' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();

      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });
});

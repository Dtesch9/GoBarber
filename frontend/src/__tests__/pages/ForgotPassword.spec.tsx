import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import ForgotPassword from '../../pages/ForgotPassword';

const mockedAddToast = jest.fn();

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../hooks/toast', () => ({
  useToast: () => ({
    addToast: mockedAddToast,
  }),
}));

const mockedApi = new MockAdapter(api);

describe('Forgot Password Page', () => {
  beforeEach(() => {
    mockedAddToast.mockClear();
  });

  it('should render ForgotPassword', () => {
    const { debug } = render(<ForgotPassword />);

    expect(debug).toBeTruthy();
  });

  it('should be able to send a forgot password email', async () => {
    mockedApi.onPost('/password/forgot').reply(200);

    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const recoverButton = getByText('Recuperar');

    fireEvent.change(emailField, { target: { value: 'user@email.com' } });

    fireEvent.click(recoverButton);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  it('should not be able to send forgot password email with invalid credential', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const recoverButton = getByText('Recuperar');

    fireEvent.change(emailField, { target: { value: 'invalid-credential' } });

    fireEvent.click(recoverButton);

    await waitFor(() => {
      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });

  it('should not be able to send forgot password email with non existing email', async () => {
    mockedApi.onPost('/password/forgot').reply(400, () => {
      throw new Error();
    });

    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailField = getByPlaceholderText('E-mail');
    const recoverButton = getByText('Recuperar');

    fireEvent.change(emailField, {
      target: { value: 'non-existing@email.com' },
    });

    fireEvent.click(recoverButton);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });
});

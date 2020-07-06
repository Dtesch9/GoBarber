import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';

import Profile from '../../pages/Profile';

const mockedHistoryPush = jest.fn();
const mockedUpdateUser = jest.fn();
const mockedAddToast = jest.fn();

const updatedAvatar = {
  id: 'id',
  name: 'updated-name',
  email: 'updated@email.com',
  avatar_url: 'updated-image.png',
};

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useHistory: () => ({
    push: mockedHistoryPush,
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    updateUser: mockedUpdateUser,
    user: {
      id: 'id',
      name: 'John Doe',
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

const mockedApi = new MockAdapter(api);

describe('Profile page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
    mockedUpdateUser.mockClear();
  });

  it('should render Profile page', () => {
    const { debug } = render(<Profile />);

    expect(debug).toBeTruthy();
  });

  it('should be able to update avatar', async () => {
    const file = new File([''], 'updated-image.jpg');

    mockedApi.onPatch('/users/avatar').reply(200, updatedAvatar);

    const { getByTestId } = render(<Profile />);

    const avatarInput = getByTestId('avatar-input');

    fireEvent.change(avatarInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalledWith(updatedAvatar);

      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  it('should be able to update name and email', async () => {
    mockedApi.onPut('/profile').reply(200, updatedAvatar);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'updated-name' } });
    fireEvent.change(emailField, { target: { value: 'updated@email.com' } });

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'updated-name',
          email: 'updated@email.com',
        }),
      );

      expect(mockedHistoryPush).toHaveBeenCalledWith('/dashboard');

      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  it('should be able to update password if old_password informed', async () => {
    mockedApi.onPut('/profile').reply(200, updatedAvatar);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const oldPasswordField = getByPlaceholderText('Senha atual');
    const newPasswordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText('Confirmar senha');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.change(oldPasswordField, { target: { value: 'updated-name' } });
    fireEvent.change(newPasswordField, {
      target: { value: 'new-password' },
    });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'new-password' },
    });

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/dashboard');

      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  it('should not be able to update profile with non valid credentials', async () => {
    mockedApi.onPut('/profile').reply(200, updatedAvatar);

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.change(nameField, { target: { value: 'updated-name' } });
    fireEvent.change(emailField, { target: { value: 'non-valid-credential' } });

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();

      expect(mockedAddToast).not.toHaveBeenCalled();
    });
  });

  it('should not be able to update profile with non existing credentials', async () => {
    mockedApi.onPut('/profile').reply(401, () => {
      throw new Error();
    });

    const { getByPlaceholderText, getByText } = render(<Profile />);

    const oldPasswordField = getByPlaceholderText('Senha atual');
    const newPasswordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText('Confirmar senha');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.change(oldPasswordField, {
      target: { value: 'non-existing-password' },
    });
    fireEvent.change(newPasswordField, {
      target: { value: 'new-password' },
    });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'new-password' },
    });

    fireEvent.click(confirmButton);

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

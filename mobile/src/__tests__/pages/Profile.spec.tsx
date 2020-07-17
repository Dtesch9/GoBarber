import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import { Alert } from 'react-native';
import MockAdapter from 'axios-mock-adapter';
import ImagePicker, { ImagePickerResponse } from 'react-native-image-picker';

import api from '../../services/api';

import Profile from '../../pages/Profile';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockUpdateUser = jest.fn();
const mockSignOut = jest.fn();
const mockImagePickerCallback = {} as ImagePickerResponse;

const mockUser = {
  id: 'user-id',
  name: 'user-name',
  email: 'user@email.com',
  avatar_url: 'user-avatar.png',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    user: mockUser,
    updateUser: mockUpdateUser,
    signOut: mockSignOut,
  }),
}));

jest.mock('react-native-image-picker', () => ({
  showImagePicker: jest.fn((option, callback) =>
    callback(mockImagePickerCallback),
  ),
}));

const mockGlobalFormData = jest.fn(() => ({
  append: jest.fn(),
}));

global.FormData = mockGlobalFormData;

const spyAlert = jest.spyOn(Alert, 'alert');

const mockApi = new MockAdapter(api);

describe('Profile page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.assign(mockImagePickerCallback, {
      didCancel: false,
      error: '',
      fileName: 'image.jpg',
      uri: 'file:///path/locale/image.jpg',
    });
  });

  it('should be able to render Profile page', () => {
    const { getByPlaceholder } = render(<Profile />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');
    const oldPasswordInput = getByPlaceholder('Senha atual');
    const newPasswordInput = getByPlaceholder('Nova senha');
    const passwordConfirmationInput = getByPlaceholder('Confirmar senha');

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(oldPasswordInput).toBeTruthy();
    expect(newPasswordInput).toBeTruthy();
    expect(passwordConfirmationInput).toBeTruthy();
  });

  it('should be able to update name and email', async () => {
    const updatedUser = {
      id: 'user-id',
      name: 'new-user-name',
      email: 'new-user@email.com',
      avatar_url: 'user-avatar.png',
    };

    mockApi.onPut('/profile').reply(200, updatedUser);

    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.changeText(nameInput, 'new-user-name');
    fireEvent(nameInput, 'onSubmitEditing');

    fireEvent.changeText(emailInput, 'new-user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining(updatedUser),
      );

      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');

      expect(spyAlert).toHaveBeenCalledWith(
        'Perfil atualizado com sucesso!',
        'Suas informaçõas do perfil foram atualizadas com sucesso!',
      );
    });
  });

  it('should be able to update password', async () => {
    const updatedUser = {
      id: 'user-id',
      name: 'user-name',
      email: 'user@email.com',
      avatar_url: 'user-avatar.png',
    };

    mockApi.onPut('/profile').reply(200, updatedUser);

    const { getByPlaceholder } = render(<Profile />);

    const oldPasswordInput = getByPlaceholder('Senha atual');
    const newPasswordInput = getByPlaceholder('Nova senha');
    const passwordConfirmationInput = getByPlaceholder('Confirmar senha');

    fireEvent.changeText(oldPasswordInput, 'old-password');
    fireEvent(oldPasswordInput, 'onSubmitEditing');

    fireEvent.changeText(newPasswordInput, 'new-password');
    fireEvent(newPasswordInput, 'onSubmitEditing');

    fireEvent.changeText(passwordConfirmationInput, 'new-password');
    fireEvent(passwordConfirmationInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining(updatedUser),
      );

      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');

      expect(spyAlert).toHaveBeenCalledWith(
        'Perfil atualizado com sucesso!',
        'Suas informaçõas do perfil foram atualizadas com sucesso!',
      );
    });
  });

  it('should not be able to update profile with invalid credentials', async () => {
    const { getByPlaceholder, getByText } = render(<Profile />);

    const oldPasswordInput = getByPlaceholder('Senha atual');
    const newPasswordInput = getByPlaceholder('Nova senha');
    const passwordConfirmationInput = getByPlaceholder('Confirmar senha');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.changeText(oldPasswordInput, 'old-password');
    fireEvent(oldPasswordInput, 'onSubmitEditing');

    fireEvent.changeText(newPasswordInput, 'new-password');
    fireEvent(newPasswordInput, 'onSubmitEditing');

    fireEvent.changeText(passwordConfirmationInput, 'wrong-confirmation');
    fireEvent(passwordConfirmationInput, 'onSubmitEditing');

    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockUpdateUser).not.toHaveBeenCalled();

      expect(mockNavigate).not.toHaveBeenCalled();

      expect(spyAlert).not.toHaveBeenCalled();
    });
  });

  it('should display an error when update profile fails', async () => {
    mockApi.onPut('/profile').reply(401);

    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');

    const confirmButton = getByText('Confirmar mudanças');

    fireEvent.changeText(nameInput, 'new-user-name');
    fireEvent(nameInput, 'onSubmitEditing');

    fireEvent.changeText(emailInput, 'new-user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockUpdateUser).not.toHaveBeenCalled();

      expect(mockNavigate).not.toHaveBeenCalled();

      expect(spyAlert).toHaveBeenCalledWith(
        'Erro na atualização',
        'Ocorreu um erro ao atualizar perfil, tente novamente',
      );
    });
  });

  it('should be able to log out when pressing logout button', () => {
    const { getByText } = render(<Profile />);

    const logoutButton = getByText('Logout');

    fireEvent.press(logoutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('should be able to go back when pressing goBack button', () => {
    const { getByTestId } = render(<Profile />);

    const goBackButton = getByTestId('go-back-button');

    fireEvent.press(goBackButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('should be able to update avatar', async () => {
    mockApi.onPatch('/users/avatar').reply(200, mockUser);

    const { getByTestId } = render(<Profile />);

    const userAvatarButton = getByTestId('user-avatar-button');

    fireEvent.press(userAvatarButton);

    await waitFor(() => {
      expect(ImagePicker.showImagePicker).toHaveBeenCalledTimes(1);

      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining(mockUser),
      );
    });
  });

  it('should not be able to update avatar if cancelled', async () => {
    mockImagePickerCallback.didCancel = true;

    const { getByTestId } = render(<Profile />);

    const userAvatarButton = getByTestId('user-avatar-button');

    fireEvent.press(userAvatarButton);

    await waitFor(() => {
      expect(ImagePicker.showImagePicker).toHaveBeenCalledTimes(1);

      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  it('should not be able to update avatar if receive ImagePicker error', async () => {
    mockImagePickerCallback.error = 'Any-type-of-error';

    const { getByTestId } = render(<Profile />);

    const userAvatarButton = getByTestId('user-avatar-button');

    fireEvent.press(userAvatarButton);

    await waitFor(() => {
      expect(ImagePicker.showImagePicker).toHaveBeenCalledTimes(1);

      expect(mockUpdateUser).not.toHaveBeenCalled();

      expect(spyAlert).toHaveBeenCalledWith(
        'Erro ao atualizar seu avatar',
        'Any-type-of-error',
      );
    });
  });

  it('should display an erro if api call fails', async () => {
    mockApi.onPatch('/users/avatar').reply(401);

    const { getByTestId } = render(<Profile />);

    const userAvatarButton = getByTestId('user-avatar-button');

    fireEvent.press(userAvatarButton);

    await waitFor(() => {
      expect(ImagePicker.showImagePicker).toHaveBeenCalledTimes(1);

      expect(mockUpdateUser).not.toHaveBeenCalled();

      expect(spyAlert).toHaveBeenCalledWith(
        'Ocorreu um erro',
        'Tente novamente',
      );
    });
  });

  it('should KeyboardAvoidingView to have behavior undefined on android', () => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'android',
      select: () => null,
    }));

    const { UNSAFE_queryByProps } = render(<Profile />);

    expect(UNSAFE_queryByProps({ behavior: undefined })).toBeTruthy();
  });
});

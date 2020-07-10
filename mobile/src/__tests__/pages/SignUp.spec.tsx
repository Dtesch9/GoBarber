import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import MockAdapter from 'axios-mock-adapter';
import { Alert } from 'react-native';

import api from '../../services/api';
import SignUp from '../../pages/SignUp';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

const mockApi = new MockAdapter(api);

describe('SignUp page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to render sign up page', () => {
    const { getByPlaceholder } = render(<SignUp />);

    expect(getByPlaceholder('Nome')).toBeTruthy();
    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
  });

  it('should be able to sign up', async () => {
    mockApi.onPost('/users').reply(200);

    const spyAlert = jest.spyOn(Alert, 'alert');

    const { getByPlaceholder } = render(<SignUp />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    fireEvent(nameInput, 'onChangeText', 'user-name');
    fireEvent(nameInput, 'onSubmitEditing');

    fireEvent(emailInput, 'onChangeText', 'user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(spyAlert).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso!',
        'Você já pode fazer login na aplicação',
      );

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should not be able to sign up with invalid credentials', async () => {
    mockApi.onPost('/users').reply(401);

    const spyAlert = jest.spyOn(Alert, 'alert');

    const { getByPlaceholder } = render(<SignUp />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    fireEvent(nameInput, 'onChangeText', 'user-name');
    fireEvent(nameInput, 'onSubmitEditing');

    fireEvent(emailInput, 'onChangeText', 'invalid-email');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(spyAlert).not.toHaveBeenCalled();

      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  it('should display an error if sign in fails', async () => {
    mockApi.onPost('/users').reply(401);

    const spyAlert = jest.spyOn(Alert, 'alert');

    const { getByPlaceholder } = render(<SignUp />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    fireEvent(nameInput, 'onChangeText', 'user-name');
    fireEvent(nameInput, 'onSubmitEditing');

    fireEvent(emailInput, 'onChangeText', 'user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(mockGoBack).not.toHaveBeenCalled();

      expect(spyAlert).toHaveBeenCalledWith(
        'Erro no cadastro!',
        'Ocorreu um erro ao fazer cadastro, tente novamente',
      );
    });
  });

  it('should be able to sign in by pressing submit button', async () => {
    mockApi.onPost('/users').reply(200);

    const spyAlert = jest.spyOn(Alert, 'alert');

    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameInput = getByPlaceholder('Nome');
    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    const submitButton = getByText('Criar');

    fireEvent(nameInput, 'onChangeText', 'user-name');
    fireEvent(nameInput, 'onSubmitEditing');

    fireEvent(emailInput, 'onChangeText', 'user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(spyAlert).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso!',
        'Você já pode fazer login na aplicação',
      );

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should be able to navigate to sign in when pressing BackToSinInButton', async () => {
    const { getByText } = render(<SignUp />);

    const submitButton = getByText('Voltar para logon');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});

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

  it('should be able to render sign up component', () => {
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
});

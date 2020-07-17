import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import { Alert } from 'react-native';

import SignIn from '../../pages/SignIn';

const mockNavigate = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

describe('SignIn page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to render sign in page', () => {
    const { getByPlaceholder } = render(<SignIn />);

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
  });

  it('should be able to sign in', async () => {
    const { getByPlaceholder } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    fireEvent(emailInput, 'onChangeText', 'user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@email.com',
          password: 'user-password',
        }),
      );
    });
  });

  it('should display an error if sign in fails', async () => {
    mockSignIn.mockImplementation(() => {
      throw new Error();
    });

    const spyAlert = jest.spyOn(Alert, 'alert');

    const { getByPlaceholder } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    fireEvent(emailInput, 'onChangeText', 'user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(
      () => {
        expect(mockSignIn).toHaveBeenCalled();

        expect(spyAlert).toHaveBeenCalledWith(
          'Erro na autenticação',
          'Ocorreu um erro ao fazer login, cheque suas credenciais',
        );
      },
      { timeout: 200 },
    );
  });

  it('should be not able to sign in with not valid credentials', async () => {
    const { getByPlaceholder } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    fireEvent(emailInput, 'onChangeText', 'invalid-email');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(
      () => {
        expect(mockSignIn).not.toHaveBeenCalled();
      },
      { timeout: 200 },
    );
  });

  it('should be able to sign in by pressing submit button', async () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    const submitButton = getByText('Entrar');

    fireEvent(emailInput, 'onChangeText', 'user@email.com');
    fireEvent(emailInput, 'onSubmitEditing');

    fireEvent(passwordInput, 'onChangeText', 'user-password');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@email.com',
          password: 'user-password',
        }),
      );
    });
  });

  it('should be able to navigate to sign in when pressing CreateAccountButton', () => {
    const { getByTestId } = render(<SignIn />);

    const createAccountButton = getByTestId('create-account-button');

    fireEvent.press(createAccountButton);

    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });

  it('should be able to navigate to password forgot when pressing ForgotPasswordButton', () => {
    const { getByTestId } = render(<SignIn />);

    const createAccountButton = getByTestId('forgot-password-button');

    fireEvent.press(createAccountButton);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should KeyboardAvoidingView to have behavior undefined on android', () => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'android',
      select: () => null,
    }));

    const { UNSAFE_queryByProps, getByPlaceholder } = render(<SignIn />);

    const inputElement = getByPlaceholder('Senha');

    fireEvent(inputElement, 'focus');

    expect(UNSAFE_queryByProps({ behavior: undefined })).toBeTruthy();
  });
});

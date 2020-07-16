import React, { RefObject } from 'react';
import { TextInput } from 'react-native';
import { render, fireEvent, waitFor } from 'react-native-testing-library';

import Input from '../../components/Input';

interface RegisterFieldParams {
  name: string;
  ref: string;
  setValue?(): void;
  clearValue?(): void;
}

const mockRegisterField = jest.fn(
  ({ name, ref, setValue, clearValue }: RegisterFieldParams) => {
    if (setValue) {
      setValue();
    }

    if (clearValue) {
      clearValue();
    }
  },
);

jest.mock('@unform/core', () => ({
  useField: () => ({
    registerField: mockRegisterField,
    defaultValue: '',
    fieldName: '',
    error: '',
  }),
}));

describe('Input component', () => {
  it('should be able to render button component', () => {
    const { getByPlaceholder } = render(
      <Input name="test" icon="airplay" placeholder="test-input" />,
    );

    const testInput = getByPlaceholder('test-input');

    expect(testInput).toBeTruthy();
  });

  it('should be able to highlight the component when input is focused', () => {
    const { getByPlaceholder, getByTestId } = render(
      <Input name="name" icon="airplay" placeholder="Test input" />,
    );

    const inputElement = getByPlaceholder('Test input');

    fireEvent(inputElement, 'focus');

    expect(getByTestId('input-container')).toHaveStyle({
      borderColor: '#ff9000',
    });
    expect(getByTestId('input-icon')).toHaveStyle({
      color: '#ff9000',
    });
    expect(inputElement).toBeTruthy();
  });

  it('should be able keep input icon highlight when input is filled', () => {
    const { getByPlaceholder, getByTestId } = render(
      <Input name="name" icon="airplay" placeholder="Test input" />,
    );

    const inputElement = getByPlaceholder('Test input');
    const inputIcon = getByTestId('input-icon');

    fireEvent(inputElement, 'focus');

    expect(getByTestId('input-container')).toHaveStyle({
      borderColor: '#ff9000',
    });
    expect(inputIcon).toHaveStyle({
      color: '#ff9000',
    });

    fireEvent.changeText(inputElement, 'is Filled');
    fireEvent(inputElement, 'blur');

    expect(getByTestId('input-container')).toHaveStyle({
      borderColor: '#232129',
    });
    expect(inputIcon).toHaveStyle({
      color: '#ff9000',
    });
  });
});

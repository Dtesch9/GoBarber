import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';

import Toast from '../../../components/ToastContainer/Toast';

const mockRemoveToast = jest.fn();

jest.mock('../../../hooks/toast', () => ({
  useToast: () => ({
    removeToast: mockRemoveToast,
  }),
}));

jest.useFakeTimers();

describe('Toast Component', () => {
  beforeEach(() => {
    mockRemoveToast.mockClear();
  });

  it('should be able to render Toast component', () => {
    const toastMessage = {
      id: '1',
      title: 'Test toast',
    };

    const { getByText } = render(
      <Toast key="1" message={toastMessage} style={{ opacity: 1 }} />,
    );

    expect(getByText('Test toast')).toBeTruthy();
  });

  it('should be able to display description', () => {
    const toastMessage = {
      id: '1',
      title: 'Test toast',
      description: 'Display toast description',
    };

    const { getByText } = render(
      <Toast key="1" message={toastMessage} style={{ opacity: 1 }} />,
    );

    expect(getByText('Display toast description')).toBeTruthy();
  });

  it('should be able to dismiss toast after 3000ms', async () => {
    const toastMessage = {
      id: '1',
      title: 'Test toast',
      description: 'Display toast description',
    };

    const { getByText } = render(
      <Toast key="1" message={toastMessage} style={{ opacity: 1 }} />,
    );

    expect(getByText('Display toast description')).toBeTruthy();
    expect(mockRemoveToast).not.toHaveBeenCalled();

    jest.runAllTimers();

    await waitFor(() => {
      expect(mockRemoveToast).toHaveBeenCalledWith('1');
      expect(mockRemoveToast).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to dismiss toast by clicking on close button', async () => {
    const toastMessage = {
      id: '1',
      title: 'Test toast',
      description: 'Display toast description',
    };

    const { getByText, getByTestId } = render(
      <Toast key="1" message={toastMessage} style={{ opacity: 1 }} />,
    );

    const closeToastButton = getByTestId('close-toast-button');

    await act(async () => {
      fireEvent.click(closeToastButton);
    });

    expect(getByText('Display toast description')).toBeTruthy();

    await waitFor(() => {
      expect(mockRemoveToast).toHaveBeenCalledWith('1');
    });
  });
});

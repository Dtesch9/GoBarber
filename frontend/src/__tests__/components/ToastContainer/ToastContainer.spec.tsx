import React from 'react';
import { render } from '@testing-library/react';

import ToastContainer from '../../../components/ToastContainer';

describe('Toast Container Component', () => {
  it('should be able to render ToastContainer component', () => {
    const toastMessages = [
      {
        id: '1',
        title: 'Test toast',
        description: 'Display toast description',
      },
    ];

    const { getByTestId } = render(<ToastContainer messages={toastMessages} />);

    expect(getByTestId('toast-container')).toBeTruthy();
  });

  it('should be able to display all messages', () => {
    const toastMessages = [
      {
        id: '1',
        title: 'Test toast',
        description: 'Display toast description',
      },
      {
        id: '2',
        title: 'Test toast2',
        description: 'Display toast description',
      },
    ];

    const { getByTestId, getAllByText } = render(
      <ToastContainer messages={toastMessages} />,
    );

    expect(getByTestId('toast-container')).toBeTruthy();

    expect(getAllByText('Display toast description')).toHaveLength(2);
  });
});

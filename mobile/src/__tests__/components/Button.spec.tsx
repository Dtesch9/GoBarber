import React from 'react';
import { render } from 'react-native-testing-library';

import Button from '../../components/Button';

describe('Button component', () => {
  it('should be able to render button component', () => {
    const { getByText } = render(<Button>Button Test</Button>);

    expect(getByText('Button Test')).toBeTruthy();
  });
});

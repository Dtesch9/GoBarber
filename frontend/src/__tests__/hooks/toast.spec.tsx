import { renderHook, act } from '@testing-library/react-hooks';
import { uuid } from 'uuidv4';

import { useToast, ToastProvider } from '../../hooks/toast';

const uuidSpy = {
  uuid,
};

describe('Toast Hook', () => {
  it('should be able to use hooks', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ToastProvider,
    });

    expect(typeof result.current.addToast).toBe('function');
    expect(typeof result.current.removeToast).toBe('function');
  });

  it('should be able to add toast', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ToastProvider,
    });

    const mockAddToast = jest.spyOn(result.current, 'addToast');

    act(() => {
      result.current.addToast({
        title: 'Toast Test',
      });
    });

    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(result.error).toBeUndefined();
  });

  it('should be able to remove toast', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ToastProvider,
    });

    jest.spyOn(uuidSpy, 'uuid').mockImplementation(() => '1');

    const mockRemoveToast = jest.spyOn(result.current, 'removeToast');

    act(() => {
      result.current.addToast({
        title: 'Toast Test',
      });

      result.current.removeToast('1');
    });

    expect(mockRemoveToast).toHaveBeenCalledTimes(1);
    expect(result.error).toBeUndefined();
  });
});

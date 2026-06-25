import toast from 'react-hot-toast';

const AUTH_SUCCESS_TOAST_ID = 'auth-success-toast';

export function authSuccessToast(message: string, duration: number = 3000) {
  // Prevent multiple toasts from stacking during auth redirects/refresh.
  toast.dismiss(AUTH_SUCCESS_TOAST_ID);
  toast.success(message, {
    id: AUTH_SUCCESS_TOAST_ID,
    duration,
    position: 'top-right',
  });
}


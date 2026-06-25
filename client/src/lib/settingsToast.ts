import toast from 'react-hot-toast'

const SETTINGS_TOAST_ID = 'settings-toast'

export function settingsSuccessToast(message: string, duration: number = 3000) {
  toast.dismiss(SETTINGS_TOAST_ID)
  toast.success(message, {
    id: SETTINGS_TOAST_ID,
    duration,
    position: 'top-right',
  })
}

export function settingsErrorToast(message: string, duration: number = 3000) {
  toast.dismiss(SETTINGS_TOAST_ID)
  toast.error(message, {
    id: SETTINGS_TOAST_ID,
    duration,
    position: 'top-right',
  })
}


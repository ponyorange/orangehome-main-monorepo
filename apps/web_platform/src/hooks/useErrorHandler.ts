import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toast } from '@douyinfe/semi-ui';
import type { AxiosError } from 'axios';

interface ApiError {
  code: string;
  message: string;
}

export function useErrorHandler() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    let errorMessage = t('error.server');
    
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as AxiosError<ApiError>;
      
      switch (axiosError.response?.status) {
        case 400:
          errorMessage = axiosError.response.data?.message || t('error.server');
          break;
        case 401:
          errorMessage = t('error.unauthorized');
          break;
        case 403:
          errorMessage = t('error.forbidden');
          break;
        case 404:
          errorMessage = t('error.notFound');
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = t('error.server');
          break;
        default:
          if (!axiosError.response) {
            errorMessage = t('error.network');
          }
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    setError(errorMessage);
    Toast.error(errorMessage);
    
    return errorMessage;
  }, [t]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}

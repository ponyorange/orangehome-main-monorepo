import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './config';

export interface UploadFileResult {
  objectKey: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * 上传文件到 core-service /api/uploads（需登录），用于图标等拿到可访问 URL
 */
export async function uploadAdminFile(file: File): Promise<UploadFileResult> {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {};
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPLOAD.FILE}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as {
    message?: string | string[];
    objectKey?: string;
    size?: number;
    contentType?: string;
    url?: string;
  };

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login?expired=1';
    }
    const msg =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? data.message[0]
          : `上传失败 (${res.status})`;
    throw new Error(msg);
  }

  if (!data.url) {
    throw new Error('上传响应缺少 url');
  }

  return {
    objectKey: data.objectKey ?? '',
    url: data.url,
    size: data.size ?? file.size,
    contentType: data.contentType ?? file.type,
  };
}

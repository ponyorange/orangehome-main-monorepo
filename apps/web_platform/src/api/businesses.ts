import apiClient from './auth';

export interface Business {
  id: string;
  businessCode: string;
  businessName: string;
  description?: string;
  owner?: string;
  platforms?: Array<{
    platformId: string;
    platformCode: string;
    platformName: string;
  }>;
  config?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessListResponse {
  data: Business[];
  total: number;
  page: number;
  limit: number;
}

export const getBusinesses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  platformId?: string;
}): Promise<BusinessListResponse> => {
  return apiClient.get('/businesses', { params });
};

export const getBusiness = async (id: string): Promise<Business> => {
  return apiClient.get(`/businesses/${id}`);
};

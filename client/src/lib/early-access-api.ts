import { API_ENDPOINTS } from './api-config';

export interface EarlyAccessSubmission {
  fullName: string;
  email: string;
  phoneNumber: string;
  formType: 'savings' | 'investment';
  walletAddress?: string;
  // Financial fields
  monthlyRemittance?: number;
  investmentAmount?: number;
  currentService?: string;
  lockPeriod?: string;
  riskTolerance?: string;
  primaryGoal?: string;
  referralSource?: string;
  // Calculations
  calculations?: {
    monthlyAmount: number;
    totalSavings5Years: number;
    totalYield5Years: number;
    apy: number;
    // Additional calculation fields
    annualSavings?: number;
    monthlySavings?: number;
    projectedYield?: number;
    annualYield?: number;
    combinedBenefit?: number;
  };
}

export interface EarlyAccessResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    formType: string;
    submittedAt: string;
  };
}

export interface EarlyAccessSubmissionsResponse {
  success: boolean;
  data: {
    submissions: Array<{
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
      formType: string;
      walletAddress: string;
      // Financial fields
      monthlyRemittance?: number;
      investmentAmount?: number;
      currentService?: string;
      lockPeriod?: string;
      riskTolerance?: string;
      primaryGoal?: string;
      referralSource?: string;
      // Calculations
      calculations: any;
      submittedAt: string;
      ipAddress: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface EarlyAccessStatsResponse {
  success: boolean;
  data: {
    totalSubmissions: number;
    formTypeBreakdown: {
      savings: number;
      investment: number;
    };
    recentSubmissions: number;
    totalCalculatedSavings: number;
    totalCalculatedReturns: number;
    lastUpdated: string;
  };
}

// Submit early access form
export const submitEarlyAccess = async (data: EarlyAccessSubmission): Promise<EarlyAccessResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.EARLY_ACCESS.SUBMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit early access form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting early access form:', error);
    throw error;
  }
};

// Get early access submissions (admin)
export const getEarlyAccessSubmissions = async (
  page: number = 1,
  limit: number = 50,
  formType?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<EarlyAccessSubmissionsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (formType) {
      params.append('formType', formType);
    }

    const response = await fetch(`${API_ENDPOINTS.EARLY_ACCESS.SUBMISSIONS}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch submissions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching early access submissions:', error);
    throw error;
  }
};

// Get early access statistics
export const getEarlyAccessStats = async (): Promise<EarlyAccessStatsResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.EARLY_ACCESS.STATS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching early access statistics:', error);
    throw error;
  }
};

// Update early access submission (admin)
export const updateEarlyAccessSubmission = async (
  id: string,
  data: Partial<EarlyAccessSubmission>
): Promise<{ success: boolean; message: string; data: { id: string; updated: boolean } }> => {
  try {
    const response = await fetch(API_ENDPOINTS.EARLY_ACCESS.UPDATE(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update submission');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating early access submission:', error);
    throw error;
  }
};

// Delete early access submission (admin)
export const deleteEarlyAccessSubmission = async (
  id: string
): Promise<{ success: boolean; message: string; data: { id: string; deleted: boolean } }> => {
  try {
    const response = await fetch(API_ENDPOINTS.EARLY_ACCESS.DELETE(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete submission');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting early access submission:', error);
    throw error;
  }
};

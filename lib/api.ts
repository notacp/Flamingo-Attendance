// API utility for Google Sheets attendance backend

const API_URL = process.env.NEXT_PUBLIC_SHEETS_API_URL;

export interface AttendanceRecordAPI {
  rowNumber?: number;
  name: string;
  email: string;
  batch: string;
  date: string;
  timestamp?: string;
  feedback?: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Helper function to make POST requests to Apps Script
 * Note: We DON'T set Content-Type header to avoid CORS preflight issues
 */
async function postToAppsScript(payload: object): Promise<Response> {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }

  return fetch(API_URL, {
    method: 'POST',
    redirect: 'follow', // Apps Script may redirect
    body: JSON.stringify(payload),
  });
}

export const attendanceAPI = {
  /**
   * GET all attendance records
   */
  async getAll(): Promise<APIResponse<AttendanceRecordAPI[]>> {
    if (!API_URL) {
      return { success: false, error: 'API URL not configured' };
    }

    try {
      // Append timestamp to URL to prevent browser/network caching
      // Check if URL already has params
      const separator = API_URL.includes('?') ? '&' : '?';
      const url = `${API_URL}${separator}t=${Date.now()}`;

      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch records:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch records',
      };
    }
  },

  /**
   * CREATE a new attendance record
   */
  async create(record: Omit<AttendanceRecordAPI, 'rowNumber' | 'timestamp'>): Promise<APIResponse> {
    try {
      const res = await postToAppsScript({
        action: 'create',
        name: record.name,
        email: record.email,
        batch: record.batch,
        date: record.date,
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Failed to create record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create record',
      };
    }
  },

  /**
   * DELETE a record by row number
   */
  async delete(rowNumber: number): Promise<APIResponse> {
    try {
      const res = await postToAppsScript({ action: 'delete', rowNumber });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Failed to delete record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete record',
      };
    }
  },

  /**
   * UPDATE feedback for a record by row number
   */
  async updateFeedback(rowNumber: number, feedback: string): Promise<APIResponse> {
    console.log('[DEBUG API] updateFeedback called with:', { rowNumber, feedback });
    try {
      const payload = { action: 'updateFeedback', rowNumber, feedback };
      console.log('[DEBUG API] Sending payload:', payload);
      const res = await postToAppsScript(payload);
      console.log('[DEBUG API] Response status:', res.status);
      const data = await res.json();
      console.log('[DEBUG API] Response data:', data);
      return data;
    } catch (error) {
      console.error('Failed to update feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update feedback',
      };
    }
  },
};


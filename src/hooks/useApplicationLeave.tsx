// hooks/useApplicationLeave.tsx
import { useState, useCallback, useEffect } from 'react';
import {
  getLeaveApprovers,
  getLeaveTypes,
  getInformationEmployeeApplicationLeave
} from '../services/applicationLeave';
import { InformationUser } from '../types';
import { showErrorAlert } from '../utils/error/ErrorHandler';

export interface UseApplicationLeaveReturn {
  // Loading states
  loading: boolean;
  
  // Data
  approvers: any;
  leaveTypes: any[];

  // Error
  error: string | null;

  // Methods
  loadApprovers: () => Promise<boolean>;
  loadLeaveTypes: () => Promise<boolean>;
  getInformationEmployee: (codeName: string) => Promise<InformationUser>;
}

export const useApplicationLeave = (): UseApplicationLeaveReturn => {
  // States
  const [loading, setLoading] = useState(false);
  const [approvers, setApprovers] = useState<any>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-load approvers when hook is initialized
  useEffect(() => {
    const loadApproversInitial = async () => {
      console.log('🔄 useApplicationLeave: Loading approvers automatically');
      setLoading(true);
      try {
        const result = await getLeaveApprovers();
        console.log('📊 useApplicationLeave: getLeaveApprovers result:', result);
        
        if (result.success && result.data !== undefined) {
          console.log('✅ useApplicationLeave: Setting approvers state with:', result.data);
          setApprovers(result.data);
        } else {
          console.log('❌ useApplicationLeave: Failed to get approvers:', result.error);
        }
      } catch (err) {
        console.error('💥 useApplicationLeave: Error in loadApproversInitial:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadApproversInitial();
  }, []);

  /**
   * Handle result từ service calls
   */
  const handleResult = useCallback(<T,>(
    result: { success: boolean; data?: T; error?: string },
    onSuccess: (data: T) => void
  ): boolean => {
    if (result.success && result.data !== undefined) {
      setError(null);
      onSuccess(result.data);
      return true;
    } else if (result.error) {
      setError(result.error);
      showErrorAlert(result.error, 'Lỗi tải dữ liệu');
      return false;
    }
    return false;
  }, []);

  /**
   * Load danh sách người phê duyệt
   */
  const loadApprovers = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await getLeaveApprovers();
      return handleResult(result, setApprovers);
    } finally {
      setLoading(false);
    }
  }, [handleResult]);

  /**
   * Load danh sách loại nghỉ phép
   */
  const loadLeaveTypes = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await getLeaveTypes();
      return handleResult(result, setLeaveTypes);
    } finally {
      setLoading(false);
    }
  }, [handleResult]);

  const getInformationEmployee = useCallback(async (codeName: string): Promise<InformationUser> => {
    setLoading(true);
    try {
      const result = await getInformationEmployeeApplicationLeave(codeName);
      if (result) {
        return result;
      } else {
        throw new Error('Không tìm thấy thông tin nhân viên');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // States
    loading,
    approvers,
    leaveTypes,
    error,

    // Methods
    loadApprovers,
    loadLeaveTypes,
    getInformationEmployee,
  };
};
// hooks/useApplicationLeave.tsx
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getLeaveApprovers,
  getLeaveTypes,
  getLeaveBalance,
  createLeaveApplication,
  updateLeaveApplication,
  getEmployeeLeaveApplications,
  cancelLeaveApplication,
  LeaveApprover,
  LeaveApplication,
  getInformationEmployeeApplicationLeave,
  getCodeNameEmployee1
} from '../services/applicationLeave';
import { 
  ApplicationLeaveResult, 
  ApplicationLeaveError,
  ApplicationLeaveErrorHandler
} from '../utils/error/applicationLeave';
import { InformationUser } from '../types';

export interface UseApplicationLeaveReturn {
  // Loading states
  loading: boolean;
  
  // Data
  approvers: LeaveApprover[];
  leaveTypes: any[];
  leaveBalance: any;
  leaveApplications: any[];

  // Error
  error: ApplicationLeaveError | null;

  // Methods
  loadApprovers: () => Promise<boolean>;
  loadLeaveTypes: () => Promise<boolean>;
  loadLeaveBalance: (leaveType: string) => Promise<boolean>;
  createLeave: (leaveData: LeaveApplication) => Promise<boolean>;
  updateLeave: (leaveId: string, leaveData: Partial<LeaveApplication>) => Promise<boolean>;
  loadLeaveApplications: () => Promise<boolean>;
  cancelLeave: (leaveId: string) => Promise<boolean>;
  clearError: () => void;
  getInformationEmployee: (codeName: string) => Promise<InformationUser>;
  getCodeNameEmployee: (email: string) => Promise<string | null>;
}

export const useApplicationLeave = (): UseApplicationLeaveReturn => {
  // States
  const [loading, setLoading] = useState(false);
  const [approvers, setApprovers] = useState<LeaveApprover[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [leaveApplications, setLeaveApplications] = useState<any[]>([]);
  const [error, setError] = useState<ApplicationLeaveError | null>(null);
  
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
    result: ApplicationLeaveResult<T>,
    onSuccess: (data: T) => void,
    showErrorAlert: boolean = true
  ): boolean => {
    if (result.success && result.data !== undefined) {
      setError(null);
      onSuccess(result.data);
      return true;
    } else if (result.error) {
      setError(result.error);
      if (showErrorAlert) {
        ApplicationLeaveErrorHandler.handleError(result.error);
      }
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

  /**
   * Load số dư nghỉ phép
   */
  const loadLeaveBalance = useCallback(async (leaveType: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await getLeaveBalance(leaveType);
      return handleResult(result, setLeaveBalance);
    } finally {
      setLoading(false);
    }
  }, [handleResult]);

  /**
   * Tạo đơn xin nghỉ phép
   */
  const createLeave = useCallback(async (leaveData: LeaveApplication): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await createLeaveApplication(leaveData);
      const success = handleResult(result, () => {
        Alert.alert('Thành công', 'Đơn xin nghỉ phép đã được tạo thành công!');
        // Reload danh sách sau khi tạo thành công
        loadLeaveApplications();
      });
      return success;
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

  /**
   * Cập nhật đơn xin nghỉ phép
   */
  const updateLeave = useCallback(async (
    leaveId: string, 
    leaveData: Partial<LeaveApplication>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await updateLeaveApplication(leaveId, leaveData);
      const success = handleResult(result, () => {
        Alert.alert('Thành công', 'Đơn xin nghỉ phép đã được cập nhật thành công!');
        // Reload danh sách sau khi cập nhật thành công
        loadLeaveApplications();
      });
      return success;
    } finally {
      setLoading(false);
    }
  }, [handleResult]);

  /**
   * Load danh sách đơn nghỉ phép
   */
  const loadLeaveApplications = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await getEmployeeLeaveApplications();
      return handleResult(result, setLeaveApplications);
    } finally {
      setLoading(false);
    }
  }, [handleResult]);

  /**
   * Hủy đơn xin nghỉ phép
   */
  const cancelLeave = useCallback(async (leaveId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await cancelLeaveApplication(leaveId);
      const success = handleResult(result, () => {
        Alert.alert('Thành công', 'Đơn xin nghỉ phép đã được hủy thành công!');
        // Reload danh sách sau khi hủy thành công
        loadLeaveApplications();
      });
      return success;
    } finally {
      setLoading(false);
    }
  }, [handleResult]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCodeNameEmployee = useCallback(async (email: string): Promise<string | null> => {
    setLoading(true);
    try {
      const codeName = await getCodeNameEmployee1(email);
      return codeName;
    }
    finally {
      setLoading(false);
    }
  }, []);

  return {
    // States
    getInformationEmployee,
    loading,
    approvers,
    leaveTypes,
    leaveBalance,
    leaveApplications,
    error,

    // Methods
    getCodeNameEmployee,
    loadApprovers,
    loadLeaveTypes,
    loadLeaveBalance,
    createLeave,
    updateLeave,
    loadLeaveApplications,
    cancelLeave,
    clearError,
  };
};
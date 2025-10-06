import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { FormSection, FormField } from '../../components';
import { getCodeNameEmployee1 } from '../../services/applicationLeave';
import {getEmployeeCodeByEmail} from '../../services/authService';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface ApprovalSectionProps {
    formData: {
        approver: string;
        emailNotify: boolean;
        approverName?: string;
        recordDate?: string;
        username?: string;
    };
    errors: {
        approver?: string;
        approverName?: string;
        recordDate?: string;
        username?: string;
        [key: string]: string | undefined;
    };
    approverText: string;
    loading: boolean;
    onChangeApproverText: (text: string) => void;
    toggleEmailNotify: () => void;
    onChangeApproverName?: (text: string) => void;
    onChangeRecordDate?: (date: string) => void;
    getInformationEmployee?: (codeName: string) => Promise<any>;
    getCodeNameEmployee?: (email: string) => Promise<string | null>;
}

const ApprovalSection: React.FC<ApprovalSectionProps> = ({
    formData,
    errors,
    approverText,
    loading,
    onChangeApproverText,
    toggleEmailNotify,
    onChangeApproverName = () => { },
    onChangeRecordDate = () => { },
    getInformationEmployee = () => Promise.resolve(null),
    getCodeNameEmployee = async () => null,
}) => {
     useEffect(() => {
    const a = getCodeNameEmployee1(approverText);
    console.log('🔍 [ApprovalSection] getCodeNameEmployee1 returned on component mount:', a);
  }, []); // [] đảm bảo hàm chỉ được gọi 1 lần khi component mount


    return (
        <FormSection title="Phê duyệt">
            {/* Approver */}
            <FormField
                label="Người phê duyệt"
                required
                error={errors.approver}
            >
                <View style={[styles.selectInput, { backgroundColor: '#f0f0f0' }]}>
                    <TextInput
                        style={styles.selectText}
                        value={approverText}
                        onChangeText={onChangeApproverText}
                        placeholder="Nhập người phê duyệt"
                        editable={false}
                    />
                </View>
            </FormField>

            {/* Approver Name */}
            <FormField
                label="Tên Người Phê Duyệt Nghỉ Phép"
                required
                error={errors.approverName}
            >
                <View style={[styles.selectInput, { backgroundColor: '#f8f9fa' }]}>
                    <TextInput
                        style={[styles.selectText, { color: formData.approverName ? '#1e293b' : '#64748b' }]}
                        value={formData.username || 'Đang tải tên người phê duyệt...'}
                        onChangeText={text => onChangeApproverName(text)}
                        placeholder="Tên sẽ được tự động điền"
                        editable={false}
                    />
                </View>
            </FormField>



            {/* Record Date */}
            <FormField
                label="Ngày Ghi Sổ"
                required
                error={errors.recordDate}
                
            >
                <View style={[styles.selectInput, { backgroundColor: '#fff' }]}>
                    <TextInput
                        style={styles.selectText}
                        value={formData.recordDate || ''}
                        onChangeText={text => getInformationEmployee(text).then(data => {
                            if (data && data.employee_name) {
                                onChangeApproverName(data.employee_name);
                                onChangeRecordDate(text);
                            }
                        })}
                        placeholder="Nhập ngày ghi sổ (DD/MM/YYYY)"
                        editable={false}
                        keyboardType="numeric"
                    />
                </View>
            </FormField>
        </FormSection>
    );
};

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        backgroundColor: 'white',
    },
    selectText: {
        fontSize: 16,
        color: '#1e293b',
        flex: 1,
    },
    checkboxGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    checkmark: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#374151',
    },
    statusBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#92400e',
    },
});

export default ApprovalSection;
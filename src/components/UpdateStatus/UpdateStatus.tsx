import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useOTAUpdates } from '../../hooks/useOTAUpdates';

/**
 * Component hiển thị trạng thái OTA Updates
 * Có thể được sử dụng để hiển thị thông báo cập nhật cho người dùng
 */
export default function UpdateStatus() {
  const { isChecking, isDownloading, isUpdateAvailable, isUpdatePending, error, reloadUpdate } = useOTAUpdates();

  // Không hiển thị gì nếu không có trạng thái đáng chú ý
  if (!isChecking && !isDownloading && !isUpdateAvailable && !isUpdatePending && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isChecking && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.statusText}>Đang kiểm tra cập nhật...</Text>
        </View>
      )}

      {isDownloading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.statusText}>Đang tải cập nhật...</Text>
        </View>
      )}

      {isUpdatePending && (
        <View style={[styles.statusContainer, styles.updatePendingContainer]}>
          <Text style={styles.updatePendingText}>
            Cập nhật đã sẵn sàng! Nhấn để khởi động lại ứng dụng.
          </Text>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={reloadUpdate}
          >
            <Text style={styles.reloadButtonText}>Khởi động lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={[styles.statusContainer, styles.errorContainer]}>
          <Text style={styles.errorText}>
            Lỗi kiểm tra cập nhật: {error.message}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  updatePendingContainer: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'column',
    padding: 16,
  },
  updatePendingText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
  },
});



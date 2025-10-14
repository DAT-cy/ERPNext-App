import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { colors } from '../../styles/globalStyles';
import { wp, hp, fs } from '../../utils/responsive';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = "Quét Mã QR"
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // Request camera permission
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    if (visible) {
      getCameraPermissions();
      setScanned(false);
    }
  }, [visible]);

  // Handle barcode scanning
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      Alert.alert(
        'Quét Thành Công!',
        `Mã: ${data}`,
        [
          {
            text: 'Tìm Sản Phẩm',
            onPress: () => {
              onScan(data);
              onClose();
            }
          },
          {
            text: 'Quét Lại',
            onPress: () => {
              setScanned(false);
            }
          }
        ]
      );
    }
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Feather name="x" size={wp(6)} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera Area */}
        <View style={styles.cameraContainer}>
          {hasPermission === null ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Đang kiểm tra quyền camera...</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.permissionContainer}>
              <Feather name="camera-off" size={wp(15)} color={colors.error} />
              <Text style={styles.permissionText}>Không có quyền truy cập camera</Text>
              <Text style={styles.permissionSubtext}>Vui lòng cấp quyền truy cập camera trong cài đặt</Text>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
              />
              
              {/* Scanning Frame */}
              <View style={styles.scannerFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              
              {/* Instructions */}
              <View style={styles.instructionsOverlay}>
                <Text style={styles.instructionsText}>Đặt mã QR vào khung để quét</Text>
              </View>
            </View>
          )}
        </View>

        {/* Manual Input */}
        <View style={styles.manualContainer}>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => {
              Alert.prompt(
                'Nhập Mã Thủ Công',
                'Nhập mã sản phẩm:',
                (text) => {
                  if (text && text.trim()) {
                    onScan(text.trim());
                    onClose();
                  }
                }
              );
            }}
            activeOpacity={0.7}
          >
            <Feather name="edit-3" size={wp(5)} color={colors.primary} />
            <Text style={styles.manualButtonText}>Nhập Thủ Công</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(6),
    paddingBottom: hp(2),
    paddingHorizontal: wp(4),
    backgroundColor: colors.black,
  },
  closeButton: {
    padding: wp(2),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: fs(18),
    fontWeight: '600',
    color: colors.white,
  },
  placeholder: {
    width: wp(10),
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  permissionText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginTop: hp(2),
  },
  permissionSubtext: {
    fontSize: fs(14),
    color: colors.gray300,
    textAlign: 'center',
    marginTop: hp(1),
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scannerFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -wp(20) }, { translateY: -wp(20) }],
    width: wp(40),
    height: wp(40),
  },
  corner: {
    position: 'absolute',
    width: wp(6),
    height: wp(6),
    borderColor: colors.primary,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: hp(10),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: fs(16),
    color: colors.white,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  manualContainer: {
    padding: wp(4),
    backgroundColor: colors.black,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: hp(2),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
  },
  manualButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.primary,
    marginLeft: wp(2),
  },
});

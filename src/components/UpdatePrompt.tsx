import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../styles/globalStyles";
import { wp } from "../utils/responsive";
import { VersionInfo } from "../services/versionCheckService";

interface UpdatePromptProps {
  visible: boolean;
  versionInfo: VersionInfo | null;
  onUpdate: () => void;
  onLater: () => void;
}


export default function UpdatePrompt({ visible, versionInfo, onUpdate, onLater }: UpdatePromptProps) {
  if (!visible || !versionInfo) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Có bản cập nhật mới</Text>
          <Text style={styles.description}>
            Phiên bản hiện tại: {versionInfo.currentVersion}
            {"\n"}
            Phiên bản mới: {versionInfo.latestVersion}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.laterButton]} onPress={onLater} activeOpacity={0.8}>
              <Text style={[styles.buttonText, styles.laterText]}>Để sau</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={onUpdate} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(8),
  },
  container: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(6),
    paddingVertical: wp(8),
  },
  title: {
    fontSize: wp(5),
    fontWeight: "600",
    color: colors.gray900,
    marginBottom: wp(2),
  },
  description: {
    fontSize: wp(4),
    color: colors.gray700,
    marginBottom: wp(6),
    lineHeight: wp(5.5),
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
  },
  updateButton: {
    backgroundColor: colors.primary,
    marginLeft: wp(3),
  },
  laterButton: {
    backgroundColor: colors.gray200,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: wp(4),
  },
  laterText: {
    color: colors.gray800,
  },
});


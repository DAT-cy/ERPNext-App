import React from "react";
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors } from "../../styles/globalStyles";
import { wp } from "../../utils/responsive";
import { inventoryEntryStyles } from "../../styles/InventoryEntryScreens.styles";
import { RootStackParamList } from "../../navigation/types";

type Navigation = StackNavigationProp<RootStackParamList, "InsertShipment">;

export default function InsertShipmentDetailScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <SafeAreaView style={inventoryEntryStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={inventoryEntryStyles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: wp(2) }}>
            <Feather name="arrow-left" size={wp(5)} color={colors.gray800} />
          </TouchableOpacity>
          <Text style={inventoryEntryStyles.headerTitle}>Tạo Phiếu Giao Hàng</Text>
          <View style={{ width: wp(7) }} />
        </View>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: wp(6) }}>
        <Feather name="package" size={wp(18)} color={colors.primary} />
        <Text style={{ marginTop: wp(4), fontSize: wp(4.5), fontWeight: "600", color: colors.gray800, textAlign: "center" }}>
          Tính năng đang được phát triển
        </Text>
        <Text style={{ marginTop: wp(2), fontSize: wp(3.5), color: colors.gray500, textAlign: "center" }}>
          Vui lòng quay lại sau. Chúng tôi đang bổ sung biểu mẫu để nhập chi tiết chuyến giao hàng.
        </Text>
      </View>
    </SafeAreaView>
  );
}
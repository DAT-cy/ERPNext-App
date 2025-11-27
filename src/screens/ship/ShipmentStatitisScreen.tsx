import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors } from "../../styles/globalStyles";
import { wp } from "../../utils/responsive";
import { inventoryEntryStyles } from "../../styles/InventoryEntryScreens.styles";
import { RootStackParamList } from "../../navigation/types";
import { getStatities, statities } from "../../services/shipmentService";
import SimpleDateSelector from "../../components/SimpleDateSelector";

type Navigation = StackNavigationProp<RootStackParamList, "ShipmentStatitisScreen">;
type PresetKey = "today" | "week" | "month" | "custom";

const STAT_PRESETS: { key: PresetKey; label: string; helper: string }[] = [
  { key: "today", label: "Hôm nay", helper: "1 ngày" },
  { key: "week", label: "7 ngày", helper: "7 ngày gần nhất" },
  { key: "month", label: "Tháng này", helper: "Từ đầu tháng" },
  { key: "custom", label: "Tùy chọn", helper: "Chọn ngày" },
];

export default function ShipmentStatitisScreen() {
  const navigation = useNavigation<Navigation>();
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("today");
  const [fromDate, setFromDate] = useState<string>(() => getRange("today").from);
  const [toDate, setToDate] = useState<string>(() => getRange("today").to);
  const [statistics, setStatistics] = useState<statities | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canQuery = useMemo(() => {
    if (!isValidDate(fromDate) || !isValidDate(toDate)) return false;
    return new Date(fromDate) <= new Date(toDate);
  }, [fromDate, toDate]);

  const fetchStatistics = useCallback(
    async (showSpinner = true) => {
      if (!canQuery) return;
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await getStatities({ from_date: fromDate, to_date: toDate });
        if (response.success && response.data) {
          setStatistics(response.data);
        } else {
          setStatistics(null);
          setError(response.error ?? "Không thể tải dữ liệu thống kê");
        }
      } catch (err) {
        console.error("[ShipmentStatitisScreen] fetchStatistics error:", err);
        setStatistics(null);
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [canQuery, fromDate, toDate]
  );

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handlePresetPress = (preset: PresetKey) => {
    setSelectedPreset(preset);
    if (preset === "custom") {
      return;
    }
    const range = getRange(preset);
    setFromDate(range.from);
    setToDate(range.to);
  };

  const handleCustomDate = (type: "from" | "to", value: string) => {
    setSelectedPreset("custom");
    if (type === "from") {
      setFromDate(value);
    } else {
      setToDate(value);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics(false);
    setRefreshing(false);
  };

  const rangeLabel = useMemo(() => {
    if (!isValidDate(fromDate) || !isValidDate(toDate)) return "Chọn khoảng thời gian";
    const formattedFrom = formatDisplayDate(fromDate);
    const formattedTo = formatDisplayDate(toDate);
    return `${formattedFrom} → ${formattedTo}`;
  }, [fromDate, toDate]);

  const statsSummary = useMemo(() => {
    if (!statistics) return null;
    return [
      {
        label: "Tổng phiếu giao",
        value: formatNumber(statistics.total_shipments),
        icon: "truck",
      },
      {
        label: "Tổng doanh thu",
        value: formatCurrency(statistics.total_amount),
        icon: "dollar-sign",
      },
    ];
  }, [statistics]);

  const statusSummary = useMemo(() => {
    if (!statistics) return [];
    const base = statistics.status_summary ?? [];
    const summaryMap = new Map<string, number>();

    base.forEach((item) => summaryMap.set(item.status, item.total));
    ["Draft", "Submitted"].forEach((status) => {
      if (!summaryMap.has(status)) {
        summaryMap.set(status, 0);
      }
    });

    const preferredOrder = ["Draft", "Submitted"];
    const merged = Array.from(summaryMap.entries()).map(([status, total]) => ({ status, total }));

    return merged.sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.status);
      const indexB = preferredOrder.indexOf(b.status);
      if (indexA !== -1 || indexB !== -1) {
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      }
      return a.status.localeCompare(b.status);
    });
  }, [statistics]);

  return (
    <SafeAreaView style={inventoryEntryStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={inventoryEntryStyles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: wp(2) }}>
            <Feather name="arrow-left" size={wp(5)} color={colors.gray800} />
          </TouchableOpacity>
          <Text style={inventoryEntryStyles.headerTitle}>Thống kê giao hàng</Text>
          <View style={{ width: wp(7) }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khoảng thời gian</Text>
          <View style={styles.presetsRow}>
            {STAT_PRESETS.map((preset) => {
              const isActive = preset.key === selectedPreset;
              return (
                <TouchableOpacity
                  key={preset.key}
                  style={[styles.presetButton, isActive && styles.presetButtonActive]}
                  onPress={() => handlePresetPress(preset.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>{preset.label}</Text>
                  <Text style={[styles.presetHelper, isActive && styles.presetHelperActive]}>{preset.helper}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedPreset === "custom" && (
            <View style={styles.customDates}>
              <SimpleDateSelector label="Từ ngày" value={fromDate} onChange={(date) => handleCustomDate("from", date)} maxDate={toDate} />
              <SimpleDateSelector label="Đến ngày" value={toDate} onChange={(date) => handleCustomDate("to", date)} minDate={fromDate} />
            </View>
          )}
        </View>

        <View style={inventoryEntryStyles.statisticsContainer}>
          <View style={inventoryEntryStyles.statisticsHeader}>
            <View>
              <Text style={inventoryEntryStyles.statisticsTitle}>Tổng quan</Text>
              <Text style={inventoryEntryStyles.statisticsSubtitle}>{rangeLabel}</Text>
            </View>
            <TouchableOpacity onPress={() => fetchStatistics()} disabled={loading || !canQuery} style={styles.refreshButton}>
              {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="refresh-ccw" size={wp(4.5)} color={canQuery ? colors.primary : colors.gray400} />}
            </TouchableOpacity>
          </View>

          {!canQuery && (
            <View style={styles.infoBanner}>
              <Feather name="info" size={wp(4)} color={colors.warning} />
              <Text style={styles.infoText}>Vui lòng chọn khoảng thời gian hợp lệ</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-triangle" size={wp(4)} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && statistics && statsSummary && (
            <>
              <View style={inventoryEntryStyles.statisticsCardsRow}>
                {statsSummary.map((item, index) => (
                  <View
                    key={item.label}
                    style={[
                      inventoryEntryStyles.statisticsCard,
                      index === statsSummary.length - 1 && inventoryEntryStyles.statisticsCardRight,
                    ]}
                  >
                    <View style={styles.cardLabelRow}>
                      <Feather name={item.icon as any} size={wp(4.5)} color={colors.gray500} />
                      <Text style={[inventoryEntryStyles.statisticsCardLabel, { marginLeft: wp(1) }]}>{item.label}</Text>
                    </View>
                    <Text style={inventoryEntryStyles.statisticsCardValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.metaBox}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Nhân viên</Text>
                  <Text style={styles.metaValue}>{statistics.user || "—"}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Ngày báo cáo</Text>
                  <Text style={styles.metaValue}>
                    {formatDisplayDate(statistics.from_date || fromDate)} → {formatDisplayDate(statistics.to_date || toDate)}
                  </Text>
                </View>
              </View>

              {statusSummary.length > 0 && (
                <View style={styles.statusContainer}>
                  <Text style={styles.statusTitle}>Theo trạng thái</Text>
                  {statusSummary.map((item) => (
                    <View key={item.status} style={styles.statusRow}>
                      <View style={styles.statusLeft}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={styles.statusLabel}>{translateStatus(item.status)}</Text>
                      </View>
                      <Text style={styles.statusValue}>{formatNumber(item.total)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {loading && !statistics && !error && (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRange(preset: PresetKey): { from: string; to: string } {
  const today = new Date();

  if (preset === "today") {
    return { from: formatDateInput(today), to: formatDateInput(today) };
  }

  if (preset === "week") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from: formatDateInput(from), to: formatDateInput(today) };
  }

  if (preset === "month") {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: formatDateInput(firstDay), to: formatDateInput(today) };
  }

  return { from: "", to: "" };
}

function isValidDate(value?: string) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDisplayDate(value?: string) {
  if (!isValidDate(value)) return "__ / __ / ____";
  const [year, month, day] = (value as string).split("-");
  return `${day}/${month}/${year}`;
}

function formatNumber(value?: string | number) {
  if (!value) return "0";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString("vi-VN");
}

function formatCurrency(value?: string | number) {
  if (!value) return "0 đ";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return value;
  return `${numeric.toLocaleString("vi-VN")} đ`;
}

function translateStatus(status: string) {
  const mapping: Record<string, string> = {
    Draft: "Nháp",
    Submitted: "Đã gửi",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
    "In Progress": "Đang xử lý",
  };
  return mapping[status] || status;
}

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    Draft: colors.warning,
    Submitted: colors.primary,
    Completed: colors.success,
    Cancelled: colors.error,
    "In Progress": colors.info,
  };
  return colorMap[status] || colors.gray400;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingBottom: wp(8),
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: wp(4),
    marginTop: wp(4),
    marginBottom: wp(2),
    borderRadius: wp(3),
    padding: wp(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: colors.gray800,
    marginBottom: wp(3),
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  presetButton: {
    flexGrow: 1,
    minWidth: "46%",
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: wp(2),
    paddingVertical: wp(2),
    paddingHorizontal: wp(3),
    backgroundColor: colors.gray50,
  },
  presetButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  presetLabel: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: colors.gray700,
  },
  presetLabelActive: {
    color: colors.primary,
  },
  presetHelper: {
    fontSize: wp(3),
    color: colors.gray500,
    marginTop: wp(0.5),
  },
  presetHelperActive: {
    color: colors.primary,
  },
  customDates: {
    marginTop: wp(3),
    gap: wp(2),
  },
  refreshButton: {
    padding: wp(2),
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "15",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: wp(3),
    gap: wp(2),
  },
  infoText: {
    color: colors.warning,
    fontSize: wp(3.2),
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "10",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: wp(3),
    gap: wp(2),
  },
  errorText: {
    color: colors.error,
    fontSize: wp(3.2),
    flex: 1,
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: wp(2),
  },
  metaBox: {
    marginTop: wp(3),
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: wp(2),
    padding: wp(3),
    backgroundColor: colors.gray50,
    gap: wp(2),
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: wp(3.2),
    color: colors.gray600,
  },
  metaValue: {
    fontSize: wp(3.4),
    color: colors.gray900,
    fontWeight: "600",
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: wp(4),
    gap: wp(2),
  },
  loadingText: {
    fontSize: wp(3.2),
    color: colors.gray600,
  },
  statusContainer: {
    marginTop: wp(4),
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: wp(3),
    gap: wp(2.5),
  },
  statusTitle: {
    fontSize: wp(3.6),
    fontWeight: "600",
    color: colors.gray700,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: wp(1),
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  statusDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  statusLabel: {
    fontSize: wp(3.4),
    color: colors.gray700,
  },
  statusValue: {
    fontSize: wp(3.4),
    fontWeight: "600",
    color: colors.gray900,
  },
});
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const theme = Colors.dark;

export default function StorageAnalysisScreen({ navigation }) {
    const { vaultItems = [] } = useVaultStorage(); // Added fallback

    // Logic to calculate sizes
    const photos = vaultItems.filter(i => i.type === 'photo');
    const videos = vaultItems.filter(i => i.type === 'video');

    // Dummy sizes for UI testing (Real logic would sum file sizes)
    const photoSizeNum = photos.length * 1.2;
    const videoSizeNum = videos.length * 15.5;

    const totalSizeNum = photoSizeNum + videoSizeNum;
    const totalSize = totalSizeNum.toFixed(1);

    // Calculate Percentages for Progress Bar
    const photoPercent = totalSizeNum > 0 ? (photoSizeNum / totalSizeNum) * 100 : 0;
    const videoPercent = totalSizeNum > 0 ? (videoSizeNum / totalSizeNum) * 100 : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vault Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Main Storage Card */}
                <View style={[styles.mainCard, { backgroundColor: theme.elevated }]}>
                    <Text style={styles.cardLabel}>Total Vault Size</Text>
                    <Text style={styles.cardValue}>{totalSize} <Text style={styles.unitText}>MB</Text></Text>

                    {/* Visual Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${photoPercent}%`, backgroundColor: Brand.primary }]} />
                        <View style={[styles.progressBar, { width: `${videoPercent}%`, backgroundColor: Brand.accent }]} />
                    </View>

                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: Brand.primary }]} />
                            <Text style={styles.legendText}>Photos</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: Brand.accent }]} />
                            <Text style={styles.legendText}>Videos</Text>
                        </View>
                    </View>
                </View>

                {/* Breakdown List */}
                <View style={styles.list}>
                    <AnalysisItem
                        icon="image"
                        color={Brand.primary}
                        label="Photos"
                        count={photos.length}
                        size={`${photoSizeNum.toFixed(1)} MB`}
                    />
                    <AnalysisItem
                        icon="videocam"
                        color={Brand.accent}
                        label="Videos"
                        count={videos.length}
                        size={`${videoSizeNum.toFixed(1)} MB`}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function AnalysisItem({ icon, color, label, count, size }) {
    return (
        <View style={[styles.itemRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.itemIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemCount}>{count} items</Text>
            </View>
            <Text style={styles.itemSize}>{size}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md
    },
    backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    content: { padding: Spacing.lg },
    mainCard: {
        padding: Spacing.xl,
        borderRadius: Radius.xl,
        marginBottom: Spacing.xl
    },
    cardLabel: { color: theme.textSecondary, fontSize: FontSize.sm, marginBottom: 4, textAlign: 'center' },
    cardValue: { fontSize: 36, fontWeight: FontWeight.bold, color: '#fff', textAlign: 'center' },
    unitText: { fontSize: FontSize.md, color: theme.textSecondary },
    progressContainer: {
        height: 10, width: '100%', backgroundColor: theme.border,
        borderRadius: 5, marginTop: Spacing.xl, flexDirection: 'row', overflow: 'hidden'
    },
    progressBar: { height: '100%' },
    legendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg, gap: Spacing.lg },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { color: theme.textSecondary, fontSize: FontSize.xs },
    list: { gap: Spacing.xs },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1 },
    itemIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
    itemLabel: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    itemCount: { color: theme.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
    itemSize: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm }
});
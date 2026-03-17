import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const theme = Colors.dark;

export default function StorageAnalysisScreen({ navigation }) {
    const { vaultItems } = useVaultStorage();

    // Logic to calculate sizes (Replace with real logic later)
    const photos = vaultItems.filter(i => i.type === 'photo');
    const videos = vaultItems.filter(i => i.type === 'video');

    // Dummy sizes for UI testing
    const photoSize = (photos.length * 1.2).toFixed(1); // Assume 1.2MB avg
    const videoSize = (videos.length * 15.5).toFixed(1); // Assume 15.5MB avg
    const totalSize = (parseFloat(photoSize) + parseFloat(videoSize)).toFixed(1);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vault Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Storage Card */}
                <View style={[styles.mainCard, { backgroundColor: theme.elevated }]}>
                    <Text style={styles.cardLabel}>Total Vault Size</Text>
                    <Text style={styles.cardValue}>{totalSize} MB</Text>

                    {/* Visual Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: '40%', backgroundColor: Brand.primary }]} />
                        <View style={[styles.progressBar, { width: '30%', backgroundColor: Brand.accent }]} />
                    </View>
                </View>

                {/* Breakdown List */}
                <View style={styles.list}>
                    <AnalysisItem
                        icon="image"
                        color={Brand.primary}
                        label="Photos"
                        count={photos.length}
                        size={`${photoSize} MB`}
                    />
                    <AnalysisItem
                        icon="videocam"
                        color={Brand.accent}
                        label="Videos"
                        count={videos.length}
                        size={`${videoSize} MB`}
                    />
                    <AnalysisItem
                        icon="document"
                        color="#6366F1"
                        label="Documents"
                        count={0}
                        size="0 MB"
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    content: { padding: Spacing.lg },
    mainCard: { padding: Spacing.xl, borderRadius: Radius.xl, alignItems: 'center', marginBottom: Spacing.xl },
    cardLabel: { color: theme.textSecondary, fontSize: FontSize.sm, marginBottom: 4 },
    cardValue: { fontSize: 32, fontWeight: FontWeight.bold, color: '#fff' },
    progressContainer: {
        height: 8, width: '100%', backgroundColor: theme.border,
        borderRadius: 4, marginTop: Spacing.xl, flexDirection: 'row', overflow: 'hidden'
    },
    progressBar: { height: '100%' },
    list: { gap: Spacing.md },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
    itemIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
    itemLabel: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.medium },
    itemCount: { color: theme.textSecondary, fontSize: FontSize.xs },
    itemSize: { color: '#fff', fontWeight: FontWeight.semibold }
});
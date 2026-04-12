import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FAQCard from '../components/FAQCard';
import SearchBar from '../components/SearchBar';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const theme = Colors.dark;

const FAQS = [
    {
        q: 'Where are my files stored?',
        a: 'All files are stored in your app\'s private directory on-device. They are never uploaded to any server or cloud service.',
    },
    {
        q: 'Can other apps access my vault?',
        a: 'No. Files in SpicaVault are stored in a sandboxed private directory that only SpicaVault can access. A .nomedia file also prevents the system gallery from indexing them.',
    },
    {
        q: 'What happens when I import a file?',
        a: 'The file is copied into your private vault and renamed to a random string so it\'s unrecognisable even on the file system. The original stays in your gallery unless you have auto-remove enabled.',
    },
    {
        q: 'What does auto-remove do?',
        a: 'When enabled, after a successful import Android will ask you once to confirm deletion of the originals from your gallery. This is a system-level security requirement — SpicaVault cannot delete files silently.',
    },
    {
        q: 'How do I get files back to my gallery?',
        a: 'Long press any file in the vault, tap Restore in the action sheet, and confirm. The file will be moved back to your system gallery with its original name.',
    },
    {
        q: 'Is my PIN stored securely?',
        a: 'Yes. Your PIN is stored using Expo SecureStore which uses Android Keystore on Android. It is never stored in plain text or transmitted anywhere.',
    },
    {
        q: 'What is the grace period for auto-lock?',
        a: 'If you switch to another app and return within 30 seconds, the vault stays unlocked. After 30 seconds it locks automatically and requires PIN or biometric to open.',
    },
    {
        q: 'Does SpicaVault work without internet?',
        a: 'Yes, completely. SpicaVault is 100% offline. No internet connection is needed for any feature.',
    },
    {
        q: 'What is the calculator stealth mode?',
        a: 'Stealth mode disguises SpicaVault as a calculator on the surface. Only entering your secret code unlocks the vault.',
    },
    {
        q: 'Can I recover deleted files?',
        a: 'No. Files deleted from the vault are permanently removed. Use Restore if you want to send a file back to your gallery instead.',
    },
    {
        q: 'What file formats are supported?',
        a: 'Photos: JPG, JPEG, PNG, GIF, WebP. Videos: MP4, MOV, AVI, M4V.',
    },
    {
        q: 'Does SpicaVault collect any data?',
        a: 'No. We do not collect, transmit, or store any personal data. Everything stays on your device.',
    },
];

export default function AboutScreen({ navigation }) {
    const [search, setSearch] = useState('');

    const filtered = FAQS.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>FAQ</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search bar component */}
            <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search questions…"
                style={styles.searchBar}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.sectionLabel}>
                    {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'FREQUENTLY ASKED'}
                </Text>

                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={36} color={theme.textSecondary} />
                        <Text style={styles.emptyText}>No matching questions</Text>
                    </View>
                ) : (
                    filtered.map((faq, i) => (
                        <FAQCard key={i} question={faq.q} answer={faq.a} />
                    ))
                )}

                {/* Contact footer */}
                {!search && (
                    <View style={styles.footer}>
                        <View style={styles.footerDivider} />
                        <Text style={styles.footerLabel}>Still have questions?</Text>
                        <TouchableOpacity
                            style={styles.contactBtn}
                            onPress={() => Linking.openURL('mailto:hello.spicalabs@gmail.com')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="mail-outline" size={16} color="#fff" />
                            <Text style={styles.contactBtnText}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    searchBar: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
    content: { paddingHorizontal: Spacing.lg },
    sectionLabel: {
        fontSize: 10, fontWeight: FontWeight.bold,
        color: theme.textSecondary, letterSpacing: 1.2,
        marginBottom: Spacing.md, marginLeft: 4,
    },
    emptyState: { alignItems: 'center', marginTop: 60, gap: Spacing.md },
    emptyText: { fontSize: FontSize.sm, color: theme.textSecondary },
    footer: { marginTop: Spacing.xl, alignItems: 'center', gap: Spacing.lg },
    footerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' },
    footerLabel: { fontSize: FontSize.sm, color: theme.textSecondary },
    contactBtn: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: theme.elevated,
        paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
        borderRadius: 12,
    },
    contactBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
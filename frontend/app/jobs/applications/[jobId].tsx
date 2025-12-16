import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function JobApplicationsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/applications/job/${jobId}`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      Alert.alert('خطأ', 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/applications/${applicationId}/status?status=${status}`,
        {
          method: 'PUT',
          credentials: 'include',
        }
      );

      if (response.ok) {
        await loadApplications();
        Alert.alert('نجاح', 'تم تحديث حالة الطلب');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل تحديث الحالة');
    }
  };

  const handleContact = (userId: string, name: string) => {
    router.push(`/messages/${userId}?name=${encodeURIComponent(name)}`);
  };

  const copyText = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert(
      '✓ تم النسخ',
      `تم نسخ ${label}:\n${text}`,
      [{ text: 'حسناً' }]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'قيد المراجعة';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المتقدمون</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>لا توجد طلبات حتى الآن</Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {applications.map((app) => (
              <View key={app.application_id} style={styles.applicationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>
                      {app.job_seeker_name}
                    </Text>
                    <TouchableOpacity 
                      style={styles.contactInfoRow}
                      onPress={() => copyText(app.job_seeker_email, 'البريد الإلكتروني')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="mail" size={16} color="#1E3A8A" />
                      <Text style={styles.applicantEmail}>
                        {app.job_seeker_email}
                      </Text>
                      <Ionicons name="copy-outline" size={14} color="#D97706" />
                    </TouchableOpacity>
                    {app.job_seeker_phone && (
                      <TouchableOpacity 
                        style={styles.contactInfoRow}
                        onPress={() => copyText(app.job_seeker_phone, 'رقم الهاتف')}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="call" size={16} color="#1E3A8A" />
                        <Text style={styles.applicantPhone}>
                          {app.job_seeker_phone}
                        </Text>
                        <Ionicons name="copy-outline" size={14} color="#D97706" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(app.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(app.status) },
                      ]}
                    >
                      {getStatusText(app.status)}
                    </Text>
                  </View>
                </View>

                {app.cover_letter && (
                  <View style={styles.coverLetterSection}>
                    <Text style={styles.sectionTitle}>رسالة التقديم:</Text>
                    <Text style={styles.coverLetterText}>{app.cover_letter}</Text>
                  </View>
                )}

                <View style={styles.dateSection}>
                  <Text style={styles.dateText}>
                    تاريخ التقديم:{' '}
                    {new Date(app.created_at).toLocaleDateString('ar-EG')}
                  </Text>
                </View>

                <View style={styles.actionsSection}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      handleContact(app.job_seeker_id, app.job_seeker_name)
                    }
                  >
                    <Ionicons name="chatbubble-outline" size={18} color="#4F46E5" />
                    <Text style={styles.contactButtonText}>مراسلة</Text>
                  </TouchableOpacity>

                  {app.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => updateStatus(app.application_id, 'accepted')}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>قبول</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => updateStatus(app.application_id, 'rejected')}
                      >
                        <Ionicons name="close" size={18} color="#FFFFFF" />
                        <Text style={styles.rejectButtonText}>رفض</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  applicationsList: {
    padding: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  applicantEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  coverLetterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  dateSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  contactButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const isEmployer = user?.user_type === 'employer';
  const isOwner = job?.employer_id === user?.user_id;

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`);
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Failed to load job:', error);
      Alert.alert('خطأ', 'فشل تحميل تفاصيل الوظيفة');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          job_id: id,
          cover_letter: coverLetter,
        }),
      });

      if (response.ok) {
        setShowApplyModal(false);
        Alert.alert('نجاح', 'تم إرسال طلبك بنجاح', [
          { text: 'حسناً', onPress: () => router.back() },
        ]);
      } else {
        const error = await response.json();
        Alert.alert('خطأ', error.detail || 'فشل إرسال الطلب');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setApplying(false);
    }
  };

  const handleContact = () => {
    router.push(
      `/messages/${job.employer_id}?name=${encodeURIComponent(job.employer_name)}`
    );
  };

  const viewApplications = () => {
    router.push(`/jobs/applications/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الوظيفة</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Job Header */}
          <View style={styles.jobHeader}>
            <View style={styles.titleSection}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  job.status === 'active' ? styles.statusActive : styles.statusInactive,
                ]}
              >
                <Text style={styles.statusText}>
                  {job.status === 'active' ? 'نشط' : 'مغلق'}
                </Text>
              </View>
            </View>
            <Text style={styles.companyName}>{job.employer_name}</Text>
          </View>

          {/* Job Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="briefcase" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                {job.job_type === 'full_time'
                  ? 'دوام كامل'
                  : job.job_type === 'part_time'
                  ? 'دوام جزئي'
                  : 'عن بُعد'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                {job.city}, {job.area}
              </Text>
            </View>
            {job.salary_min && (
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color="#6B7280" />
                <Text style={styles.infoText}>
                  {job.salary_min} - {job.salary_max} ({job.salary_type.join(', ')})
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>وصف الوظيفة</Text>
            <Text style={styles.sectionText}>{job.description}</Text>
          </View>

          {/* Requirements */}
          {job.requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المتطلبات</Text>
              <Text style={styles.sectionText}>{job.requirements}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {isOwner ? (
          <TouchableOpacity style={styles.primaryButton} onPress={viewApplications}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>عرض المتقدمين</Text>
          </TouchableOpacity>
        ) : !isEmployer ? (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContact}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowApplyModal(true)}
            >
              <Text style={styles.primaryButtonText}>تقديم طلب</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Apply Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تقديم طلب</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>رسالة تقديم (اختياري)</Text>
            <TextInput
              style={styles.modalTextArea}
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder="اشرح لماذا أنت مناسب لهذه الوظيفة..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.modalButton, applying && styles.modalButtonDisabled]}
              onPress={handleApply}
              disabled={applying}
            >
              <Text style={styles.modalButtonText}>
                {applying ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: 24,
  },
  jobHeader: {
    marginBottom: 24,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalTextArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 150,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
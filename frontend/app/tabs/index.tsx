import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isEmployer = user?.user_type === 'employer';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs?limit=5`);
      const jobs = await response.json();
      setStats({ recentJobs: jobs });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحباً</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons
              name={isEmployer ? 'briefcase' : 'person'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.badgeText}>
              {isEmployer ? 'صاحب عمل' : 'باحث عن عمل'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.actionsGrid}>
            {isEmployer ? (
              <>
                <TouchableOpacity
                  style={[styles.actionCard, { backgroundColor: '#EEF2FF' }]}
                  onPress={() => router.push('/jobs/post')}
                >
                  <Ionicons name="add-circle" size={32} color="#4F46E5" />
                  <Text style={styles.actionText}>نشر وظيفة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionCard, { backgroundColor: '#F0FDF4' }]}
                  onPress={() => router.push('/tabs/jobs')}
                >
                  <Ionicons name="list" size={32} color="#10B981" />
                  <Text style={styles.actionText}>وظائفي</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionCard, { backgroundColor: '#EEF2FF' }]}
                  onPress={() => router.push('/tabs/jobs')}
                >
                  <Ionicons name="search" size={32} color="#4F46E5" />
                  <Text style={styles.actionText}>بحت عن وظيفة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionCard, { backgroundColor: '#F0FDF4' }]}
                  onPress={() => router.push('/jobs/my-applications')}
                >
                  <Ionicons name="document-text" size={32} color="#10B981" />
                  <Text style={styles.actionText}>طلباتي</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>وظائف حديثة</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/jobs')}>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          {stats?.recentJobs?.map((job: any) => (
            <TouchableOpacity
              key={job.job_id}
              style={styles.jobCard}
              onPress={() => router.push(`/jobs/${job.job_id}`)}
            >
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <View style={styles.jobTypeBadge}>
                  <Text style={styles.jobTypeText}>
                    {job.job_type === 'full_time'
                      ? 'دوام كامل'
                      : job.job_type === 'part_time'
                      ? 'دوام جزئي'
                      : 'عن بُعد'}
                  </Text>
                </View>
              </View>
              <Text style={styles.companyName}>{job.employer_name}</Text>
              <View style={styles.jobFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.locationText}>
                    {job.city}, {job.area}
                  </Text>
                </View>
                {job.salary_min && (
                  <Text style={styles.salaryText}>
                    {job.salary_min} - {job.salary_max}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  jobTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
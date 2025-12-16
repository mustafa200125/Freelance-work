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
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
      >
        {/* Header with Mesopotamian Pattern */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.mesopotamianBorder} />
          </View>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>مرحباً</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <View style={styles.badge}>
              <View style={styles.badgeDecor} />
              <Ionicons
                name={isEmployer ? 'briefcase' : 'person'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.badgeText}>
                {isEmployer ? 'صاحب عمل' : 'باحث عن عمل'}
              </Text>
            </View>
          </View>
        </View>

        {/* Public Feed Banner */}
        <TouchableOpacity
          style={styles.feedBanner}
          onPress={() => router.push('/feed')}
        >
          <View style={styles.feedBannerContent}>
            <View style={styles.feedIconContainer}>
              <Ionicons name="globe" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.feedTextContainer}>
              <Text style={styles.feedBannerTitle}>النشر العام للمهن</Text>
              <Text style={styles.feedBannerSubtitle}>ابحث عن محترفين وتواصل معهم مباشرة</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#D97706" />
          </View>
        </TouchableOpacity>

        {/* Quick Actions with Babylonian Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDecor} />
            <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          </View>
          <View style={styles.actionsGrid}>
            {isEmployer ? (
              <>
                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCard1]}
                  onPress={() => router.push('/jobs/post')}
                >
                  <View style={styles.actionPattern} />
                  <Ionicons name="add-circle" size={32} color="#1E3A8A" />
                  <Text style={styles.actionText}>نشر وظيفة</Text>
                  <View style={styles.actionBorder} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCard2]}
                  onPress={() => router.push('/tabs/jobs')}
                >
                  <View style={styles.actionPattern} />
                  <Ionicons name="list" size={32} color="#D97706" />
                  <Text style={styles.actionText}>وظائفي</Text>
                  <View style={styles.actionBorder} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCard1]}
                  onPress={() => router.push('/tabs/jobs')}
                >
                  <View style={styles.actionPattern} />
                  <Ionicons name="search" size={32} color="#1E3A8A" />
                  <Text style={styles.actionText}>بحث عن وظيفة</Text>
                  <View style={styles.actionBorder} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionCard, styles.actionCard2]}
                  onPress={() => router.push('/jobs/my-applications')}
                >
                  <View style={styles.actionPattern} />
                  <Ionicons name="document-text" size={32} color="#D97706" />
                  <Text style={styles.actionText}>طلباتي</Text>
                  <View style={styles.actionBorder} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Recent Jobs with Assyrian Design */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDecor} />
            <Text style={styles.sectionTitle}>وظائف حديثة</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/jobs')}>
              <Text style={styles.seeAllText}>عرض الكل ←</Text>
            </TouchableOpacity>
          </View>
          {stats?.recentJobs?.map((job: any) => (
            <TouchableOpacity
              key={job.job_id}
              style={styles.jobCard}
              onPress={() => router.push(`/jobs/${job.job_id}`)}
            >
              <View style={styles.jobCardBorder} />
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
                  <Ionicons name="location" size={16} color="#92400E" />
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
              <View style={styles.jobCardBottomDecor} />
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
    backgroundColor: '#FEF3C7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingBottom: 24,
  },
  headerTop: {
    height: 8,
    backgroundColor: '#D97706',
  },
  mesopotamianBorder: {
    height: 8,
    backgroundColor: '#B45309',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#FDE68A',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FDE68A',
    position: 'relative',
  },
  badgeDecor: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: '#FDE68A',
    borderRadius: 4,
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
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionDecor: {
    width: 4,
    height: 24,
    backgroundColor: '#D97706',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    flex: 1,
  },
  seeAllText: {
    color: '#D97706',
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
    borderWidth: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  actionCard1: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E3A8A',
  },
  actionCard2: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  actionPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    backgroundColor: '#D97706',
    opacity: 0.2,
    transform: [{ rotate: '45deg' }],
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  actionBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#D97706',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D97706',
    position: 'relative',
    overflow: 'hidden',
  },
  jobCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#1E3A8A',
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
    color: '#1E3A8A',
    flex: 1,
  },
  jobTypeBadge: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  jobTypeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  companyName: {
    fontSize: 14,
    color: '#92400E',
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
    color: '#92400E',
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  jobCardBottomDecor: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 4,
    backgroundColor: '#D97706',
  },
  feedBanner: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D97706',
    overflow: 'hidden',
  },
  feedBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  feedIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#D97706',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  feedTextContainer: {
    flex: 1,
  },
  feedBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  feedBannerSubtitle: {
    fontSize: 14,
    color: '#FDE68A',
  },
});
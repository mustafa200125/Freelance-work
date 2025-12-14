import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function JobsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const isEmployer = user?.user_type === 'employer';

  useEffect(() => {
    loadJobs();
  }, [filterType]);

  const loadJobs = async () => {
    try {
      let url = `${BACKEND_URL}/api/jobs?limit=50`;
      if (filterType) {
        url += `&job_type=${filterType}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      if (isEmployer) {
        url = `${BACKEND_URL}/api/jobs/my/posted`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleSearch = () => {
    setLoading(true);
    loadJobs();
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
        <Text style={styles.headerTitle}>
          {isEmployer ? 'ونظائفي' : 'الوظائف المتاحة'}
        </Text>
        {isEmployer && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/jobs/post')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search & Filters */}
      {!isEmployer && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن وظيفة..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                !filterType && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  !filterType && styles.filterTextActive,
                ]}
              >
                الكل
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterType === 'full_time' && styles.filterChipActive,
              ]}
              onPress={() => setFilterType('full_time')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'full_time' && styles.filterTextActive,
                ]}
              >
                دوام كامل
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterType === 'part_time' && styles.filterChipActive,
              ]}
              onPress={() => setFilterType('part_time')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'part_time' && styles.filterTextActive,
                ]}
              >
                دوام جزئي
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterType === 'remote' && styles.filterChipActive,
              ]}
              onPress={() => setFilterType('remote')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'remote' && styles.filterTextActive,
                ]}
              >
                عن بُعد
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Jobs List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {isEmployer
                ? 'لم تنشر أي وظائف بعد'
                : 'لا توجد وظائف متاحة'}
            </Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {jobs.map((job) => (
              <TouchableOpacity
                key={job.job_id}
                style={styles.jobCard}
                onPress={() => router.push(`/jobs/${job.job_id}`)}
              >
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      job.status === 'active'
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {job.status === 'active' ? 'نشط' : 'مغلق'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.companyName}>{job.employer_name}</Text>
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {job.description}
                </Text>
                <View style={styles.jobFooter}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.locationText}>
                      {job.city}, {job.area}
                    </Text>
                  </View>
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
                {job.salary_min && (
                  <View style={styles.salaryContainer}>
                    <Ionicons name="cash" size={16} color="#10B981" />
                    <Text style={styles.salaryText}>
                      {job.salary_min} - {job.salary_max} (
                      {job.salary_type.join(', ')})
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  jobsList: {
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
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
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
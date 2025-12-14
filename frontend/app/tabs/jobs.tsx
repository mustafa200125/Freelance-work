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
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Mesopotamian Pattern */}
      <View style={styles.header}>
        <View style={styles.headerBorder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isEmployer ? 'وظائفي' : 'الوظائف المتاحة'}
          </Text>
          {isEmployer && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/jobs/post')}
            >
              <View style={styles.addButtonDecor} />
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search & Filters */}
      {!isEmployer && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#92400E" />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن وظيفة..."
              placeholderTextColor="#B45309"
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#D97706" />
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
                <View style={styles.jobCardTopBorder} />
                <View style={styles.jobCardLeftBorder} />
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
                    <Ionicons name="location" size={16} color="#92400E" />
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
                    <Ionicons name="cash" size={16} color="#059669" />
                    <Text style={styles.salaryText}>
                      {job.salary_min} - {job.salary_max} (
                      {job.salary_type.join(', ')})
                    </Text>
                  </View>
                )}
                <View style={styles.jobCardBottomDecor} />
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
    backgroundColor: '#FEF3C7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  header: {
    backgroundColor: '#1E3A8A',
  },
  headerBorder: {
    height: 4,
    backgroundColor: '#D97706',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
    position: 'relative',
  },
  addButtonDecor: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    backgroundColor: '#FDE68A',
    borderRadius: 6,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 2,
    borderBottomColor: '#D97706',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E3A8A',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  filterChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    color: '#92400E',
    marginTop: 16,
    fontWeight: '600',
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
  jobCardTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#1E3A8A',
  },
  jobCardLeftBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#D97706',
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
    color: '#1E3A8A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  companyName: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#78350F',
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
    color: '#92400E',
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
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    width: 50,
    height: 4,
    backgroundColor: '#D97706',
  },
});
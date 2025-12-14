import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await logout();
            router.replace('/auth/select-type');
          },
        },
      ]
    );
  };

  const isEmployer = user?.user_type === 'employer';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            {user?.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.typeBadge}>
                <Ionicons
                  name={isEmployer ? 'briefcase' : 'person'}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.typeBadgeText}>
                  {isEmployer ? 'صاحب عمل' : 'باحث عن عمل'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create-outline" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          
          {user?.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={20} color="#6B7280" />
              <Text style={styles.detailText}>{user.phone}</Text>
            </View>
          )}

          {user?.city && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {user.city}{user.area ? `, ${user.area}` : ''}
              </Text>
            </View>
          )}

          {!isEmployer && user?.profession && (
            <View style={styles.detailRow}>
              <Ionicons name="briefcase" size={20} color="#6B7280" />
              <Text style={styles.detailText}>{user.profession}</Text>
            </View>
          )}

          {!isEmployer && user?.experience_years !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {user.experience_years} سنوات خبرة
              </Text>
            </View>
          )}

          {!isEmployer && user?.skills && user.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>المهارات:</Text>
              <View style={styles.skillsGrid}>
                {user.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {user?.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>نبذة عني:</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push(
                isEmployer
                  ? '/tabs/jobs'
                  : '/jobs/my-applications'
              )
            }
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>
                {isEmployer ? 'وظائفي' : 'طلباتي'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            disabled={loading}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                تسجيل الخروج
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#4B5563',
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  bioContainer: {
    marginTop: 8,
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#4B5563',
  },
  logoutText: {
    color: '#EF4444',
  },
});
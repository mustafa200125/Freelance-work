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
  Clipboard,
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

  const copyPhoneNumber = (phoneNumber: string) => {
    Clipboard.setString(phoneNumber);
    Alert.alert(
      '✓ تم النسخ',
      `تم نسخ رقم الهاتف:\n${phoneNumber}`,
      [{ text: 'حسناً' }]
    );
  };

  const isEmployer = user?.user_type === 'employer';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Mesopotamian Design */}
        <View style={styles.header}>
          <View style={styles.headerBorder} />
          <View style={styles.profileInfo}>
            {user?.picture ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.picture }} style={styles.avatar} />
                <View style={styles.avatarBorder} />
              </View>
            ) : (
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#D97706" />
                </View>
                <View style={styles.avatarBorder} />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.typeBadge}>
                <View style={styles.badgeDecor} />
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
            <View style={styles.editButtonDecor} />
            <Ionicons name="create-outline" size={24} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Profile Details with Babylonian Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDecor} />
            <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          </View>
          
          {user?.phone && (
            <TouchableOpacity 
              style={styles.detailRow}
              onPress={() => copyPhoneNumber(user.phone!)}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <Ionicons name="call" size={20} color="#D97706" />
              </View>
              <Text style={styles.detailText}>{user.phone}</Text>
              <View style={styles.copyIcon}>
                <Ionicons name="copy-outline" size={18} color="#1E3A8A" />
              </View>
            </TouchableOpacity>
          )}

          {user?.city && (
            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={20} color="#D97706" />
              </View>
              <Text style={styles.detailText}>
                {user.city}{user.area ? `, ${user.area}` : ''}
              </Text>
            </View>
          )}

          {!isEmployer && user?.profession && (
            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <Ionicons name="briefcase" size={20} color="#D97706" />
              </View>
              <Text style={styles.detailText}>{user.profession}</Text>
            </View>
          )}

          {!isEmployer && user?.experience_years !== undefined && (
            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar" size={20} color="#D97706" />
              </View>
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
                    <View style={styles.skillChipDecor} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {user?.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>نبذة عني:</Text>
              <View style={styles.bioBox}>
                <View style={styles.bioDecor} />
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu Options with Assyrian Pattern */}
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
              <View style={styles.menuIconBox}>
                <Ionicons name="document-text" size={20} color="#D97706" />
              </View>
              <Text style={styles.menuItemText}>
                {isEmployer ? 'وظائفي' : 'طلباتي'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D97706" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            disabled={loading}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, styles.logoutIconBox]}>
                <Ionicons name="log-out" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>
                تسجيل الخروج
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* Bottom Mesopotamian Pattern */}
        <View style={styles.bottomPattern}>
          <View style={styles.patternRow}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.patternBox} />
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#D97706',
    position: 'relative',
  },
  headerBorder: {
    height: 4,
    backgroundColor: '#1E3A8A',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
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
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D97706',
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 2,
    borderColor: '#D97706',
    position: 'relative',
  },
  badgeDecor: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 8,
    height: 8,
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  editButtonDecor: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: 12,
    borderTopWidth: 3,
    borderTopColor: '#D97706',
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
    backgroundColor: '#1E3A8A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  detailText: {
    fontSize: 16,
    color: '#78350F',
    flex: 1,
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    position: 'relative',
  },
  skillChipDecor: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
  skillText: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  bioContainer: {
    marginTop: 8,
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  bioBox: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D97706',
    position: 'relative',
  },
  bioDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#1E3A8A',
  },
  bioText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  logoutIconBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  menuItemText: {
    fontSize: 16,
    color: '#78350F',
    fontWeight: '600',
  },
  logoutText: {
    color: '#DC2626',
  },
  menuDivider: {
    height: 2,
    backgroundColor: '#FDE68A',
    marginVertical: 8,
  },
  bottomPattern: {
    padding: 24,
    alignItems: 'center',
  },
  patternRow: {
    flexDirection: 'row',
    gap: 8,
  },
  patternBox: {
    width: 30,
    height: 30,
    backgroundColor: '#1E3A8A',
    borderWidth: 2,
    borderColor: '#D97706',
    transform: [{ rotate: '45deg' }],
  },
});
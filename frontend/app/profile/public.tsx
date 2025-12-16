import React, { useState, useRef } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function PublicProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    Alert.alert(
      '✓ تم النسخ',
      `تم نسخ ${label}:\n${text}`,
      [{ text: 'حسناً' }]
    );
  };

  const shareProfile = async () => {
    try {
      const profileText = `
📋 بطاقة العمل - ${user?.name}

${user?.profession ? '💼 المهنة: ' + user.profession : ''}
${user?.phone ? '📱 الهاتف: ' + user.phone : ''}
${user?.email ? '✉️ البريد: ' + user.email : ''}
${user?.city ? '🌍 الموقع: ' + user.city + (user?.area ? ', ' + user.area : '') : ''}
${user?.experience_years ? '⏱️ الخبرة: ' + user.experience_years + ' سنوات' : ''}

---
تطبيق أعمال حرة - منصة التوظيف العراقية
      `.trim();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('data:text/plain;base64,' + btoa(profileText), {
          dialogTitle: 'مشاركة البطاقة',
        });
      } else {
        Clipboard.setString(profileText);
        Alert.alert('تم النسخ', 'تم نسخ معلومات البطاقة إلى الحافظة');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  const isEmployer = user.user_type === 'employer';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBorder} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>البطاقة العامة</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareProfile}
          >
            <Ionicons name="share-social" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Business Card */}
        <View style={styles.cardContainer}>
          {/* Decorative Pattern Top */}
          <View style={styles.cardTopPattern}>
            <View style={styles.patternRow}>
              {[...Array(10)].map((_, i) => (
                <View key={i} style={styles.patternDot} />
              ))}
            </View>
          </View>

          {/* Profile Image */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              {user.picture ? (
                <Image source={{ uri: user.picture }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person" size={80} color="#D97706" />
                </View>
              )}
              <View style={styles.imageDecor1} />
              <View style={styles.imageDecor2} />
            </View>
            <View style={styles.typeBadge}>
              <Ionicons
                name={isEmployer ? 'briefcase' : 'person'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.typeBadgeText}>
                {isEmployer ? 'صاحب عمل' : 'باحث عن عمل'}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.name}>{user.name}</Text>
          
          {/* Profession */}
          {user.profession && (
            <View style={styles.professionContainer}>
              <View style={styles.professionDecor} />
              <Text style={styles.profession}>{user.profession}</Text>
              <View style={styles.professionDecor} />
            </View>
          )}

          {/* Decorative Line */}
          <View style={styles.decorativeLine}>
            <View style={styles.lineSegment} />
            <View style={styles.centerDiamond} />
            <View style={styles.lineSegment} />
          </View>

          {/* Contact Info Cards */}
          <View style={styles.infoSection}>
            {/* Phone */}
            {user.phone && (
              <TouchableOpacity
                style={styles.infoCard}
                onPress={() => copyToClipboard(user.phone!, 'رقم الهاتف')}
                activeOpacity={0.7}
              >
                <View style={styles.infoCardBorder} />
                <View style={styles.infoIconBox}>
                  <Ionicons name="call" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>رقم الهاتف</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
                <View style={styles.copyIconBox}>
                  <Ionicons 
                    name={copied === 'رقم الهاتف' ? 'checkmark' : 'copy-outline'} 
                    size={20} 
                    color={copied === 'رقم الهاتف' ? '#10B981' : '#1E3A8A'} 
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Email */}
            <TouchableOpacity
              style={styles.infoCard}
              onPress={() => copyToClipboard(user.email, 'البريد الإلكتروني')}
              activeOpacity={0.7}
            >
              <View style={styles.infoCardBorder} />
              <View style={styles.infoIconBox}>
                <Ionicons name="mail" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user.email}</Text>
              </View>
              <View style={styles.copyIconBox}>
                <Ionicons 
                  name={copied === 'البريد الإلكتروني' ? 'checkmark' : 'copy-outline'} 
                  size={20} 
                  color={copied === 'البريد الإلكتروني' ? '#10B981' : '#1E3A8A'} 
                />
              </View>
            </TouchableOpacity>

            {/* Location */}
            {(user.city || user.area) && (
              <TouchableOpacity
                style={styles.infoCard}
                onPress={() => copyToClipboard(`${user.city || ''}${user.area ? ', ' + user.area : ''}`, 'الموقع')}
                activeOpacity={0.7}
              >
                <View style={styles.infoCardBorder} />
                <View style={styles.infoIconBox}>
                  <Ionicons name="location" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>الموقع</Text>
                  <Text style={styles.infoValue}>
                    {user.city || 'غير محدد'}
                    {user.area && `, ${user.area}`}
                  </Text>
                </View>
                <View style={styles.copyIconBox}>
                  <Ionicons 
                    name={copied === 'الموقع' ? 'checkmark' : 'copy-outline'} 
                    size={20} 
                    color={copied === 'الموقع' ? '#10B981' : '#1E3A8A'} 
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Experience */}
            {!isEmployer && user.experience_years !== undefined && (
              <View style={styles.infoCard}>
                <View style={styles.infoCardBorder} />
                <View style={styles.infoIconBox}>
                  <Ionicons name="calendar" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>سنوات الخبرة</Text>
                  <Text style={styles.infoValue}>{user.experience_years} سنوات</Text>
                </View>
              </View>
            )}
          </View>

          {/* Skills */}
          {!isEmployer && user.skills && user.skills.length > 0 && (
            <View style={styles.skillsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDecor} />
                <Text style={styles.sectionTitle}>المهارات</Text>
                <View style={styles.sectionDecor} />
              </View>
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

          {/* Bio */}
          {user.bio && (
            <View style={styles.bioSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDecor} />
                <Text style={styles.sectionTitle}>نبذة عني</Text>
                <View style={styles.sectionDecor} />
              </View>
              <View style={styles.bioBox}>
                <View style={styles.bioLeftBorder} />
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            </View>
          )}

          {/* Decorative Pattern Bottom */}
          <View style={styles.cardBottomPattern}>
            <View style={styles.zigzagContainer}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.zigzagItem} />
              ))}
            </View>
          </View>

          {/* App Branding */}
          <View style={styles.branding}>
            <View style={styles.brandingLine} />
            <Text style={styles.brandingText}>أعمال حرة</Text>
            <View style={styles.brandingLine} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>تعديل المعلومات</Text>
          </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#D97706',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: '#D97706',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#1E3A8A',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '100%',
    alignItems: 'center',
  },
  patternDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  imageSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: '#D97706',
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#D97706',
  },
  imageDecor1: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  imageDecor2: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    width: 24,
    height: 24,
    backgroundColor: '#D97706',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 8,
  },
  professionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  professionDecor: {
    width: 30,
    height: 2,
    backgroundColor: '#D97706',
  },
  profession: {
    fontSize: 18,
    color: '#92400E',
    fontWeight: '600',
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 8,
  },
  lineSegment: {
    flex: 1,
    height: 2,
    backgroundColor: '#FDE68A',
  },
  centerDiamond: {
    width: 12,
    height: 12,
    backgroundColor: '#D97706',
    transform: [{ rotate: '45deg' }],
  },
  infoSection: {
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
    position: 'relative',
    gap: 12,
  },
  infoCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1E3A8A',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  infoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  copyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  skillsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionDecor: {
    width: 40,
    height: 3,
    backgroundColor: '#D97706',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  skillChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    position: 'relative',
  },
  skillChipDecor: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  skillText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  bioSection: {
    marginBottom: 20,
  },
  bioBox: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
    position: 'relative',
  },
  bioLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#D97706',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 22,
    textAlign: 'center',
  },
  cardBottomPattern: {
    marginTop: 20,
    marginBottom: 16,
  },
  zigzagContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  zigzagItem: {
    width: 16,
    height: 16,
    backgroundColor: '#1E3A8A',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: '#D97706',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  brandingLine: {
    width: 50,
    height: 2,
    backgroundColor: '#D97706',
  },
  brandingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

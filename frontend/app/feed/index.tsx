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
  Image,
  RefreshControl,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PublicFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedProfession]);

  const loadData = async () => {
    try {
      // Load posts
      let url = `${BACKEND_URL}/api/posts/public?limit=50`;
      if (selectedProfession) {
        url += `&profession=${encodeURIComponent(selectedProfession)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const [postsRes, professionsRes, statusRes] = await Promise.all([
        fetch(url),
        fetch(`${BACKEND_URL}/api/posts/professions`),
        user ? fetch(`${BACKEND_URL}/api/posts/my-status`, { credentials: 'include' }) : Promise.resolve(null)
      ]);

      const postsData = await postsRes.json();
      const professionsData = await professionsRes.json();
      
      setPosts(postsData);
      setProfessions(professionsData);

      if (statusRes) {
        const statusData = await statusRes.json();
        setIsPublished(statusData.is_published);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = () => {
    setLoading(true);
    loadData();
  };

  const togglePublish = async () => {
    try {
      if (isPublished) {
        await fetch(`${BACKEND_URL}/api/posts/unpublish`, {
          method: 'DELETE',
          credentials: 'include',
        });
        Alert.alert('✓ تم', 'تم إزالة بطاقتك من النشر العام');
        setIsPublished(false);
      } else {
        await fetch(`${BACKEND_URL}/api/posts/publish`, {
          method: 'POST',
          credentials: 'include',
        });
        Alert.alert('✓ تم', 'تم نشر بطاقتك في النشر العام');
        setIsPublished(true);
      }
      loadData();
    } catch (error) {
      Alert.alert('خطأ', 'فشل تحديث حالة النشر');
    }
  };

  const copyInfo = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('✓ تم النسخ', `تم نسخ ${label}:\n${text}`);
  };

  const contactUser = (userId: string, userName: string) => {
    router.push(`/messages/${userId}?name=${encodeURIComponent(userName)}`);
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBorder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>النشر العام</Text>
          <TouchableOpacity
            style={styles.searchToggle}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#92400E" />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن مهنة أو اسم..."
              placeholderTextColor="#B45309"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                handleSearch();
              }}>
                <Ionicons name="close-circle" size={20} color="#92400E" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Professions Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.professionsScroll}
        contentContainerStyle={styles.professionsContent}
      >
        <TouchableOpacity
          style={[
            styles.professionChip,
            !selectedProfession && styles.professionChipActive,
          ]}
          onPress={() => setSelectedProfession(null)}
        >
          <Text
            style={[
              styles.professionText,
              !selectedProfession && styles.professionTextActive,
            ]}
          >
            الكل
          </Text>
        </TouchableOpacity>
        {professions.map((prof, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.professionChip,
              selectedProfession === prof && styles.professionChipActive,
            ]}
            onPress={() => setSelectedProfession(prof)}
          >
            <Text
              style={[
                styles.professionText,
                selectedProfession === prof && styles.professionTextActive,
              ]}
            >
              {prof}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Publish Button */}
      {user && (
        <View style={styles.publishSection}>
          <TouchableOpacity
            style={[
              styles.publishButton,
              isPublished && styles.publishButtonActive,
            ]}
            onPress={togglePublish}
          >
            <Ionicons
              name={isPublished ? 'eye-off' : 'eye'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.publishButtonText}>
              {isPublished ? 'إخفاء بطاقتي' : 'نشر بطاقتي'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Posts List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D97706" />
            <Text style={styles.emptyText}>لا توجد بطاقات منشورة</Text>
            <Text style={styles.emptySubtext}>كن أول من ينشر بطاقته!</Text>
          </View>
        ) : (
          <View style={styles.postsList}>
            {posts.map((post) => (
              <View key={post.post_id} style={styles.postCard}>
                <View style={styles.cardTopBorder} />
                
                {/* User Header */}
                <View style={styles.postHeader}>
                  <View style={styles.userInfo}>
                    {post.picture ? (
                      <Image source={{ uri: post.picture }} style={styles.userAvatar} />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Ionicons name="person" size={24} color="#D97706" />
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{post.user_name}</Text>
                      <View style={styles.userTypeBadge}>
                        <Ionicons
                          name={post.user_type === 'employer' ? 'briefcase' : 'person'}
                          size={12}
                          color="#FFFFFF"
                        />
                        <Text style={styles.userTypeText}>
                          {post.user_type === 'employer' ? 'صاحب عمل' : 'باحث'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Profession */}
                {post.profession && (
                  <View style={styles.professionRow}>
                    <Ionicons name="briefcase" size={16} color="#1E3A8A" />
                    <Text style={styles.professionLabel}>{post.profession}</Text>
                  </View>
                )}

                {/* Contact Info */}
                <View style={styles.contactInfo}>
                  {post.phone && (
                    <TouchableOpacity
                      style={styles.infoRow}
                      onPress={() => copyInfo(post.phone, 'رقم الهاتف')}
                    >
                      <Ionicons name="call" size={16} color="#059669" />
                      <Text style={styles.infoText}>{post.phone}</Text>
                      <Ionicons name="copy-outline" size={14} color="#D97706" />
                    </TouchableOpacity>
                  )}
                  
                  {post.city && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={16} color="#059669" />
                      <Text style={styles.infoText}>
                        {post.city}{post.area ? `, ${post.area}` : ''}
                      </Text>
                    </View>
                  )}

                  {post.experience_years !== undefined && post.experience_years !== null && (
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar" size={16} color="#059669" />
                      <Text style={styles.infoText}>{post.experience_years} سنوات خبرة</Text>
                    </View>
                  )}
                </View>

                {/* Skills */}
                {post.skills && post.skills.length > 0 && (
                  <View style={styles.skillsSection}>
                    <View style={styles.skillsGrid}>
                      {post.skills.slice(0, 4).map((skill: string, index: number) => (
                        <View key={index} style={styles.skillTag}>
                          <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                      ))}
                      {post.skills.length > 4 && (
                        <Text style={styles.moreSkills}>+{post.skills.length - 4}</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Bio */}
                {post.bio && (
                  <Text style={styles.bio} numberOfLines={3}>
                    {post.bio}
                  </Text>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => contactUser(post.user_id, post.user_name)}
                >
                  <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>تواصل معي</Text>
                </TouchableOpacity>

                <View style={styles.cardBottomDecor} />
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
  searchToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(217, 119, 6, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 2,
    borderColor: '#D97706',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A8A',
  },
  professionsScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FDE68A',
    maxHeight: 60,
  },
  professionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  professionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  professionChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  professionText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  professionTextActive: {
    color: '#FFFFFF',
  },
  publishSection: {
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 2,
    borderBottomColor: '#FDE68A',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#059669',
  },
  publishButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  postsList: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#1E3A8A',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#92400E',
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#D97706',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#1E3A8A',
  },
  postHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#D97706',
  },
  userAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D97706',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  professionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  professionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  contactInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
  },
  skillsSection: {
    marginBottom: 12,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  skillTagText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  moreSkills: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'center',
  },
  bio: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardBottomDecor: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 60,
    height: 4,
    backgroundColor: '#D97706',
  },
});

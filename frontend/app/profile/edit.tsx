import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    profession: user?.profession || '',
    experience_years: user?.experience_years?.toString() || '',
    bio: user?.bio || '',
    city: user?.city || '',
    area: user?.area || '',
    skills: user?.skills?.join(', ') || '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          experience_years: formData.experience_years
            ? parseInt(formData.experience_years)
            : undefined,
          skills: formData.skills
            ? formData.skills.split(',').map((s) => s.trim()).filter((s) => s)
            : [],
        }),
      });

      if (response.ok) {
        const updatedUserData = await response.json();
        updateUser(updatedUserData);
        Alert.alert('نجاح', 'تم تحديث الملف الشخصي', [
          { text: 'حسناً', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('خطأ', 'فشل تحديث الملف الشخصي');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const isEmployer = user?.user_type === 'employer';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="05xxxxxxxx"
                keyboardType="phone-pad"
              />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>المدينة</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="مثل: الرياض"
              />
            </View>

            {/* Area */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>المنطقة</Text>
              <TextInput
                style={styles.input}
                value={formData.area}
                onChangeText={(text) => setFormData({ ...formData, area: text })}
                placeholder="مثل: حي الملك فهد"
              />
            </View>

            {!isEmployer && (
              <>
                {/* Profession */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>المهنة</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.profession}
                    onChangeText={(text) =>
                      setFormData({ ...formData, profession: text })
                    }
                    placeholder="مثل: مطور تطبيقات جوال"
                  />
                </View>

                {/* Experience Years */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>سنوات الخبرة</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.experience_years}
                    onChangeText={(text) =>
                      setFormData({ ...formData, experience_years: text })
                    }
                    placeholder="مثل: 5"
                    keyboardType="numeric"
                  />
                </View>

                {/* Skills */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>المهارات (مفصولة بفاصلة)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.skills}
                    onChangeText={(text) =>
                      setFormData({ ...formData, skills: text })
                    }
                    placeholder="مثل: React, Node.js, Python"
                  />
                </View>
              </>
            )}

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نبذة عني</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="اكتب نبذة مختصرة عنك..."
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
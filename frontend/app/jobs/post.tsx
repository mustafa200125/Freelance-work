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

export default function PostJobScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    job_type: 'full_time',
    salary_type: ['monthly'],
    salary_min: '',
    salary_max: '',
    salary_negotiable: false,
    city: '',
    area: '',
    requirements: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.city || !formData.area) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        }),
      });

      if (response.ok) {
        Alert.alert('نجاح', 'تم نشر الوظيفة بنجاح', [
          { text: 'حسناً', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('خطأ', 'فشل نشر الوظيفة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const toggleSalaryType = (type: string) => {
    const currentTypes = [...formData.salary_type];
    const index = currentTypes.indexOf(type);
    if (index > -1) {
      if (currentTypes.length > 1) {
        currentTypes.splice(index, 1);
      }
    } else {
      currentTypes.push(type);
    }
    setFormData({ ...formData, salary_type: currentTypes });
  };

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
          <Text style={styles.headerTitle}>نشر وظيفة</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>عنوان الوظيفة *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="مثل: مطور تطبيقات جوال"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>وصف الوظيفة *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="اكتب وصف مفصل للوظيفة..."
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Job Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع الوظيفة</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.job_type === 'full_time' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, job_type: 'full_time' })}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.job_type === 'full_time' && styles.radioTextActive,
                    ]}
                  >
                    دوام كامل
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.job_type === 'part_time' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, job_type: 'part_time' })}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.job_type === 'part_time' && styles.radioTextActive,
                    ]}
                  >
                    دوام جزئي
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.job_type === 'remote' && styles.radioButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, job_type: 'remote' })}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.job_type === 'remote' && styles.radioTextActive,
                    ]}
                  >
                    عن بُعد
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Salary Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع الراتب (يمكن اختيار أكثر من واحد)</Text>
              <View style={styles.checkboxGroup}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleSalaryType('daily')}
                >
                  <Ionicons
                    name={
                      formData.salary_type.includes('daily')
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color="#4F46E5"
                  />
                  <Text style={styles.checkboxText}>يومي</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleSalaryType('weekly')}
                >
                  <Ionicons
                    name={
                      formData.salary_type.includes('weekly')
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color="#4F46E5"
                  />
                  <Text style={styles.checkboxText}>أسبوعي</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleSalaryType('monthly')}
                >
                  <Ionicons
                    name={
                      formData.salary_type.includes('monthly')
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color="#4F46E5"
                  />
                  <Text style={styles.checkboxText}>شهري</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Salary Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نطاق الراتب</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={formData.salary_min}
                  onChangeText={(text) =>
                    setFormData({ ...formData, salary_min: text })
                  }
                  placeholder="من"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={formData.salary_max}
                  onChangeText={(text) =>
                    setFormData({ ...formData, salary_max: text })
                  }
                  placeholder="إلى"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>المدينة *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="مثل: الرياض"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>المنطقة *</Text>
              <TextInput
                style={styles.input}
                value={formData.area}
                onChangeText={(text) => setFormData({ ...formData, area: text })}
                placeholder="مثل: حي الملك فهد"
              />
            </View>

            {/* Requirements */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>المتطلبات</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.requirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, requirements: text })
                }
                placeholder="مثل: خبرة 3 سنوات، معرفة بـ..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'جاري النشر...' : 'نشر الوظيفة'}
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  radioText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxText: {
    fontSize: 16,
    color: '#4B5563',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
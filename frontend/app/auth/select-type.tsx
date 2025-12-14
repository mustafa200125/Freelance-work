import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function SelectType() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (userType: 'job_seeker' | 'employer') => {
    setLoading(true);
    try {
      await login(userType);
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>مرحباً بك في تطبيق التوظيف</Text>
        <Text style={styles.subtitle}>اختر نوع حسابك للمتابعة</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, styles.jobSeekerOption]}
            onPress={() => handleLogin('job_seeker')}
            disabled={loading}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={48} color="#4F46E5" />
            </View>
            <Text style={styles.optionTitle}>باحث عن عمل</Text>
            <Text style={styles.optionDescription}>
              ابحث عن فرص عمل وقدم على الوظائف
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.employerOption]}
            onPress={() => handleLogin('employer')}
            disabled={loading}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="briefcase-outline" size={48} color="#10B981" />
            </View>
            <Text style={styles.optionTitle}>صاحب عمل</Text>
            <Text style={styles.optionDescription}>
              انشر وظائف واستقطب المواهب
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <Text style={styles.loadingText}>جاري تسجيل الدخول...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  jobSeekerOption: {
    borderColor: '#4F46E5',
  },
  employerOption: {
    borderColor: '#10B981',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
});
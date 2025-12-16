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
        {/* Header with Mesopotamian Pattern */}
        <View style={styles.headerPattern}>
          <View style={styles.patternRow}>
            <View style={[styles.patternBox, styles.box1]} />
            <View style={[styles.patternBox, styles.box2]} />
            <View style={[styles.patternBox, styles.box1]} />
          </View>
        </View>

        <Text style={styles.title}>مرحباً بك في أعمال حرة</Text>
        <Text style={styles.subtitle}>اختر نوع حسابك للمتابعة</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, styles.jobSeekerOption]}
            onPress={() => handleLogin('job_seeker')}
            disabled={loading}
          >
            <View style={styles.cardPattern}>
              <View style={styles.cornerDecor} />
            </View>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={48} color="#1E3A8A" />
            </View>
            <Text style={styles.optionTitle}>باحث عن عمل</Text>
            <Text style={styles.optionDescription}>
              ابحث عن فرص عمل وقدم على الوظائف
            </Text>
            <View style={styles.cardBottomPattern}>
              <View style={styles.babylonianLine} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.employerOption]}
            onPress={() => handleLogin('employer')}
            disabled={loading}
          >
            <View style={styles.cardPattern}>
              <View style={styles.cornerDecor} />
            </View>
            <View style={styles.iconContainer}>
              <Ionicons name="briefcase-outline" size={48} color="#D97706" />
            </View>
            <Text style={styles.optionTitle}>صاحب عمل</Text>
            <Text style={styles.optionDescription}>
              انشر وظائف واستقطب المواهب
            </Text>
            <View style={styles.cardBottomPattern}>
              <View style={styles.babylonianLine} />
            </View>
          </TouchableOpacity>
        </View>

        {loading && (
          <Text style={styles.loadingText}>جاري تسجيل الدخول...</Text>
        )}

        {/* Bottom Mesopotamian Pattern */}
        <View style={styles.bottomPattern}>
          <View style={styles.zigzagPattern}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.zigzagItem} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerPattern: {
    alignItems: 'center',
    marginBottom: 32,
  },
  patternRow: {
    flexDirection: 'row',
    gap: 8,
  },
  patternBox: {
    width: 30,
    height: 30,
    borderWidth: 2,
  },
  box1: {
    backgroundColor: '#1E3A8A',
    borderColor: '#D97706',
  },
  box2: {
    backgroundColor: '#D97706',
    borderColor: '#1E3A8A',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 48,
  },
  optionsContainer: {
    gap: 20,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  jobSeekerOption: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  employerOption: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  cornerDecor: {
    width: 50,
    height: 50,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#D97706',
    opacity: 0.3,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#D97706',
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  cardBottomPattern: {
    marginTop: 16,
    width: '100%',
  },
  babylonianLine: {
    height: 3,
    backgroundColor: '#D97706',
    width: '60%',
    alignSelf: 'center',
  },
  loadingText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#92400E',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPattern: {
    marginTop: 40,
    alignItems: 'center',
  },
  zigzagPattern: {
    flexDirection: 'row',
    gap: 4,
  },
  zigzagItem: {
    width: 20,
    height: 20,
    backgroundColor: '#1E3A8A',
    transform: [{ rotate: '45deg' }],
  },
});
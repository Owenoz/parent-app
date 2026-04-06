import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import coursesService from '../services/courses.service';
import progressService from '../services/progress.service';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [dashboardData, setDashboardData] = useState({
    recentCourses: [],
    progressSummary: {
      totalCourses: 0,
      activeCourses: 0,
      completedCourses: 0,
      overallProgress: 0,
    },
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardResult, enrollmentsResult] = await Promise.allSettled([
        progressService.getDashboardStats(),
        coursesService.getMyEnrollments(),
      ]);

      const dashboardStats = dashboardResult.status === 'fulfilled' && dashboardResult.value.success
        ? dashboardResult.value.data
        : {};
      
      const enrollments = enrollmentsResult.status === 'fulfilled' && enrollmentsResult.value.success
        ? enrollmentsResult.value.data
        : [];

      const recentCourses = enrollments.slice(0, 3).map(enrollment => ({
        id: enrollment.course_id,
        title: enrollment.course?.title || 'Course',
        instructor: enrollment.course?.instructor || 'Instructor',
        image: enrollment.course?.image,
        progress: enrollment.progress || 0,
      }));

      setDashboardData({
        recentCourses,
        progressSummary: {
          totalCourses: enrollments.length,
          activeCourses: enrollments.filter(e => e.enrollment_status === 'active').length,
          completedCourses: enrollments.filter(e => e.enrollment_status === 'completed').length,
          overallProgress: dashboardStats.overallProgress || 0,
        },
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ icon, label, value, gradient, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradient} style={styles.statGradient}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={28} color="#ffffff" />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ icon, title, subtitle, gradient, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradient} style={styles.actionGradient}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon} size={32} color="#ffffff" />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const CourseCard = ({ course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.courseImagePlaceholder}
      >
        <Ionicons name="book" size={40} color="#ffffff" />
      </LinearGradient>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.courseInstructor} numberOfLines={1}>{course.instructor}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{course.progress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      {/* Hero Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.hero}>
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.heroName}>{user?.name || 'Student'} 👋</Text>
            <Text style={styles.heroSubtext}>Ready to learn something new?</Text>
          </View>
          {user?.avatar ? (
            <View style={styles.heroAvatar}>
              <Ionicons name="person" size={32} color="#ffffff" />
            </View>
          ) : (
            <View style={styles.heroAvatar}>
              <Ionicons name="person" size={32} color="#ffffff" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="book"
          label="Total Courses"
          value={dashboardData.progressSummary.totalCourses}
          gradient={['#667eea', '#764ba2']}
          onPress={() => navigation.navigate('Courses')}
        />
        <StatCard
          icon="play-circle"
          label="Active"
          value={dashboardData.progressSummary.activeCourses}
          gradient={['#f093fb', '#f5576c']}
          onPress={() => navigation.navigate('Courses')}
        />
        <StatCard
          icon="checkmark-circle"
          label="Completed"
          value={dashboardData.progressSummary.completedCourses}
          gradient={['#4facfe', '#00f2fe']}
          onPress={() => navigation.navigate('Courses')}
        />
        <StatCard
          icon="trending-up"
          label="Progress"
          value={`${dashboardData.progressSummary.overallProgress}%`}
          gradient={['#43e97b', '#38f9d7']}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionCard
          icon="sparkles"
          title="AI Study Tools"
          subtitle="Get help from AI tutor"
          gradient={['#fa709a', '#fee140']}
          onPress={() => navigation.navigate('AI Tools')}
        />
        <QuickActionCard
          icon="clipboard"
          title="Assessments"
          subtitle="View assignments & quizzes"
          gradient={['#30cfd0', '#330867']}
          onPress={() => navigation.navigate('Assessments')}
        />
        <QuickActionCard
          icon="trophy"
          title="Certificates"
          subtitle="View your achievements"
          gradient={['#a8edea', '#fed6e3']}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      {/* Recent Courses */}
      {dashboardData.recentCourses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>
      )}

      {/* Empty State */}
      {dashboardData.recentCourses.length === 0 && (
        <View style={styles.emptyState}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyIcon}>
            <Ionicons name="book-outline" size={48} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Courses Yet</Text>
          <Text style={styles.emptyText}>Start your learning journey by enrolling in a course</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyButtonGradient}>
              <Text style={styles.emptyButtonText}>Browse Courses</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineBar}>
          <Ionicons name="cloud-offline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>You're offline</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    margin: 6,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  courseImagePlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    width: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  offlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  offlineText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default DashboardScreen;

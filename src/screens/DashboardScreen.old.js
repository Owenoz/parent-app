import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import coursesService from '../services/courses.service';
import progressService from '../services/progress.service';
import assessmentsService from '../services/assessments.service';

const DashboardScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline, manualSync } = useNetwork();
  
  const [dashboardData, setDashboardData] = useState({
    recentCourses: [],
    activeAssignments: [],
    upcomingQuizzes: [],
    progressSummary: {},
    certificates: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard data in parallel
      const [
        dashboardResult,
        enrollmentsResult,
      ] = await Promise.allSettled([
        progressService.getDashboardStats(),
        coursesService.getMyEnrollments(),
      ]);

      const dashboardStats = dashboardResult.status === 'fulfilled' && dashboardResult.value.success
        ? dashboardResult.value.data
        : {};
      
      const enrollments = enrollmentsResult.status === 'fulfilled' && enrollmentsResult.value.success
        ? enrollmentsResult.value.data
        : [];

      // Extract courses from enrollments
      const recentCourses = enrollments.slice(0, 5).map(enrollment => ({
        id: enrollment.course_id,
        title: enrollment.course?.title || 'Course',
        instructor: enrollment.course?.instructor || 'Instructor',
        image: enrollment.course?.image,
        progress: enrollment.progress || 0,
      }));

      const data = {
        recentCourses,
        activeAssignments: [],
        upcomingQuizzes: [],
        progressSummary: {
          totalCourses: enrollments.length,
          activeCourses: enrollments.filter(e => e.enrollment_status === 'active').length,
          completedCourses: enrollments.filter(e => e.enrollment_status === 'completed').length,
          overallProgress: dashboardStats.overallProgress || 0,
        },
        certificates: dashboardStats.certificates || [],
      };

      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSync = async () => {
    const result = await manualSync();
    if (result.success) {
      Alert.alert('Sync Complete', 'Your data has been synchronized');
    } else {
      Alert.alert('Sync Failed', result.message);
    }
  };

  const navigateToCourses = () => {
    navigation.navigate('Courses');
  };

  const navigateToAITools = () => {
    navigation.navigate('AI Tools');
  };

  const navigateToAssessments = () => {
    navigation.navigate('Assessments');
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ef4444';
    if (percentage < 70) return '#f59e0b';
    return '#10b981';
  };

  const accessibilityStyles = getAccessibilityStyles();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={settings.isHighContrast ? ['#ffffff', '#ffffff'] : ['#2563eb', '#1e40af']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, accessibilityStyles]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, accessibilityStyles]}>
              {user?.name || 'Student'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
                  {user?.firstName?.[0] || user?.name?.[0] || 'S'}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        {isOffline && (
          <View style={styles.connectionStatus}>
            <Ionicons name="wifi-outline" size={16} color="#ffffff" />
            <Text style={styles.connectionText}>Offline Mode</Text>
            <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
              <Ionicons name="sync-outline" size={16} color="#ffffff" />
              <Text style={styles.syncText}>Sync</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }]}
            onPress={navigateToCourses}
            accessibilityLabel="Browse Courses"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.actionIcon}
            >
              <Ionicons name="book-outline" size={24} color="#ffffff" />
            </LinearGradient>
            <Text style={[styles.actionText, accessibilityStyles]}>Browse Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }]}
            onPress={navigateToAITools}
            accessibilityLabel="AI Study Tools"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.actionIcon}
            >
              <Ionicons name="sparkles-outline" size={24} color="#ffffff" />
            </LinearGradient>
            <Text style={[styles.actionText, accessibilityStyles]}>AI Study Tools</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }]}
            onPress={navigateToAssessments}
            accessibilityLabel="View Assignments"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.actionIcon}
            >
              <Ionicons name="clipboard-outline" size={24} color="#ffffff" />
            </LinearGradient>
            <Text style={[styles.actionText, accessibilityStyles]}>View Assignments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.actionIcon}
            >
              <Ionicons name="settings-outline" size={24} color="#ffffff" />
            </LinearGradient>
            <Text style={[styles.actionText, accessibilityStyles]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Summary */}
      {dashboardData.progressSummary.totalCourses > 0 && (
        <View style={[styles.card, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.cardTitle, accessibilityStyles]}>Learning Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, accessibilityStyles]}>
                Overall Progress
              </Text>
              <Text style={[styles.progressValue, accessibilityStyles]}>
                {dashboardData.progressSummary.overallProgress || 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${dashboardData.progressSummary.overallProgress || 0}%`,
                    backgroundColor: getProgressColor(dashboardData.progressSummary.overallProgress || 0),
                  },
                ]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, accessibilityStyles]}>
                  {dashboardData.progressSummary.completedCourses || 0}
                </Text>
                <Text style={[styles.statLabel, accessibilityStyles]}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, accessibilityStyles]}>
                  {dashboardData.progressSummary.activeCourses || 0}
                </Text>
                <Text style={[styles.statLabel, accessibilityStyles]}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, accessibilityStyles]}>
                  {dashboardData.progressSummary.totalCourses || 0}
                </Text>
                <Text style={[styles.statLabel, accessibilityStyles]}>Total</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Recent Courses */}
      {dashboardData.recentCourses.length > 0 && (
        <View style={[styles.card, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.cardTitle, accessibilityStyles]}>Recent Courses</Text>
          {dashboardData.recentCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseItem}
              onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
              accessibilityLabel={`Open ${course.title}`}
              accessibilityRole="button"
            >
              {course.image ? (
                <Image
                  source={{ uri: course.image }}
                  style={styles.courseImage}
                />
              ) : (
                <View style={[styles.courseImage, { backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="book-outline" size={24} color="#9ca3af" />
                </View>
              )}
              <View style={styles.courseInfo}>
                <Text style={[styles.courseTitle, accessibilityStyles]} numberOfLines={1}>
                  {course.title}
                </Text>
                <Text style={[styles.courseInstructor, accessibilityStyles]} numberOfLines={1}>
                  {course.instructor}
                </Text>
                <View style={styles.courseMeta}>
                  <Text style={[styles.courseProgress, accessibilityStyles]}>
                    {course.progress || 0}%
                  </Text>
                  <View style={styles.progressSmallBar}>
                    <View
                      style={[
                        styles.progressSmallFill,
                        {
                          width: `${course.progress || 0}%`,
                          backgroundColor: getProgressColor(course.progress || 0),
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={navigateToCourses}
            accessibilityLabel="View All Courses"
            accessibilityRole="button"
          >
            <Text style={[styles.viewAllText, accessibilityStyles]}>View All Courses</Text>
            <Ionicons name="arrow-forward" size={16} color="#2563eb" />
          </TouchableOpacity>
        </View>
      )}

      {/* Active Assignments */}
      {dashboardData.activeAssignments.length > 0 && (
        <View style={[styles.card, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.cardTitle, accessibilityStyles]}>Active Assignments</Text>
          {dashboardData.activeAssignments.slice(0, 3).map((assignment) => (
            <TouchableOpacity
              key={assignment.id}
              style={styles.assignmentItem}
              onPress={() => navigation.navigate('Assignment', { assignmentId: assignment.id })}
              accessibilityLabel={`Open ${assignment.title}`}
              accessibilityRole="button"
            >
              <View style={styles.assignmentIcon}>
                <Ionicons name="document-text-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={[styles.assignmentTitle, accessibilityStyles]} numberOfLines={1}>
                  {assignment.title}
                </Text>
                <Text style={[styles.assignmentCourse, accessibilityStyles]} numberOfLines={1}>
                  {assignment.courseTitle}
                </Text>
                <Text style={[styles.assignmentDue, accessibilityStyles]}>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.assignmentStatus,
                { backgroundColor: assignment.isOverdue ? '#fee2e2' : '#dcfce7' }
              ]}>
                <Text style={[
                  styles.assignmentStatusText,
                  { color: assignment.isOverdue ? '#dc2626' : '#166534' }
                ]}>
                  {assignment.isOverdue ? 'Overdue' : 'Active'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Certificates */}
      {dashboardData.certificates.length > 0 && (
        <View style={[styles.card, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.cardTitle, accessibilityStyles]}>Recent Certificates</Text>
          <View style={styles.certificateGrid}>
            {dashboardData.certificates.slice(0, 4).map((certificate) => (
              <TouchableOpacity
                key={certificate.id}
                style={styles.certificateItem}
                onPress={() => navigation.navigate('Certificate', { certificateId: certificate.id })}
                accessibilityLabel={`View ${certificate.title}`}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.certificateIcon}
                >
                  <Ionicons name="medal-outline" size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={[styles.certificateTitle, accessibilityStyles]} numberOfLines={2}>
                  {certificate.title}
                </Text>
                <Text style={[styles.certificateDate, accessibilityStyles]}>
                  {new Date(certificate.date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {dashboardData.recentCourses.length === 0 && dashboardData.activeAssignments.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Ionicons name="school-outline" size={64} color="#94a3b8" />
          <Text style={[styles.emptyTitle, accessibilityStyles]}>Ready to Learn?</Text>
          <Text style={[styles.emptySubtitle, accessibilityStyles]}>
            Start your learning journey by browsing our courses
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={navigateToCourses}
            accessibilityLabel="Browse Courses"
            accessibilityRole="button"
          >
            <Text style={styles.emptyButtonText}>Browse Courses</Text>
          </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  connectionText: {
    fontSize: 12,
    color: '#e5e7eb',
    marginLeft: 8,
    flex: 1,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  courseImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseProgress: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
    minWidth: 30,
  },
  progressSmallBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressSmallFill: {
    height: '100%',
    borderRadius: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginRight: 8,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  assignmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  assignmentCourse: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  assignmentDue: {
    fontSize: 12,
    color: '#64748b',
  },
  assignmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  assignmentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  certificateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  certificateItem: {
    width: '48%',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  certificateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  certificateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 4,
  },
  certificateDate: {
    fontSize: 12,
    color: '#d97706',
  },
  emptyState: {
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
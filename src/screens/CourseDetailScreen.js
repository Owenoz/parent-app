import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import coursesService from '../services/courses.service';
import contentService from '../services/content.service';

const CourseDetailScreen = ({ navigation, route }) => {
  const { courseId } = route.params;
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, []);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      
      const [courseResult, curriculumResult] = await Promise.allSettled([
        coursesService.getCourseDetails(courseId),
        coursesService.getCourseCurriculum(courseId),
      ]);

      if (courseResult.status === 'fulfilled' && courseResult.value.success) {
        setCourse(courseResult.value.data);
        // Check if user is enrolled by checking enrollments
        const enrollmentsResult = await coursesService.getMyEnrollments();
        if (enrollmentsResult.success) {
          const isEnrolled = enrollmentsResult.data.some(e => e.course_id === courseId);
          setEnrollmentStatus(isEnrolled ? 'enrolled' : 'pending');
        }
      }

      if (curriculumResult.status === 'fulfilled' && curriculumResult.value.success) {
        // Extract lessons from curriculum units
        const allLessons = [];
        if (curriculumResult.value.data.units) {
          curriculumResult.value.data.units.forEach(unit => {
            if (unit.lessons) {
              allLessons.push(...unit.lessons);
            }
          });
        }
        setLessons(allLessons);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      Alert.alert('Error', 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourseData();
    setRefreshing(false);
  };

  const handleEnrollment = async () => {
    if (course.fee > 0) {
      // Navigate to payment screen for paid courses
      navigation.navigate('Payment', { 
        courseId, 
        amount: course.fee,
        courseTitle: course.title
      });
    } else {
      // Free course enrollment
      try {
        const result = await coursesService.enrollInCourse(courseId);
        if (result.success) {
          Alert.alert('Success', 'Course enrolled successfully!');
          setEnrollmentStatus('enrolled');
          loadCourseData(); // Refresh the data
        } else {
          Alert.alert('Error', result.error || 'Failed to enroll in course');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enroll in course. Please try again.');
      }
    }
  };

  const handleStartLesson = (lesson) => {
    if (enrollmentStatus !== 'enrolled') {
      Alert.alert('Enrollment Required', 'Please enroll in the course first.');
      return;
    }
    
    // Check prerequisites
    const hasPrerequisites = lesson.prerequisites && lesson.prerequisites.length > 0;
    if (hasPrerequisites) {
      // Check if prerequisites are completed
      const completedPrerequisites = lessons.filter(l => 
        lesson.prerequisites.includes(l.id) && l.status === 'completed'
      );
      
      if (completedPrerequisites.length !== lesson.prerequisites.length) {
        Alert.alert('Prerequisites Required', 'Complete prerequisite lessons first.');
        return;
      }
    }
    
    setSelectedLesson(lesson);
    setIsLessonModalVisible(true);
  };

  const handleLessonComplete = async () => {
    try {
      const result = await contentService.markContentComplete(selectedLesson.id);
      if (result.success) {
        Alert.alert('Success', 'Lesson completed!');
        setIsLessonModalVisible(false);
        loadCourseData(); // Refresh the data
      } else {
        Alert.alert('Error', result.error || 'Failed to complete lesson');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete lesson. Please try again.');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ef4444';
    if (percentage < 70) return '#f59e0b';
    return '#10b981';
  };

  const getLessonStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'locked': return '#64748b';
      default: return '#94a3b8';
    }
  };

  const getLessonStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'locked': return 'Locked';
      default: return 'Pending';
    }
  };

  const renderLessonItem = ({ item: lesson }) => {
    const accessibilityStyles = getAccessibilityStyles();
    const statusColor = getLessonStatusColor(lesson.status);
    const statusText = getLessonStatusText(lesson.status);

    return (
      <TouchableOpacity
        style={[
          styles.lessonCard,
          { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' },
          lesson.status === 'locked' && styles.lockedLesson
        ]}
        onPress={() => handleStartLesson(lesson)}
        disabled={lesson.status === 'locked'}
        accessibilityLabel={`Open ${lesson.title}`}
        accessibilityRole="button"
      >
        <View style={styles.lessonHeader}>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, accessibilityStyles]} numberOfLines={2}>
              {lesson.title}
            </Text>
            <Text style={[styles.lessonDuration, accessibilityStyles]}>
              {lesson.duration} minutes
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.lessonDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="book-outline" size={14} color="#64748b" />
            <Text style={[styles.detailText, accessibilityStyles]}>
              Type: {lesson.type}
            </Text>
          </View>
          
          {lesson.prerequisites && lesson.prerequisites.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="lock-closed-outline" size={14} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                Prerequisites: {lesson.prerequisites.length} lessons
              </Text>
            </View>
          )}
          
          {lesson.quizAvailable && (
            <View style={styles.detailRow}>
              <Ionicons name="help-circle-outline" size={14} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                Assessment available
              </Text>
            </View>
          )}
        </View>

        {lesson.status === 'completed' && (
          <View style={styles.completedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={[styles.completedText, accessibilityStyles]}>Completed</Text>
          </View>
        )}

        {lesson.status === 'locked' && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const accessibilityStyles = getAccessibilityStyles();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={settings.isHighContrast ? ['#ffffff', '#ffffff'] : ['#2563eb', '#1e40af']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, accessibilityStyles]}>Course Details</Text>
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Course Information */}
      {course && (
        <View style={[styles.courseInfoContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <View style={styles.courseImageContainer}>
            {course.image ? (
              <Image
                source={{ uri: course.image }}
                style={styles.courseImage}
              />
            ) : (
              <View style={[styles.courseImage, { backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="book-outline" size={48} color="#ffffff" />
              </View>
            )}
            {course.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          <View style={styles.courseDetails}>
            <Text style={[styles.courseTitle, accessibilityStyles]}>{course.title}</Text>
            <Text style={[styles.courseInstructor, accessibilityStyles]}>
              By {course.instructor}
            </Text>
            
            <View style={styles.courseMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={[styles.metaText, accessibilityStyles]}>
                  {course.duration} hours
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="#64748b" />
                <Text style={[styles.metaText, accessibilityStyles]}>
                  {course.students} students
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={16} color="#64748b" />
                <Text style={[styles.metaText, accessibilityStyles]}>
                  {course.rating} ({course.reviews} reviews)
                </Text>
              </View>
            </View>

            <Text style={[styles.courseDescription, accessibilityStyles]} numberOfLines={3}>
              {course.description}
            </Text>

            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, accessibilityStyles]}>Lessons</Text>
                <Text style={[styles.statValue, accessibilityStyles]}>{course.totalLessons}</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, accessibilityStyles]}>Quizzes</Text>
                <Text style={[styles.statValue, accessibilityStyles]}>{course.totalQuizzes}</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, accessibilityStyles]}>Difficulty</Text>
                <Text style={[styles.statValue, accessibilityStyles]}>{course.difficulty}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Enrollment Status */}
      <View style={[styles.enrollmentContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Enrollment Status</Text>
        
        <View style={styles.enrollmentStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: enrollmentStatus === 'enrolled' ? '#10b981' : '#f59e0b' }
          ]}>
            <Ionicons 
              name={enrollmentStatus === 'enrolled' ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color="#ffffff" 
            />
          </View>
          
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusTextTitle, accessibilityStyles]}>
              {enrollmentStatus === 'enrolled' ? 'Enrolled' : 'Not Enrolled'}
            </Text>
            <Text style={[styles.statusTextDesc, accessibilityStyles]}>
              {enrollmentStatus === 'enrolled' 
                ? 'You are currently enrolled in this course'
                : 'Enroll to start learning'
              }
            </Text>
          </View>
          
          {enrollmentStatus !== 'enrolled' && (
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={handleEnrollment}
              accessibilityLabel="Enroll Now"
              accessibilityRole="button"
            >
              <Text style={styles.enrollButtonText}>
                {course?.fee > 0 ? `Enroll - ${course?.fee.toLocaleString()}` : 'Enroll Free'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lessons List */}
      <View style={[styles.lessonsContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Course Lessons</Text>
        
        {lessons.length > 0 ? (
          <FlatList
            data={lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyLessons}>
            <Ionicons name="book-outline" size={64} color="#94a3b8" />
            <Text style={[styles.emptyTitle, accessibilityStyles]}>No Lessons</Text>
            <Text style={[styles.emptySubtitle, accessibilityStyles]}>
              Lessons will be available after enrollment
            </Text>
          </View>
        )}
      </View>

      {/* Lesson Modal */}
      <Modal
        visible={isLessonModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLessonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, accessibilityStyles]}>
                {selectedLesson?.title}
              </Text>
              <TouchableOpacity onPress={() => setIsLessonModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.lessonModalDetails}>
              <Text style={[styles.modalLabel, accessibilityStyles]}>Duration</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedLesson?.duration} minutes
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Type</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedLesson?.type}
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Description</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedLesson?.description}
              </Text>
            </View>

            <View style={styles.lessonActions}>
              <TouchableOpacity
                style={styles.startLessonButton}
                onPress={() => {
                  setIsLessonModalVisible(false);
                  navigation.navigate('Lesson', { 
                    lessonId: selectedLesson.id, 
                    courseId: courseId 
                  });
                }}
                accessibilityLabel="Start Lesson"
                accessibilityRole="button"
              >
                <Text style={styles.startLessonButtonText}>Start Lesson</Text>
              </TouchableOpacity>
              
              {selectedLesson?.quizAvailable && (
                <TouchableOpacity
                  style={styles.quizButton}
                  onPress={() => {
                    setIsLessonModalVisible(false);
                    navigation.navigate('Quiz', { 
                      quizId: selectedLesson.quizId, 
                      courseId: courseId 
                    });
                  }}
                  accessibilityLabel="Take Quiz"
                  accessibilityRole="button"
                >
                  <Text style={styles.quizButtonText}>Take Quiz</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedLesson?.prerequisites && selectedLesson.prerequisites.length > 0 && (
              <View style={styles.prerequisitesContainer}>
                <Text style={[styles.prerequisitesTitle, accessibilityStyles]}>
                  Prerequisites
                </Text>
                {lessons.filter(l => selectedLesson.prerequisites.includes(l.id)).map(lesson => (
                  <View key={lesson.id} style={styles.prerequisiteItem}>
                    <Ionicons name="checkmark-circle" size={16} color={lesson.status === 'completed' ? '#10b981' : '#64748b'} />
                    <Text style={[styles.prerequisiteText, accessibilityStyles]}>
                      {lesson.title} - {lesson.status === 'completed' ? 'Completed' : 'Pending'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  shareButton: {
    padding: 8,
  },
  courseInfoContainer: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  courseImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  courseDetails: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  enrollmentContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  enrollmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  statusTextDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  enrollButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonsContainer: {
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
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedLesson: {
    opacity: 0.6,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lessonDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  completedText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLessons: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  lessonModalDetails: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    fontWeight: '600',
  },
  lessonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  startLessonButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  startLessonButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  quizButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  prerequisitesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  prerequisitesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prerequisiteText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 8,
  },
});

export default CourseDetailScreen;
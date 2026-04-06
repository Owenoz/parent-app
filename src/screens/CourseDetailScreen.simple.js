import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CourseDetailScreen = ({ navigation, route }) => {
  const courseId = route?.params?.courseId || 1;
  const [isEnrolled, setIsEnrolled] = useState(false);

  const course = {
    id: courseId,
    title: 'Introduction to Physics',
    instructor: 'Dr. Smith',
    duration: 40,
    students: 1250,
    rating: 4.8,
    reviews: 320,
    difficulty: 'Beginner',
    description: 'Learn the fundamentals of physics including mechanics, thermodynamics, and electromagnetism. This comprehensive course covers all essential topics.',
    totalLessons: 24,
    totalQuizzes: 8,
    fee: 0,
  };

  const lessons = [
    { id: 1, title: 'Introduction to Motion', duration: 45, type: 'Video', status: 'completed' },
    { id: 2, title: 'Forces and Newton\'s Laws', duration: 50, type: 'Video', status: 'in_progress' },
    { id: 3, title: 'Energy and Work', duration: 40, type: 'Video', status: 'pending' },
    { id: 4, title: 'Thermodynamics Basics', duration: 55, type: 'Video', status: 'locked' },
  ];

  const handleEnroll = () => {
    setIsEnrolled(true);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Course Info Card */}
      <View style={styles.courseCard}>
        <View style={styles.courseImagePlaceholder}>
          <Ionicons name="book" size={48} color="#2563eb" />
        </View>
        
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseInstructor}>By {course.instructor}</Text>
        
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={styles.metaText}>{course.duration}h</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color="#64748b" />
            <Text style={styles.metaText}>{course.students}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.metaText}>{course.rating} ({course.reviews})</Text>
          </View>
        </View>

        <Text style={styles.courseDescription}>{course.description}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{course.totalLessons}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{course.totalQuizzes}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{course.difficulty}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>
      </View>

      {/* Enrollment Status */}
      <View style={styles.enrollmentCard}>
        <View style={styles.enrollmentStatus}>
          <View style={[
            styles.statusIcon,
            { backgroundColor: isEnrolled ? '#10b981' : '#f59e0b' }
          ]}>
            <Ionicons 
              name={isEnrolled ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color="#ffffff" 
            />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
            </Text>
            <Text style={styles.statusDesc}>
              {isEnrolled ? 'You can access all lessons' : 'Enroll to start learning'}
            </Text>
          </View>
        </View>
        
        {!isEnrolled && (
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
            <Text style={styles.enrollButtonText}>
              {course.fee > 0 ? `Enroll - KSH ${course.fee}` : 'Enroll Free'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lessons */}
      <View style={styles.lessonsCard}>
        <Text style={styles.sectionTitle}>Course Lessons</Text>
        
        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonItem,
              lesson.status === 'locked' && styles.lessonLocked
            ]}
            onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id, courseId })}
            disabled={lesson.status === 'locked'}
          >
            <View style={styles.lessonNumber}>
              <Text style={styles.lessonNumberText}>{index + 1}</Text>
            </View>
            
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <View style={styles.lessonMeta}>
                <Ionicons name="play-circle-outline" size={14} color="#64748b" />
                <Text style={styles.lessonMetaText}>{lesson.duration} min</Text>
                <Text style={styles.lessonMetaText}> • {lesson.type}</Text>
              </View>
            </View>
            
            <View style={[
              styles.statusBadge,
              { backgroundColor: 
                lesson.status === 'completed' ? '#10b981' :
                lesson.status === 'in_progress' ? '#f59e0b' :
                lesson.status === 'locked' ? '#94a3b8' : '#e2e8f0'
              }
            ]}>
              <Ionicons 
                name={
                  lesson.status === 'completed' ? 'checkmark' :
                  lesson.status === 'in_progress' ? 'play' :
                  lesson.status === 'locked' ? 'lock-closed' : 'ellipse-outline'
                }
                size={16} 
                color="#ffffff" 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#2563eb',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseCard: {
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  courseImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  courseMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  enrollmentCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  enrollmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  enrollButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  lessonsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lessonLocked: {
    opacity: 0.5,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CourseDetailScreen;

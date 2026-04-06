import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import coursesService from '../services/courses.service';

const { width } = Dimensions.get('window');

const CoursesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const categories = [
    { id: 'all', name: 'All', icon: 'apps', gradient: ['#667eea', '#764ba2'] },
    { id: 'science', name: 'Science', icon: 'flask', gradient: ['#f093fb', '#f5576c'] },
    { id: 'math', name: 'Math', icon: 'calculator', gradient: ['#4facfe', '#00f2fe'] },
    { id: 'language', name: 'Language', icon: 'book', gradient: ['#43e97b', '#38f9d7'] },
    { id: 'arts', name: 'Arts', icon: 'palette', gradient: ['#fa709a', '#fee140'] },
    { id: 'tech', name: 'Tech', icon: 'laptop', gradient: ['#30cfd0', '#330867'] },
  ];

  useEffect(() => {
    loadCourses();
  }, [selectedCategory]);

  const loadCourses = async () => {
    try {
      const [coursesResult, enrolledResult] = await Promise.allSettled([
        coursesService.getPublicCourses({ 
          page: 1, 
          pageSize: 100,
          category: selectedCategory === 'all' ? undefined : selectedCategory 
        }),
        coursesService.getMyEnrollments(),
      ]);

      const allCourses = coursesResult.status === 'fulfilled' && coursesResult.value.success 
        ? coursesResult.value.data 
        : [];
      const enrolled = enrolledResult.status === 'fulfilled' && enrolledResult.value.success 
        ? enrolledResult.value.data 
        : [];

      setCourses(allCourses);
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(e => e.course_id === courseId);
  };

  const handleEnroll = async (courseId, courseFee) => {
    if (courseFee > 0) {
      navigation.navigate('Payment', { 
        courseId, 
        amount: courseFee,
      });
    } else {
      try {
        const result = await coursesService.enrollInCourse(courseId);
        if (result.success) {
          Alert.alert('Success', 'Enrolled successfully!');
          loadCourses();
        } else {
          Alert.alert('Error', result.error || 'Failed to enroll');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enroll in course');
      }
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CategoryChip = ({ category }) => {
    const isSelected = selectedCategory === category.id;
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.7}
      >
        {isSelected ? (
          <LinearGradient colors={category.gradient} style={styles.categoryChipGradient}>
            <Ionicons name={category.icon} size={18} color="#ffffff" />
            <Text style={styles.categoryTextActive}>{category.name}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.categoryChipContent}>
            <Ionicons name={category.icon} size={18} color="#64748b" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const CourseCard = ({ course }) => {
    const enrolled = isEnrolled(course.id);
    const enrollment = enrolledCourses.find(e => e.course_id === course.id);
    const progress = enrollment?.progress || 0;

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.courseImage}
        >
          <Ionicons name="book" size={40} color="#ffffff" />
          {enrolled && (
            <View style={styles.enrolledBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
              <Text style={styles.enrolledText}>Enrolled</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.courseContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
          <Text style={styles.courseInstructor} numberOfLines={1}>
            <Ionicons name="person-outline" size={12} color="#64748b" /> {course.instructor || 'Instructor'}
          </Text>

          <View style={styles.courseMetaRow}>
            <View style={styles.courseMeta}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.courseMetaText}>{course.duration || '10'} hrs</Text>
            </View>
            <View style={styles.courseMeta}>
              <Ionicons name="people-outline" size={14} color="#64748b" />
              <Text style={styles.courseMetaText}>{course.students || '0'}</Text>
            </View>
            <View style={styles.courseMeta}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.courseMetaText}>{course.rating || '4.5'}</Text>
            </View>
          </View>

          {enrolled ? (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{progress}% Complete</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={() => handleEnroll(course.id, course.fee)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.enrollButtonGradient}>
                <Text style={styles.enrollButtonText}>
                  {course.fee > 0 ? `Enroll - $${course.fee}` : 'Enroll Free'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <CategoryChip key={category.id} category={category} />
        ))}
      </ScrollView>

      {/* Courses List */}
      <ScrollView
        style={styles.coursesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        <View style={styles.coursesGrid}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={48} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Courses Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search term' : 'No courses available in this category'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryChipActive: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  coursesContainer: {
    flex: 1,
  },
  coursesGrid: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  courseImage: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  enrolledBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  enrolledText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  courseInstructor: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  courseMetaRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  courseMetaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  enrollButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  enrollButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  enrollButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
});

export default CoursesScreen;

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import coursesService from '../services/courses.service';
import progressService from '../services/progress.service';

const CoursesScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categories] = useState([
    { id: 'all', name: 'All Courses', icon: 'apps' },
    { id: 'science', name: 'Science', icon: 'flask' },
    { id: 'math', name: 'Mathematics', icon: 'calculator' },
    { id: 'language', name: 'Languages', icon: 'book' },
    { id: 'arts', name: 'Arts', icon: 'palette' },
    { id: 'technology', name: 'Technology', icon: 'laptop' },
  ]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
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
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCourseEnrollment = async (courseId, courseFee) => {
    if (courseFee > 0) {
      // Navigate to payment screen for paid courses
      navigation.navigate('Payment', { 
        courseId, 
        amount: courseFee,
        courseTitle: courses.find(c => c.id === courseId)?.title
      });
    } else {
      // Free course enrollment
      try {
        const result = await coursesService.enrollInCourse(courseId);
        if (result.success) {
          Alert.alert('Success', 'Course enrolled successfully!');
          loadCourses(); // Refresh the course list
        } else {
          Alert.alert('Error', result.error || 'Failed to enroll in course');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enroll in course. Please try again.');
      }
    }
  };

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCourseProgress = (courseId) => {
    const enrolledCourse = enrolledCourses.find(c => c.id === courseId);
    return enrolledCourse ? enrolledCourse.progress : 0;
  };

  const getCourseDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderCourseCard = ({ item: course }) => {
    const progress = getCourseProgress(course.id);
    const isEnrolled = progress > 0;
    const accessibilityStyles = getAccessibilityStyles();

    return (
      <TouchableOpacity
        style={[
          styles.courseCard,
          { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' },
          isEnrolled && styles.enrolledCard
        ]}
        onPress={() => handleCoursePress(course)}
        accessibilityLabel={`Open ${course.title}`}
        accessibilityRole="button"
      >
        <View style={styles.courseImageContainer}>
          {course.image ? (
            <Image
              source={{ uri: course.image }}
              style={styles.courseImage}
            />
          ) : (
            <View style={[styles.courseImage, { backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="book-outline" size={32} color="#9ca3af" />
            </View>
          )}
          {course.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {course.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#ffffff" />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
          )}
        </View>

        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text style={[styles.courseTitle, accessibilityStyles]} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={[styles.courseInstructor, accessibilityStyles]}>
              {course.instructor}
            </Text>
          </View>

          <View style={styles.courseMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={[styles.metaText, accessibilityStyles]}>
                {course.duration} hours
              </Text>
              <View style={styles.dot} />
              <Ionicons name="people-outline" size={14} color="#64748b" />
              <Text style={[styles.metaText, accessibilityStyles]}>
                {course.students} students
              </Text>
            </View>
            
            <View style={styles.difficultyContainer}>
              <View style={[
                styles.difficultyDot,
                { backgroundColor: getCourseDifficultyColor(course.difficulty) }
              ]} />
              <Text style={[styles.difficultyText, accessibilityStyles]}>
                {course.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={[styles.courseDescription, accessibilityStyles]} numberOfLines={3}>
            {course.description}
          </Text>

          {isEnrolled && (
            <View style={styles.progressContainer}>
              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, accessibilityStyles]}>
                  Progress
                </Text>
                <Text style={[styles.progressValue, accessibilityStyles]}>
                  {progress}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: progress >= 70 ? '#10b981' : progress >= 30 ? '#f59e0b' : '#ef4444',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.courseFooter}>
            <View style={styles.priceContainer}>
              {course.originalPrice > 0 && (
                <Text style={[styles.originalPrice, accessibilityStyles]}>
                  {course.originalPrice.toLocaleString()}
                </Text>
              )}
              <Text style={[styles.currentPrice, accessibilityStyles]}>
                {course.fee === 0 ? 'FREE' : course.fee.toLocaleString()}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.enrollButton,
                { backgroundColor: isEnrolled ? '#94a3b8' : '#2563eb' }
              ]}
              onPress={() => handleCourseEnrollment(course.id, course.fee)}
              disabled={isEnrolled}
              accessibilityLabel={isEnrolled ? "Already Enrolled" : "Enroll Now"}
              accessibilityRole="button"
            >
              <Text style={styles.enrollButtonText}>
                {isEnrolled ? 'Enrolled' : 'Enroll Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={[styles.searchInput, accessibilityStyles]}
            placeholder="Search courses, instructors, or topics"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search courses"
            accessibilityRole="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Browse by Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category.id 
                    ? (settings.isHighContrast ? '#ffffff' : '#2563eb')
                    : (settings.isHighContrast ? '#333333' : '#f1f5f9'),
                  borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0',
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
              accessibilityLabel={`Filter by ${category.name}`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === category.id }}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.id ? '#ffffff' : (settings.isHighContrast ? '#ffffff' : '#64748b')} 
              />
              <Text style={[
                styles.categoryText, 
                accessibilityStyles,
                { color: selectedCategory === category.id ? '#ffffff' : (settings.isHighContrast ? '#ffffff' : '#64748b') }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <View style={[styles.sectionContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, accessibilityStyles]}>My Courses</Text>
          <FlatList
            data={enrolledCourses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* All Courses */}
      <View style={[styles.sectionContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, accessibilityStyles]}>
            All Courses {filteredCourses.length > 0 && `(${filteredCourses.length})`}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearFilterText, accessibilityStyles]}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {filteredCourses.length > 0 ? (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.courseGrid}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color="#94a3b8" />
            <Text style={[styles.emptyTitle, accessibilityStyles]}>
              {searchQuery.length > 0 ? 'No courses found' : 'No courses available'}
            </Text>
            <Text style={[styles.emptySubtitle, accessibilityStyles]}>
              {searchQuery.length > 0 
                ? 'Try adjusting your search terms or filter criteria'
                : 'Check back later for new course additions'
              }
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

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
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  categoriesContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionContainer: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  courseGrid: {
    justifyContent: 'space-between',
  },
  horizontalList: {
    paddingHorizontal: 4,
  },
  courseCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrolledCard: {
    borderColor: '#2563eb',
    borderWidth: 1,
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  courseContent: {
    padding: 12,
  },
  courseHeader: {
    marginBottom: 8,
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
  },
  courseMeta: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    marginRight: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  courseDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
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
  emptyState: {
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
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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

export default CoursesScreen;
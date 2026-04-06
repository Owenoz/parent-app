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
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import assessmentsService from '../services/assessments.service';

const AssessmentsScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedTab, setSelectedTab] = useState('assignments');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] = useState(false);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      
      // Note: We need a courseId to fetch assessments
      // For now, we'll fetch from all enrolled courses
      // In a real app, you'd get this from navigation params or context
      
      const assignmentsData = [];
      const quizzesData = [];

      setAssignments(assignmentsData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading assessments:', error);
      Alert.alert('Error', 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssessments();
    setRefreshing(false);
  };

  const handleAssignmentSubmission = async () => {
    if (!submissionText.trim()) {
      Alert.alert('Error', 'Please enter your assignment submission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await assessmentsService.submitAssessment(selectedAssignment.id, {
        submission_type: 'text',
        text_content: submissionText,
      });

      if (result.success) {
        Alert.alert('Success', 'Assignment submitted successfully!');
        setIsAssignmentModalVisible(false);
        setSubmissionText('');
        loadAssessments(); // Refresh the list
      } else {
        Alert.alert('Error', result.error || 'Failed to submit assignment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizStart = (quiz) => {
    if (quiz.isLocked) {
      Alert.alert('Locked', 'You need to complete the prerequisite lessons first.');
      return;
    }
    navigation.navigate('Quiz', { quizId: quiz.id });
  };

  const handleAssignmentPress = (assignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentModalVisible(true);
  };

  const handleQuizPress = (quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalVisible(true);
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'overdue': return '#ef4444';
      case 'in_progress': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getAssignmentStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const getQuizStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'available': return '#3b82f6';
      case 'locked': return '#64748b';
      default: return '#64748b';
    }
  };

  const renderAssignmentItem = ({ item: assignment }) => {
    const accessibilityStyles = getAccessibilityStyles();
    const statusColor = getAssignmentStatusColor(assignment.status);
    const statusText = getAssignmentStatusText(assignment.status);

    return (
      <TouchableOpacity
        style={[
          styles.assignmentCard,
          { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }
        ]}
        onPress={() => handleAssignmentPress(assignment)}
        accessibilityLabel={`Open ${assignment.title}`}
        accessibilityRole="button"
      >
        <View style={styles.assignmentHeader}>
          <Text style={[styles.assignmentTitle, accessibilityStyles]} numberOfLines={2}>
            {assignment.title}
          </Text>
          <View style={styles.assignmentMeta}>
            <Text style={[styles.assignmentCourse, accessibilityStyles]}>
              {assignment.courseTitle}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.assignmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={[styles.detailText, accessibilityStyles]}>
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={[styles.detailText, accessibilityStyles]}>
              Points: {assignment.maxPoints}
            </Text>
          </View>
          
          {assignment.status === 'completed' && assignment.grade && (
            <View style={styles.detailRow}>
              <Ionicons name="star-outline" size={14} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                Grade: {assignment.grade}/{assignment.maxPoints}
              </Text>
            </View>
          )}
        </View>

        {assignment.status === 'completed' && (
          <View style={styles.completedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={[styles.completedText, accessibilityStyles]}>Submitted</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderQuizItem = ({ item: quiz }) => {
    const accessibilityStyles = getAccessibilityStyles();
    const statusColor = getQuizStatusColor(quiz.status);

    return (
      <TouchableOpacity
        style={[
          styles.quizCard,
          { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' },
          quiz.status === 'locked' && styles.lockedCard
        ]}
        onPress={() => handleQuizPress(quiz)}
        disabled={quiz.status === 'locked'}
        accessibilityLabel={`Open ${quiz.title}`}
        accessibilityRole="button"
      >
        <View style={styles.quizHeader}>
          <Text style={[styles.quizTitle, accessibilityStyles]} numberOfLines={2}>
            {quiz.title}
          </Text>
          <View style={styles.quizMeta}>
            <Text style={[styles.quizCourse, accessibilityStyles]}>
              {quiz.courseTitle}
            </Text>
            <View style={[styles.quizStatusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.quizStatusText}>
                {quiz.status === 'completed' ? 'Completed' : quiz.status === 'available' ? 'Available' : 'Locked'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quizDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="timer-outline" size={14} color="#64748b" />
            <Text style={[styles.detailText, accessibilityStyles]}>
              Time Limit: {quiz.timeLimit} minutes
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="list-outline" size={14} color="#64748b" />
            <Text style={[styles.detailText, accessibilityStyles]}>
              Questions: {quiz.questionCount}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="star-outline" size={14} color="#64748b" />
            <Text style={[styles.detailText, accessibilityStyles]}>
              Points: {quiz.maxPoints}
            </Text>
          </View>
        </View>

        {quiz.status === 'completed' && quiz.score && (
          <View style={styles.quizScore}>
            <Text style={[styles.quizScoreLabel, accessibilityStyles]}>Your Score:</Text>
            <Text style={[styles.quizScoreValue, accessibilityStyles]}>
              {quiz.score}/{quiz.maxPoints}
            </Text>
          </View>
        )}

        {quiz.status === 'locked' && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed-outline" size={24} color="#64748b" />
            <Text style={[styles.lockText, accessibilityStyles]}>Complete prerequisites first</Text>
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
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, accessibilityStyles]}>Assessments</Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              Assignments and quizzes
            </Text>
          </View>
          <Ionicons name="clipboard-outline" size={48} color="#ffffff" />
        </View>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'assignments' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('assignments')}
          accessibilityLabel="Assignments"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedTab === 'assignments' }}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'assignments' && styles.activeTabText
          ]}>
            Assignments
          </Text>
          {assignments.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{assignments.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'quizzes' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('quizzes')}
          accessibilityLabel="Quizzes"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedTab === 'quizzes' }}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'quizzes' && styles.activeTabText
          ]}>
            Quizzes
          </Text>
          {quizzes.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{quizzes.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {selectedTab === 'assignments' ? (
          assignments.length > 0 ? (
            <FlatList
              data={assignments}
              renderItem={renderAssignmentItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
              <Text style={[styles.emptyTitle, accessibilityStyles]}>No Assignments</Text>
              <Text style={[styles.emptySubtitle, accessibilityStyles]}>
                Check back later for new assignments
              </Text>
            </View>
          )
        ) : (
          quizzes.length > 0 ? (
            <FlatList
              data={quizzes}
              renderItem={renderQuizItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={64} color="#94a3b8" />
              <Text style={[styles.emptyTitle, accessibilityStyles]}>No Quizzes</Text>
              <Text style={[styles.emptySubtitle, accessibilityStyles]}>
                Complete lessons to unlock quizzes
              </Text>
            </View>
          )
        )}
      </View>

      {/* Assignment Modal */}
      <Modal
        visible={isAssignmentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAssignmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, accessibilityStyles]}>
                {selectedAssignment?.title}
              </Text>
              <TouchableOpacity onPress={() => setIsAssignmentModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDetails}>
              <Text style={[styles.modalLabel, accessibilityStyles]}>Course</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedAssignment?.courseTitle}
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Due Date</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedAssignment && new Date(selectedAssignment.dueDate).toLocaleDateString()}
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Points</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedAssignment?.maxPoints}
              </Text>
            </View>

            {selectedAssignment?.status === 'completed' ? (
              <View style={styles.submittedContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={[styles.submittedText, accessibilityStyles]}>
                  Submitted on {new Date(selectedAssignment.submittedAt).toLocaleDateString()}
                </Text>
                {selectedAssignment.grade && (
                  <Text style={[styles.gradeText, accessibilityStyles]}>
                    Grade: {selectedAssignment.grade}/{selectedAssignment.maxPoints}
                  </Text>
                )}
              </View>
            ) : (
              <>
                <Text style={[styles.modalLabel, accessibilityStyles]}>Submission</Text>
                <View style={[
                  styles.textInputContainer,
                  { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                ]}>
                  <TextInput
                    style={[
                      styles.textInput,
                      accessibilityStyles,
                      { color: settings.isHighContrast ? '#ffffff' : '#1f2937' }
                    ]}
                    placeholder="Enter your assignment submission..."
                    placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
                    value={submissionText}
                    onChangeText={setSubmissionText}
                    multiline
                    numberOfLines={6}
                    accessibilityLabel="Assignment submission"
                    accessibilityRole="text"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: selectedAssignment?.status === 'overdue' ? '#ef4444' : '#2563eb' }
                  ]}
                  onPress={handleAssignmentSubmission}
                  disabled={isSubmitting}
                  accessibilityLabel="Submit Assignment"
                  accessibilityRole="button"
                >
                  {isSubmitting ? (
                    <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {selectedAssignment?.status === 'overdue' ? 'Submit (Overdue)' : 'Submit Assignment'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        visible={isQuizModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQuizModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, accessibilityStyles]}>
                {selectedQuiz?.title}
              </Text>
              <TouchableOpacity onPress={() => setIsQuizModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDetails}>
              <Text style={[styles.modalLabel, accessibilityStyles]}>Course</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedQuiz?.courseTitle}
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Time Limit</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedQuiz?.timeLimit} minutes
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Questions</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedQuiz?.questionCount}
              </Text>
              
              <Text style={[styles.modalLabel, accessibilityStyles]}>Points</Text>
              <Text style={[styles.modalValue, accessibilityStyles]}>
                {selectedQuiz?.maxPoints}
              </Text>
            </View>

            {selectedQuiz?.status === 'completed' ? (
              <View style={styles.quizResultContainer}>
                <Text style={[styles.quizResultLabel, accessibilityStyles]}>Final Score</Text>
                <Text style={[styles.quizResultScore, accessibilityStyles]}>
                  {selectedQuiz.score}/{selectedQuiz.maxPoints}
                </Text>
                <Text style={[styles.quizResultPercentage, accessibilityStyles]}>
                  {((selectedQuiz.score / selectedQuiz.maxPoints) * 100).toFixed(1)}%
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.startQuizButton,
                  { backgroundColor: selectedQuiz?.status === 'available' ? '#10b981' : '#64748b' }
                ]}
                onPress={() => handleQuizStart(selectedQuiz)}
                disabled={selectedQuiz?.status !== 'available'}
                accessibilityLabel="Start Quiz"
                accessibilityRole="button"
              >
                <Text style={styles.startQuizButtonText}>
                  {selectedQuiz?.status === 'available' ? 'Start Quiz' : 'Complete Prerequisites First'}
                </Text>
              </TouchableOpacity>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  contentContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentCourse: {
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
  assignmentDetails: {
    marginBottom: 12,
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
  quizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.6,
  },
  quizHeader: {
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizCourse: {
    fontSize: 12,
    color: '#64748b',
  },
  quizStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizStatusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quizDetails: {
    marginBottom: 12,
  },
  quizScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
  },
  quizScoreLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  quizScoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
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
  modalDetails: {
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
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  textInput: {
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  submittedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  submittedText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
  },
  gradeText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '700',
    marginLeft: 8,
  },
  quizResultContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  quizResultLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  quizResultScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  quizResultPercentage: {
    fontSize: 14,
    color: '#64748b',
  },
  startQuizButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startQuizButtonText: {
    color: '#ffffff',
    fontSize: 16,
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

export default AssessmentsScreen;
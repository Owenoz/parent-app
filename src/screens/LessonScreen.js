import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import contentService from '../services/content.service';
import { aiAPI } from '../services/api';

const LessonScreen = ({ navigation, route }) => {
  const { lessonId, courseId } = route.params;
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);

  useEffect(() => {
    loadLessonData();
  }, []);

  const loadLessonData = async () => {
    try {
      setIsLoading(true);
      const result = await contentService.getLessonContent(lessonId);
      
      if (result.success) {
        setLesson(result.data);
        setProgress(result.data.progress || 0);
      } else {
        Alert.alert('Error', result.error || 'Failed to load lesson');
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIHelp = async () => {
    if (!aiQuestion.trim()) {
      Alert.alert('Input Required', 'Please enter your question.');
      return;
    }

    setIsAIThinking(true);
    setAiResponse('');

    try {
      const response = await aiAPI.getTutorResponse(aiQuestion, selectedChildId);
      
      if (response.data.success) {
        setAiResponse(response.data.result || response.data.message);
      } else {
        setAiResponse('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('AI call error:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleLessonComplete = async () => {
    try {
      const result = await contentService.markContentComplete(lessonId);
      if (result.success) {
        Alert.alert('Success', 'Lesson completed!');
        setIsCompleteModalVisible(false);
        setProgress(100);
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'Failed to complete lesson');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete lesson. Please try again.');
    }
  };

  const handleProgressUpdate = async (newProgress) => {
    try {
      setProgress(newProgress);
      await contentService.trackContentProgress(lessonId, newProgress);
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  const handleDownloadContent = () => {
    Alert.alert('Download', 'Content downloaded for offline access.');
  };

  const handleShareContent = () => {
    Alert.alert('Share', 'Content shared successfully.');
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'play-circle-outline';
      case 'audio': return 'volume-high-outline';
      case 'document': return 'document-text-outline';
      case 'interactive': return 'game-controller-outline';
      default: return 'book-outline';
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'video': return '#3b82f6';
      case 'audio': return '#10b981';
      case 'document': return '#f59e0b';
      case 'interactive': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const accessibilityStyles = getAccessibilityStyles();

  return (
    <View style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}>
      {/* Header */}
      <LinearGradient
        colors={settings.isHighContrast ? ['#ffffff', '#ffffff'] : ['#2563eb', '#1e40af']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, accessibilityStyles]} numberOfLines={1}>
              {lesson?.title || 'Lesson'}
            </Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              {lesson?.duration} minutes • {lesson?.type}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lesson Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Lesson Header */}
        <View style={[styles.lessonHeader, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, accessibilityStyles]}>{lesson?.title}</Text>
            <Text style={[styles.lessonDescription, accessibilityStyles]} numberOfLines={3}>
              {lesson?.description}
            </Text>
          </View>
          
          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <Ionicons name={getContentTypeIcon(lesson?.type)} size={16} color={getContentTypeColor(lesson?.type)} />
              <Text style={[styles.metaText, accessibilityStyles]}>{lesson?.type}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={[styles.metaText, accessibilityStyles]}>{lesson?.duration} min</Text>
            </View>
            
            {lesson?.difficulty && (
              <View style={styles.metaItem}>
                <Ionicons name="bar-chart-outline" size={16} color="#64748b" />
                <Text style={[styles.metaText, accessibilityStyles]}>{lesson.difficulty}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Type Display */}
        {lesson?.type === 'video' && lesson?.contentUrl && (
          <View style={[styles.contentContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.contentTitle, accessibilityStyles]}>Video Content</Text>
            <View style={styles.videoContainer}>
              <View style={styles.videoPlaceholder}>
                <Ionicons name="videocam-outline" size={48} color="#64748b" />
                <Text style={[styles.videoPlaceholderText, accessibilityStyles]}>
                  Video player will be available here
                </Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={48} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {lesson?.type === 'audio' && lesson?.contentUrl && (
          <View style={[styles.contentContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.contentTitle, accessibilityStyles]}>Audio Content</Text>
            <View style={styles.audioContainer}>
              <View style={styles.audioPlayer}>
                <Ionicons name="musical-notes-outline" size={24} color="#64748b" />
                <Text style={[styles.audioTitle, accessibilityStyles]}>{lesson.title}</Text>
                <TouchableOpacity style={styles.playButtonSmall}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.timeInfo}>
                <Text style={[styles.timeText, accessibilityStyles]}>0:00</Text>
                <Text style={[styles.timeText, accessibilityStyles]}>-{lesson.duration}:00</Text>
              </View>
            </View>
          </View>
        )}

        {lesson?.type === 'document' && (
          <View style={[styles.contentContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.contentTitle, accessibilityStyles]}>Reading Material</Text>
            <View style={styles.documentContainer}>
              <Text style={[styles.documentContent, accessibilityStyles]}>
                {lesson.content || 'Document content will be displayed here.'}
              </Text>
            </View>
          </View>
        )}

        {lesson?.type === 'interactive' && (
          <View style={[styles.contentContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.contentTitle, accessibilityStyles]}>Interactive Content</Text>
            <View style={styles.interactiveContainer}>
              <Text style={[styles.interactiveText, accessibilityStyles]}>
                Interactive elements and exercises will be displayed here.
              </Text>
              <TouchableOpacity style={styles.interactiveButton}>
                <Text style={styles.interactiveButtonText}>Start Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lesson Actions */}
        <View style={[styles.actionsContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.actionsTitle, accessibilityStyles]}>Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownloadContent}
              accessibilityLabel="Download Content"
              accessibilityRole="button"
            >
              <Ionicons name="download-outline" size={20} color="#2563eb" />
              <Text style={[styles.actionButtonText, accessibilityStyles]}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareContent}
              accessibilityLabel="Share Content"
              accessibilityRole="button"
            >
              <Ionicons name="share-social-outline" size={20} color="#2563eb" />
              <Text style={[styles.actionButtonText, accessibilityStyles]}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAIHelp(!showAIHelp)}
              accessibilityLabel="AI Help"
              accessibilityRole="button"
            >
              <Ionicons name="sparkles-outline" size={20} color="#2563eb" />
              <Text style={[styles.actionButtonText, accessibilityStyles]}>AI Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Help Section */}
        {showAIHelp && (
          <View style={[styles.aiContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.aiTitle, accessibilityStyles]}>AI Tutor</Text>
            
            <View style={styles.aiInputContainer}>
              <TextInput
                style={[
                  styles.aiInput,
                  accessibilityStyles,
                  { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                ]}
                placeholder="Ask a question about this lesson..."
                placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
                value={aiQuestion}
                onChangeText={setAiQuestion}
                multiline
                numberOfLines={3}
                accessibilityLabel="AI question input"
                accessibilityRole="text"
              />
              
              <TouchableOpacity
                style={[
                  styles.aiButton,
                  { backgroundColor: aiQuestion.trim() ? '#2563eb' : '#94a3b8' }
                ]}
                onPress={handleAIHelp}
                disabled={!aiQuestion.trim() || isAIThinking}
                accessibilityLabel="Ask AI"
                accessibilityRole="button"
              >
                {isAIThinking ? (
                  <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
                ) : (
                  <Ionicons name="send-outline" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>

            {aiResponse && (
              <View style={styles.aiResponseContainer}>
                <View style={styles.aiResponseHeader}>
                  <Ionicons name="sparkles-outline" size={16} color="#2563eb" />
                  <Text style={[styles.aiResponseTitle, accessibilityStyles]}>AI Response</Text>
                </View>
                <Text style={[styles.aiResponseText, accessibilityStyles]}>{aiResponse}</Text>
              </View>
            )}
          </View>
        )}

        {/* Prerequisites and Next Steps */}
        {(lesson?.prerequisites || lesson?.nextLesson) && (
          <View style={[styles.nextStepsContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.nextStepsTitle, accessibilityStyles]}>Next Steps</Text>
            
            {lesson.prerequisites && (
              <View style={styles.prerequisites}>
                <Text style={[styles.prerequisitesTitle, accessibilityStyles]}>Prerequisites</Text>
                {lesson.prerequisites.map((prereq, index) => (
                  <View key={index} style={styles.prerequisiteItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={[styles.prerequisiteText, accessibilityStyles]}>{prereq}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {lesson.nextLesson && (
              <TouchableOpacity
                style={styles.nextLessonButton}
                onPress={() => navigation.navigate('Lesson', { 
                  lessonId: lesson.nextLesson.id, 
                  courseId: courseId 
                })}
                accessibilityLabel={`Next Lesson: ${lesson.nextLesson.title}`}
                accessibilityRole="button"
              >
                <Text style={styles.nextLessonText}>Next Lesson: {lesson.nextLesson.title}</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, accessibilityStyles]}>{Math.round(progress)}% Complete</Text>
      </View>

      {/* Complete Lesson Button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => setIsCompleteModalVisible(true)}
        accessibilityLabel="Complete Lesson"
        accessibilityRole="button"
      >
        <Text style={styles.completeButtonText}>Complete Lesson</Text>
      </TouchableOpacity>

      {/* Complete Modal */}
      <Modal
        visible={isCompleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCompleteModalVisible(false)}
      >
        <View style={styles.completeModalOverlay}>
          <View style={[
            styles.completeModalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={[styles.completeModalTitle, accessibilityStyles]}>Lesson Complete!</Text>
            <Text style={[styles.completeModalSubtitle, accessibilityStyles]}>
              Great job completing this lesson. Ready to mark it as complete?
            </Text>
            
            <View style={styles.completeModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCompleteModalVisible(false)}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmCompleteButton}
                onPress={handleLessonComplete}
                accessibilityLabel="Complete Lesson"
                accessibilityRole="button"
              >
                <Text style={styles.confirmCompleteText}>Complete</Text>
              </TouchableOpacity>
            </View>
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
    </View>
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
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  menuButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  lessonHeader: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonInfo: {
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  contentContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  videoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: 200,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },
  videoPlaceholderText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
  },
  audioContainer: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  audioTitle: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
  },
  playButtonSmall: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
  },
  documentContainer: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  documentContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  interactiveContainer: {
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    alignItems: 'center',
  },
  interactiveText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  interactiveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  interactiveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  aiContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  aiInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    marginRight: 8,
    minHeight: 80,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiResponseContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiResponseTitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '600',
  },
  aiResponseText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  nextStepsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  prerequisites: {
    marginBottom: 12,
  },
  prerequisitesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
  nextLessonButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  nextLessonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  completeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  completeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeModalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  completeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  completeModalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  completeModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  confirmCompleteButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmCompleteText: {
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
  spinner: {
    animation: 'spin 1s linear infinite',
  },
});

export default LessonScreen;
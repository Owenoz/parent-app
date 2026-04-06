import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import assessmentsService from '../services/assessments.service';
import { aiAPI } from '../services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const AssignmentScreen = ({ navigation, route }) => {
  const { assignmentId, courseId } = route.params;
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadAssignmentData();
  }, []);

  const loadAssignmentData = async () => {
    try {
      setIsLoading(true);
      const result = await assessmentsService.getAssessmentDetails(assignmentId);
      
      if (result.success) {
        setAssignment(result.data);
        if (result.data.submission) {
          setSubmissionText(result.data.submission.content || '');
          setSubmissionFiles(result.data.submission.files || []);
          setIsSubmitted(true);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to load assignment');
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      Alert.alert('Error', 'Failed to load assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSubmissionFiles(prev => [...prev, file]);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setSubmissionFiles(prev => [...prev, image]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmission = async () => {
    if (!submissionText.trim() && submissionFiles.length === 0) {
      Alert.alert('Error', 'Please provide assignment content or attach files.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files first if any
      let uploadedFiles = [];
      if (submissionFiles.length > 0) {
        for (const file of submissionFiles) {
          const formData = new FormData();
          formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name || 'file'
          });
          
          const uploadResult = await assessmentsService.uploadAssignmentFile(formData);
          if (uploadResult.success) {
            uploadedFiles.push(uploadResult.data);
          }
        }
      }

      const result = await assessmentsService.submitAssessment(assignmentId, {
        content: submissionText,
        files: uploadedFiles,
        type: submissionFiles.length > 0 ? 'file' : 'text'
      });

      if (result.success) {
        Alert.alert('Success', 'Assignment submitted successfully!');
        setIsSubmitted(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to submit assignment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const removeFile = (fileIndex) => {
    setSubmissionFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const getDueDateStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) return { status: 'overdue', color: '#ef4444', text: 'Overdue' };
    if (diffDays <= 3) return { status: 'urgent', color: '#f59e0b', text: 'Due Soon' };
    return { status: 'normal', color: '#10b981', text: 'On Time' };
  };

  const accessibilityStyles = getAccessibilityStyles();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}
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
          
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, accessibilityStyles]} numberOfLines={1}>
              {assignment?.title || 'Assignment'}
            </Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              {assignment?.courseTitle || 'Course'} • {assignment?.points} points
            </Text>
          </View>
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Assignment Details */}
      {assignment && (
        <View style={[styles.assignmentContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.assignmentTitle, accessibilityStyles]}>{assignment.title}</Text>
          
          <View style={styles.assignmentMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={16} color="#64748b" />
              <Text style={[styles.metaText, accessibilityStyles]}>{assignment.courseTitle}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="star-outline" size={16} color="#64748b" />
              <Text style={[styles.metaText, accessibilityStyles]}>{assignment.points} points</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={[styles.metaText, accessibilityStyles]}>
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.dueDateContainer}>
            <View style={[
              styles.dueDateBadge,
              { backgroundColor: getDueDateStatus(assignment.dueDate).color }
            ]}>
              <Text style={styles.dueDateText}>
                {getDueDateStatus(assignment.dueDate).text}
              </Text>
            </View>
          </View>

          <Text style={[styles.assignmentDescription, accessibilityStyles]}>
            {assignment.description}
          </Text>

          {assignment.instructions && (
            <View style={styles.instructionsContainer}>
              <Text style={[styles.instructionsTitle, accessibilityStyles]}>Instructions:</Text>
              <Text style={[styles.instructionsText, accessibilityStyles]}>
                {assignment.instructions}
              </Text>
            </View>
          )}

          {assignment.resources && assignment.resources.length > 0 && (
            <View style={styles.resourcesContainer}>
              <Text style={[styles.resourcesTitle, accessibilityStyles]}>Resources:</Text>
              {assignment.resources.map((resource, index) => (
                <TouchableOpacity key={index} style={styles.resourceItem}>
                  <Ionicons name="document-text-outline" size={16} color="#64748b" />
                  <Text style={[styles.resourceText, accessibilityStyles]}>{resource.name}</Text>
                  <Ionicons name="download-outline" size={16} color="#2563eb" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Submission Section */}
      {!isSubmitted && (
        <View style={[styles.submissionContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.submissionTitle, accessibilityStyles]}>Your Submission</Text>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={[
                styles.textInput,
                accessibilityStyles,
                { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
              ]}
              placeholder="Type your assignment here..."
              placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
              value={submissionText}
              onChangeText={setSubmissionText}
              multiline
              numberOfLines={10}
              accessibilityLabel="Assignment submission"
              accessibilityRole="text"
            />
          </View>

          {/* File Attachments */}
          <View style={styles.fileContainer}>
            <Text style={[styles.fileTitle, accessibilityStyles]}>Attachments</Text>
            
            <View style={styles.fileActions}>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={handleFilePick}
                accessibilityLabel="Attach File"
                accessibilityRole="button"
              >
                <Ionicons name="attach-outline" size={20} color="#2563eb" />
                <Text style={[styles.fileButtonText, accessibilityStyles]}>Attach File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.fileButton}
                onPress={handleImagePick}
                accessibilityLabel="Attach Image"
                accessibilityRole="button"
              >
                <Ionicons name="image-outline" size={20} color="#2563eb" />
                <Text style={[styles.fileButtonText, accessibilityStyles]}>Attach Image</Text>
              </TouchableOpacity>
            </View>

            {submissionFiles.length > 0 && (
              <View style={styles.attachedFiles}>
                <Text style={[styles.attachedFilesTitle, accessibilityStyles]}>
                  Attached Files ({submissionFiles.length})
                </Text>
                {submissionFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Ionicons name="document-outline" size={16} color="#64748b" />
                    <Text style={[styles.fileName, accessibilityStyles]} numberOfLines={1}>
                      {file.name || `File ${index + 1}`}
                    </Text>
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      <Ionicons name="close-circle" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* AI Help Section */}
          <View style={styles.aiHelpContainer}>
            <Text style={[styles.aiHelpTitle, accessibilityStyles]}>Need Help?</Text>
            
            <View style={styles.aiInputContainer}>
              <TextInput
                style={[
                  styles.aiInput,
                  accessibilityStyles,
                  { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                ]}
                placeholder="Ask for help with this assignment..."
                placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
                value={aiQuestion}
                onChangeText={setAiQuestion}
                multiline
                numberOfLines={3}
                accessibilityLabel="AI help question"
                accessibilityRole="text"
              />
              
              <TouchableOpacity
                style={[
                  styles.aiButton,
                  { backgroundColor: aiQuestion.trim() ? '#2563eb' : '#94a3b8' }
                ]}
                onPress={handleAIHelp}
                disabled={!aiQuestion.trim() || isAIThinking}
                accessibilityLabel="Get AI Help"
                accessibilityRole="button"
              >
                {isAIThinking ? (
                  <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
                ) : (
                  <Ionicons name="sparkles-outline" size={20} color="#ffffff" />
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: submissionText.trim() || submissionFiles.length > 0 ? '#2563eb' : '#94a3b8' }
            ]}
            onPress={handleSubmission}
            disabled={!submissionText.trim() && submissionFiles.length === 0 || isSubmitting}
            accessibilityLabel="Submit Assignment"
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Assignment</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Submitted Status */}
      {isSubmitted && assignment && (
        <View style={[styles.submittedContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Ionicons name="checkmark-circle" size={48} color="#10b981" />
          <Text style={[styles.submittedTitle, accessibilityStyles]}>Assignment Submitted!</Text>
          <Text style={[styles.submittedSubtitle, accessibilityStyles]}>
            Submitted on {new Date().toLocaleDateString()}
          </Text>
          
          {assignment.grade && (
            <View style={styles.gradeContainer}>
              <Text style={[styles.gradeLabel, accessibilityStyles]}>Grade</Text>
              <Text style={[styles.gradeValue, accessibilityStyles]}>
                {assignment.grade}/{assignment.points}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back to Assignments"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Back to Assignments</Text>
          </TouchableOpacity>
        </View>
      )}

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
  shareButton: {
    padding: 8,
  },
  assignmentContainer: {
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
  assignmentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  assignmentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  dueDateContainer: {
    marginBottom: 12,
  },
  dueDateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  dueDateText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  assignmentDescription: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  resourcesContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resourceText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
  },
  submissionContainer: {
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
  submissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  textInput: {
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  fileContainer: {
    marginBottom: 16,
  },
  fileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  fileButtonText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '600',
  },
  attachedFiles: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  attachedFilesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
  },
  aiHelpContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  aiHelpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  submittedContainer: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submittedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginTop: 12,
    marginBottom: 4,
  },
  submittedSubtitle: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 16,
  },
  gradeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  gradeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
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

export default AssignmentScreen;
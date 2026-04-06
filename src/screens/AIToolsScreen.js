import React, { useState, useContext } from 'react';
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../services/api';

const AIToolsScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [selectedTool, setSelectedTool] = useState(null);
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const aiTools = [
    {
      id: 'tutor',
      title: 'AI Tutor',
      description: 'Get personalized help with any subject or topic',
      icon: 'school-outline',
      color: '#3b82f6',
      gradient: ['#3b82f6', '#2563eb'],
      requiresInput: true,
      placeholder: 'Ask your question or describe what you need help with...'
    },
    {
      id: 'translator',
      title: 'Language Translator',
      description: 'Translate text between languages instantly',
      icon: 'language-outline',
      color: '#10b981',
      gradient: ['#10b981', '#059669'],
      requiresInput: true,
      placeholder: 'Enter text to translate...'
    },
    {
      id: 'text-to-audio',
      title: 'Text to Audio',
      description: 'Convert text to natural-sounding audio',
      icon: 'volume-high-outline',
      color: '#f59e0b',
      gradient: ['#f59e0b', '#d97706'],
      requiresInput: true,
      placeholder: 'Enter text to convert to audio...'
    },
    {
      id: 'video-generator',
      title: 'AI Video Generator',
      description: 'Create educational videos from text descriptions',
      icon: 'videocam-outline',
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'],
      requiresInput: true,
      placeholder: 'Describe the video you want to create...'
    },
    {
      id: 'summarizer',
      title: 'Text Summarizer',
      description: 'Summarize long texts into key points',
      icon: 'document-text-outline',
      color: '#ef4444',
      gradient: ['#ef4444', '#dc2626'],
      requiresInput: true,
      placeholder: 'Paste the text you want to summarize...'
    },
    {
      id: 'study-planner',
      title: 'Study Planner',
      description: 'Create personalized study schedules',
      icon: 'calendar-outline',
      color: '#f97316',
      gradient: ['#f97316', '#ea580c'],
      requiresInput: false,
      placeholder: 'Generate a study plan based on your courses...'
    },
    {
      id: 'quiz-generator',
      title: 'Quiz Generator',
      description: 'Generate practice quizzes for any topic',
      icon: 'help-circle-outline',
      color: '#06b6d4',
      gradient: ['#06b6d4', '#0891b2'],
      requiresInput: true,
      placeholder: 'Enter topic or subject for quiz generation...'
    },
    {
      id: 'insights',
      title: 'Learning Insights',
      description: 'Get AI-powered insights on your learning progress',
      icon: 'analytics-outline',
      color: '#84cc16',
      gradient: ['#84cc16', '#65a30d'],
      requiresInput: false,
      placeholder: 'View personalized learning insights...'
    },
  ];

  const handleToolPress = (tool) => {
    if (isOffline && tool.id !== 'insights') {
      Alert.alert(
        'Offline Mode',
        'This AI tool requires internet connection. Please connect to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedTool(tool);
    setInputText('');
    setAiResponse('');
    setIsModalVisible(true);
  };

  const handleAICall = async () => {
    if (!inputText.trim() && selectedTool.requiresInput) {
      Alert.alert('Input Required', 'Please enter some text to process.');
      return;
    }

    setIsProcessing(true);
    setAiResponse('');

    try {
      let response;
      
      switch (selectedTool.id) {
        case 'tutor':
          response = await aiAPI.getTutorResponse(inputText, selectedChildId);
          break;
        case 'translator':
          response = await aiAPI.translateText(inputText, 'en', 'sw'); // Default to English-Swahili
          break;
        case 'text-to-audio':
          response = await aiAPI.textToAudio(inputText, 'en');
          break;
        case 'video-generator':
          response = await aiAPI.generateVideo(inputText);
          break;
        case 'summarizer':
          response = await aiAPI.summarizeText(inputText);
          break;
        case 'study-planner':
          response = await aiAPI.generateStudyPlan(selectedChildId);
          break;
        case 'quiz-generator':
          response = await aiAPI.generateQuiz(inputText, selectedChildId);
          break;
        case 'insights':
          response = await aiAPI.getLearningInsights(selectedChildId);
          break;
        default:
          throw new Error('Unknown AI tool');
      }

      if (response.data.success) {
        setAiResponse(response.data.result || response.data.message);
      } else {
        setAiResponse('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('AI call error:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveResponse = () => {
    // Save response to offline storage
    Alert.alert('Saved', 'Response saved to your notes.');
  };

  const handleShareResponse = () => {
    // Share response functionality
    Alert.alert('Share', 'Response shared successfully.');
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
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, accessibilityStyles]}>AI Study Tools</Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              Powered by advanced artificial intelligence
            </Text>
          </View>
          <Ionicons name="sparkles-outline" size={48} color="#ffffff" />
        </View>
      </LinearGradient>

      {/* AI Tools Grid */}
      <View style={styles.toolsContainer}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Available Tools</Text>
        
        <View style={styles.toolsGrid}>
          {aiTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolCard,
                { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }
              ]}
              onPress={() => handleToolPress(tool)}
              accessibilityLabel={tool.title}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={tool.gradient}
                style={styles.toolIconContainer}
              >
                <Ionicons name={tool.icon} size={28} color="#ffffff" />
              </LinearGradient>
              
              <View style={styles.toolInfo}>
                <Text style={[styles.toolTitle, accessibilityStyles]}>{tool.title}</Text>
                <Text style={[styles.toolDescription, accessibilityStyles]} numberOfLines={2}>
                  {tool.description}
                </Text>
              </View>
              
              {isOffline && tool.id !== 'insights' && (
                <View style={styles.offlineOverlay}>
                  <Ionicons name="wifi-outline" size={16} color="#ef4444" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View style={[styles.featuresContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>AI Features</Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.featureText, accessibilityStyles]}>
              Context-aware responses based on your courses
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.featureText, accessibilityStyles]}>
              Multilingual support for diverse learners
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.featureText, accessibilityStyles]}>
              Personalized learning recommendations
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.featureText, accessibilityStyles]}>
              Offline access to learning insights
            </Text>
          </View>
        </View>
      </View>

      {/* Modal for AI Tool Interaction */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <LinearGradient
                  colors={selectedTool?.gradient || ['#2563eb', '#1e40af']}
                  style={styles.modalIcon}
                >
                  <Ionicons name={selectedTool?.icon || 'sparkles-outline'} size={24} color="#ffffff" />
                </LinearGradient>
                <View>
                  <Text style={[styles.modalTitle, accessibilityStyles]}>
                    {selectedTool?.title || 'AI Tool'}
                  </Text>
                  <Text style={[styles.modalSubtitle, accessibilityStyles]}>
                    {selectedTool?.description || 'AI-powered assistance'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Input Section */}
            {selectedTool?.requiresInput && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, accessibilityStyles]}>Input</Text>
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
                    placeholder={selectedTool.placeholder}
                    placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    numberOfLines={4}
                    accessibilityLabel="Input text"
                    accessibilityRole="text"
                  />
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.processButton,
                { backgroundColor: selectedTool?.color || '#2563eb' }
              ]}
              onPress={handleAICall}
              disabled={isProcessing}
              accessibilityLabel="Process with AI"
              accessibilityRole="button"
            >
              {isProcessing ? (
                <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
              ) : (
                <Text style={styles.processButtonText}>
                  {selectedTool?.id === 'insights' ? 'Generate Insights' : 'Process with AI'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Response Section */}
            {aiResponse && (
              <View style={styles.responseContainer}>
                <Text style={[styles.responseLabel, accessibilityStyles]}>AI Response</Text>
                <View style={[
                  styles.responseBox,
                  { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                ]}>
                  <Text style={[styles.responseText, accessibilityStyles]}>{aiResponse}</Text>
                </View>
                
                <View style={styles.responseActions}>
                  <TouchableOpacity style={styles.responseButton} onPress={handleSaveResponse}>
                    <Ionicons name="save-outline" size={20} color="#2563eb" />
                    <Text style={[styles.responseButtonText, accessibilityStyles]}>Save</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.responseButton} onPress={handleShareResponse}>
                    <Ionicons name="share-social-outline" size={20} color="#2563eb" />
                    <Text style={[styles.responseButtonText, accessibilityStyles]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Offline Notice */}
            {isOffline && selectedTool?.id !== 'insights' && (
              <View style={styles.offlineNotice}>
                <Ionicons name="wifi-outline" size={16} color="#ef4444" />
                <Text style={styles.offlineNoticeText}>
                  Internet connection required for this tool
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  toolsContainer: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
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
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  offlineOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  featuresContainer: {
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
  featureList: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  textInput: {
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  processButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  responseContainer: {
    marginTop: 16,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  responseBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    minHeight: 100,
  },
  responseText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 20,
  },
  responseActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  responseButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  offlineNoticeText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 8,
  },
});

export default AIToolsScreen;
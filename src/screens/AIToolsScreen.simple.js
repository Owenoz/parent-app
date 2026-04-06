import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AIToolsScreen = ({ navigation }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const aiTools = [
    { id: 'tutor', title: 'AI Tutor', description: 'Get personalized help with any subject', icon: 'school-outline', color: '#3b82f6' },
    { id: 'translator', title: 'Language Translator', description: 'Translate text between languages', icon: 'language-outline', color: '#10b981' },
    { id: 'text-to-audio', title: 'Text to Audio', description: 'Convert text to speech', icon: 'volume-high-outline', color: '#f59e0b' },
    { id: 'video-generator', title: 'Video Generator', description: 'Create educational videos', icon: 'videocam-outline', color: '#8b5cf6' },
    { id: 'summarizer', title: 'Text Summarizer', description: 'Summarize long texts', icon: 'document-text-outline', color: '#ef4444' },
    { id: 'study-planner', title: 'Study Planner', description: 'Create study schedules', icon: 'calendar-outline', color: '#f97316' },
    { id: 'quiz-generator', title: 'Quiz Generator', description: 'Generate practice quizzes', icon: 'help-circle-outline', color: '#06b6d4' },
    { id: 'insights', title: 'Learning Insights', description: 'AI-powered progress insights', icon: 'analytics-outline', color: '#84cc16' },
  ];

  const handleToolPress = (tool) => {
    setSelectedTool(tool);
    setInputText('');
    setAiResponse('');
    setIsModalVisible(true);
  };

  const handleProcess = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setAiResponse(`AI response for ${selectedTool.title}: This is a simulated response. In production, this would connect to actual AI services.`);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>AI Study Tools</Text>
          <Text style={styles.headerSubtitle}>Powered by AI</Text>
        </View>
        <Ionicons name="sparkles" size={32} color="#ffffff" />
      </View>

      {/* Tools Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Tools</Text>
        <View style={styles.toolsGrid}>
          {aiTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => handleToolPress(tool)}
            >
              <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                <Ionicons name={tool.icon} size={28} color="#ffffff" />
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription} numberOfLines={2}>
                {tool.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalIcon, { backgroundColor: selectedTool?.color }]}>
                  <Ionicons name={selectedTool?.icon} size={24} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{selectedTool?.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedTool?.description}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Input</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your text here..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.processButton, { backgroundColor: selectedTool?.color }]}
              onPress={handleProcess}
              disabled={isProcessing}
            >
              <Text style={styles.processButtonText}>
                {isProcessing ? 'Processing...' : 'Process with AI'}
              </Text>
            </TouchableOpacity>

            {aiResponse && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>AI Response</Text>
                <View style={styles.responseBox}>
                  <Text style={styles.responseText}>{aiResponse}</Text>
                </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 2,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  toolCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  toolDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
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
    borderRadius: 20,
    padding: 24,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
  },
  processButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  responseBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
    minHeight: 100,
  },
  responseText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 22,
  },
});

export default AIToolsScreen;

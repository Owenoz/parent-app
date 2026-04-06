import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../services/api';

const AITutorScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      Alert.alert('Input Required', 'Please enter your question.');
      return;
    }

    const userQuestion = question;
    setQuestion('');
    setAiResponse('');
    setIsAIThinking(true);
    setIsTyping(true);

    // Add user question to history
    const newHistory = [...conversationHistory, { type: 'user', text: userQuestion }];
    setConversationHistory(newHistory);

    try {
      const response = await aiAPI.getTutorResponse(userQuestion, selectedChildId);
      
      if (response.data.success) {
        const aiText = response.data.result || response.data.message;
        
        // Simulate typing effect
        let currentIndex = 0;
        const typeWriter = setInterval(() => {
          if (currentIndex < aiText.length) {
            setAiResponse(aiText.substring(0, currentIndex + 1));
            currentIndex++;
          } else {
            clearInterval(typeWriter);
            setIsTyping(false);
            
            // Add AI response to history
            setConversationHistory(prev => [...prev, { type: 'ai', text: aiText }]);
          }
        }, 20);
      } else {
        const errorMessage = 'Sorry, I encountered an error. Please try again.';
        setAiResponse(errorMessage);
        setConversationHistory(prev => [...prev, { type: 'ai', text: errorMessage }]);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('AI call error:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setAiResponse(errorMessage);
      setConversationHistory(prev => [...prev, { type: 'ai', text: errorMessage }]);
      setIsTyping(false);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => setConversationHistory([]) }
      ]
    );
  };

  const handleSuggestedQuestion = (suggestion) => {
    setQuestion(suggestion);
  };

  const suggestedQuestions = [
    "How do I solve quadratic equations?",
    "Can you explain photosynthesis?",
    "What's the difference between mitosis and meiosis?",
    "How do I write a good essay introduction?",
    "Can you help me understand Newton's laws?",
    "What are the key themes in Shakespeare's plays?"
  ];

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
            <Text style={[styles.headerTitle, accessibilityStyles]}>AI Tutor</Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              Get personalized help with your studies
            </Text>
          </View>
          
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Conversation History */}
        <ScrollView style={styles.conversationContainer} showsVerticalScrollIndicator={false}>
          {conversationHistory.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
              <Ionicons name="sparkles-outline" size={64} color="#2563eb" />
              <Text style={[styles.emptyTitle, accessibilityStyles]}>Ask Your AI Tutor</Text>
              <Text style={[styles.emptySubtitle, accessibilityStyles]}>
                Get instant help with any subject or topic
              </Text>
            </View>
          ) : (
            conversationHistory.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: message.type === 'user' 
                      ? settings.isHighContrast ? '#333333' : '#2563eb'
                      : settings.isHighContrast ? '#1a1a1a' : '#ffffff',
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                  }
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    accessibilityStyles,
                    { color: message.type === 'user' ? '#ffffff' : '#1f2937' }
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ))
          )}

          {/* AI Thinking Indicator */}
          {isAIThinking && (
            <View style={[styles.thinkingContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
              <View style={styles.typingIndicator}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <Text style={[styles.thinkingText, accessibilityStyles]}>AI Tutor is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Suggested Questions */}
        {conversationHistory.length === 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.suggestionsTitle, accessibilityStyles]}>Popular Questions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsList}
            >
              {suggestedQuestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionChip,
                    { backgroundColor: settings.isHighContrast ? '#333333' : '#f8fafc' }
                  ]}
                  onPress={() => handleSuggestedQuestion(suggestion)}
                  accessibilityLabel={`Ask: ${suggestion}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.suggestionText, accessibilityStyles]}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.textInput,
                accessibilityStyles,
                { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
              ]}
              placeholder="Ask your AI tutor anything..."
              placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={3}
              accessibilityLabel="Ask AI tutor"
              accessibilityRole="text"
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: question.trim() ? '#2563eb' : '#94a3b8' }
              ]}
              onPress={handleAskQuestion}
              disabled={!question.trim() || isAIThinking}
              accessibilityLabel="Send Question"
              accessibilityRole="button"
            >
              <Ionicons name="send-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.inputHint, accessibilityStyles]}>
            Tip: Be specific about what you need help with
          </Text>
        </View>
      </View>

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode - AI features may be limited</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  clearButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: -20,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginHorizontal: 2,
    animation: 'pulse 1.5s infinite',
  },
  thinkingText: {
    fontSize: 14,
    color: '#64748b',
  },
  suggestionsContainer: {
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
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#64748b',
  },
  inputContainer: {
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    marginRight: 12,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
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

export default AITutorScreen;
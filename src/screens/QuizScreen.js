import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import assessmentsService from '../services/assessments.service';
import { aiAPI } from '../services/api';

const QuizScreen = ({ navigation, route }) => {
  const { quizId, courseId } = route.params;
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, []);

  useEffect(() => {
    let timer;
    if (isQuizStarted && timeLeft > 0 && !isQuizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isQuizStarted && !isQuizCompleted) {
      handleQuizComplete();
    }
    return () => clearInterval(timer);
  }, [timeLeft, isQuizStarted, isQuizCompleted]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      const result = await assessmentsService.getAssessmentDetails(quizId);
      
      if (result.success) {
        setQuiz(result.data);
        setTimeLeft(result.data.timeLimit * 60); // Convert to seconds
      } else {
        Alert.alert('Error', result.error || 'Failed to load quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const result = await assessmentsService.startAssessment(quizId);
      if (result.success) {
        setIsQuizStarted(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to start quiz');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setIsQuizStarted(true); // Allow starting anyway
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    if (isQuizCompleted) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizComplete = async () => {
    setIsQuizCompleted(true);
    
    try {
      const result = await assessmentsService.submitAssessment(quizId, {
        answers,
        timeSpent: (quiz.timeLimit * 60) - timeLeft
      });

      if (result.success) {
        setScore(result.data.score || 0);
        setShowResults(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to submit quiz');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId] !== undefined) return 'completed';
    return 'pending';
  };

  const getQuestionStatusColor = (questionId) => {
    return getQuestionStatus(questionId) === 'completed' ? '#10b981' : '#64748b';
  };

  const accessibilityStyles = getAccessibilityStyles();

  if (!quiz) {
    return (
      <View style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}>
        <LinearGradient
          colors={settings.isHighContrast ? ['#ffffff', '#ffffff'] : ['#2563eb', '#1e40af']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, accessibilityStyles]}>Quiz</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={48} color="#64748b" />
          <Text style={[styles.loadingText, accessibilityStyles]}>Loading quiz...</Text>
        </View>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

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
              {quiz.title}
            </Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              {quiz.questions.length} questions • {quiz.timeLimit} min
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="timer-outline" size={20} color="#ffffff" />
            <Text style={[styles.timeText, accessibilityStyles]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {!isQuizStarted ? (
        /* Quiz Info Screen */
        <View style={[styles.quizInfoContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.quizTitle, accessibilityStyles]}>{quiz.title}</Text>
          
          <View style={styles.quizDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="help-circle-outline" size={16} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                {quiz.questions.length} questions
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="timer-outline" size={16} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                {quiz.timeLimit} minutes
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="star-outline" size={16} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                {quiz.maxPoints} points
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={16} color="#64748b" />
              <Text style={[styles.detailText, accessibilityStyles]}>
                {quiz.courseTitle}
              </Text>
            </View>
          </View>

          <Text style={[styles.instructions, accessibilityStyles]}>
            {quiz.instructions || 'Complete all questions within the time limit. You can navigate between questions before submitting.'}
          </Text>

          <View style={styles.startActions}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startQuiz}
              accessibilityLabel="Start Quiz"
              accessibilityRole="button"
            >
              <Text style={styles.startButtonText}>Start Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.aiHelpButton}
              onPress={() => setShowAIHelp(!showAIHelp)}
              accessibilityLabel="AI Help"
              accessibilityRole="button"
            >
              <Ionicons name="sparkles-outline" size={20} color="#2563eb" />
              <Text style={[styles.aiHelpButtonText, accessibilityStyles]}>AI Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Quiz Content Screen */
        <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
          {/* Question Navigation */}
          <View style={[styles.questionNav, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.questionCounter, accessibilityStyles]}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Text>
            
            <View style={styles.questionDots}>
              {quiz.questions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.questionDot,
                    {
                      backgroundColor: getQuestionStatusColor(quiz.questions[index].id),
                      borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0'
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Question Content */}
          <View style={[styles.questionContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.questionText, accessibilityStyles]}>
              {currentQuestion.question}
            </Text>
            
            {currentQuestion.imageUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: currentQuestion.imageUrl }}
                  style={styles.questionImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Answers */}
            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerButton,
                    {
                      backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff',
                      borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0',
                      borderWidth: 1,
                    },
                    answers[currentQuestion.id] === index && styles.selectedAnswer
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion.id, index)}
                  disabled={isQuizCompleted}
                  accessibilityLabel={`Answer ${index + 1}: ${answer.text}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: answers[currentQuestion.id] === index }}
                >
                  <View style={styles.answerContent}>
                    <View style={[
                      styles.answerCircle,
                      answers[currentQuestion.id] === index && styles.selectedCircle
                    ]}>
                      <Text style={[
                        styles.answerLetter,
                        answers[currentQuestion.id] === index && styles.selectedLetter
                      ]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={[styles.answerText, accessibilityStyles]}>{answer.text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Navigation Buttons */}
          <View style={[styles.navigationContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: currentQuestionIndex > 0 ? '#2563eb' : '#94a3b8' }
              ]}
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              accessibilityLabel="Previous Question"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextQuestion}
                accessibilityLabel="Next Question"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleQuizComplete}
                accessibilityLabel="Complete Quiz"
                accessibilityRole="button"
              >
                <Text style={styles.completeButtonText}>Complete</Text>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* AI Help Modal */}
      {showAIHelp && (
        <Modal
          visible={showAIHelp}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAIHelp(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, accessibilityStyles]}>AI Tutor</Text>
                <TouchableOpacity onPress={() => setShowAIHelp(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.aiInputContainer}>
                <TextInput
                  style={[
                    styles.aiInput,
                    accessibilityStyles,
                    { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                  ]}
                  placeholder="Ask for help with this quiz..."
                  placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
                  value={aiQuestion}
                  onChangeText={setAiQuestion}
                  multiline
                  numberOfLines={4}
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
          </View>
        </Modal>
      )}

      {/* Results Modal */}
      {showResults && (
        <Modal
          visible={showResults}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowResults(false)}
        >
          <View style={styles.resultsOverlay}>
            <View style={[
              styles.resultsContent,
              { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
            ]}>
              <Ionicons name="medal-outline" size={64} color="#10b981" />
              <Text style={[styles.resultsTitle, accessibilityStyles]}>Quiz Complete!</Text>
              
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreLabel, accessibilityStyles]}>Your Score</Text>
                <Text style={[styles.scoreValue, accessibilityStyles]}>
                  {score}/{quiz.maxPoints}
                </Text>
                <Text style={[styles.scorePercentage, accessibilityStyles]}>
                  {Math.round((score / quiz.maxPoints) * 100)}%
                </Text>
              </View>

              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.resultsButton}
                  onPress={() => {
                    setShowResults(false);
                    navigation.goBack();
                  }}
                  accessibilityLabel="Back to Quiz"
                  accessibilityRole="button"
                >
                  <Text style={styles.resultsButtonText}>Back to Quiz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  quizInfoContainer: {
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
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  quizDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 20,
  },
  startActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  aiHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  aiHelpButtonText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '600',
  },
  quizContent: {
    flex: 1,
  },
  questionNav: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionCounter: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  questionDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  questionContainer: {
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 24,
  },
  imageContainer: {
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  answersContainer: {
    marginBottom: 16,
  },
  answerButton: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedAnswer: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  answerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCircle: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  answerLetter: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  selectedLetter: {
    color: '#ffffff',
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  navigationContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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
    minHeight: 100,
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
    marginTop: 12,
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
  resultsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  scoreContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  scorePercentage: {
    fontSize: 16,
    color: '#64748b',
  },
  resultsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resultsButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsButtonText: {
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

export default QuizScreen;
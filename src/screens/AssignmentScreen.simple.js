import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AssignmentScreen = ({ navigation, route }) => {
  const assignmentId = route?.params?.assignmentId || 1;
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const assignment = {
    id: assignmentId,
    title: 'Physics Problem Set 1',
    description: 'Solve the following problems related to motion and forces.',
    dueDate: '2026-03-25',
    totalPoints: 100,
    questions: [
      'Calculate the velocity of an object moving at 10 m/s for 5 seconds.',
      'Explain Newton\'s First Law of Motion with an example.',
      'What is the difference between speed and velocity?',
    ],
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please provide your answers');
      return;
    }
    setIsSubmitted(true);
    Alert.alert('Success', 'Assignment submitted successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Assignment Info */}
      <View style={styles.infoCard}>
        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
        <Text style={styles.assignmentDescription}>{assignment.description}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.metaText}>Due: {assignment.dueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="trophy-outline" size={16} color="#64748b" />
            <Text style={styles.metaText}>{assignment.totalPoints} points</Text>
          </View>
        </View>

        {isSubmitted && (
          <View style={styles.submittedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.submittedText}>Submitted</Text>
          </View>
        )}
      </View>

      {/* Questions */}
      <View style={styles.questionsCard}>
        <Text style={styles.sectionTitle}>Questions</Text>
        {assignment.questions.map((question, index) => (
          <View key={index} style={styles.questionItem}>
            <Text style={styles.questionNumber}>Q{index + 1}</Text>
            <Text style={styles.questionText}>{question}</Text>
          </View>
        ))}
      </View>

      {/* Answer Input */}
      <View style={styles.answerCard}>
        <Text style={styles.sectionTitle}>Your Answer</Text>
        <TextInput
          style={styles.answerInput}
          placeholder="Type your answers here..."
          placeholderTextColor="#94a3b8"
          value={answer}
          onChangeText={setAnswer}
          multiline
          numberOfLines={8}
          editable={!isSubmitted}
        />
        
        {!isSubmitted && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>Submit Assignment</Text>
          </TouchableOpacity>
        )}
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
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
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
  assignmentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  submittedText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 6,
  },
  questionsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginRight: 12,
    minWidth: 30,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 22,
  },
  answerCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonCompleted: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonSecondaryText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  navigationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginHorizontal: 6,
  },
});

export default AssignmentScreen;

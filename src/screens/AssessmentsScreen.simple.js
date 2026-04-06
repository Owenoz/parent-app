import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AssessmentsScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('upcoming');

  const assessments = {
    upcoming: [
      { id: 1, title: 'Physics Midterm Exam', course: 'Introduction to Physics', date: '2026-03-20', type: 'exam', duration: 120 },
      { id: 2, title: 'Math Assignment 3', course: 'Advanced Mathematics', date: '2026-03-22', type: 'assignment', duration: 60 },
    ],
    completed: [
      { id: 3, title: 'English Essay', course: 'English Literature', date: '2026-03-10', type: 'assignment', score: 85 },
      { id: 4, title: 'Chemistry Quiz 2', course: 'Chemistry Basics', date: '2026-03-08', type: 'quiz', score: 92 },
    ],
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return '#ef4444';
      case 'quiz': return '#3b82f6';
      case 'assignment': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam': return 'document-text';
      case 'quiz': return 'help-circle';
      case 'assignment': return 'clipboard';
      default: return 'document';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessments</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Assessments List */}
      <ScrollView style={styles.content}>
        {assessments[selectedTab].map((assessment) => (
          <TouchableOpacity
            key={assessment.id}
            style={styles.assessmentCard}
            onPress={() => navigation.navigate(
              assessment.type === 'assignment' ? 'Assignment' : 'Quiz',
              { [assessment.type === 'assignment' ? 'assignmentId' : 'quizId']: assessment.id }
            )}
          >
            <View style={[styles.typeIcon, { backgroundColor: getTypeColor(assessment.type) }]}>
              <Ionicons name={getTypeIcon(assessment.type)} size={24} color="#ffffff" />
            </View>
            
            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentTitle}>{assessment.title}</Text>
              <Text style={styles.assessmentCourse}>{assessment.course}</Text>
              
              <View style={styles.assessmentMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{assessment.date}</Text>
                </View>
                {selectedTab === 'upcoming' && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{assessment.duration} min</Text>
                  </View>
                )}
                {selectedTab === 'completed' && (
                  <View style={styles.metaItem}>
                    <Ionicons name="trophy" size={14} color="#f59e0b" />
                    <Text style={styles.metaText}>{assessment.score}%</Text>
                  </View>
                )}
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  assessmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  assessmentCourse: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  assessmentMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
});

export default AssessmentsScreen;

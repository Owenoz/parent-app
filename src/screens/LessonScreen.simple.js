import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LessonScreen = ({ navigation, route }) => {
  const lessonId = route?.params?.lessonId || 1;
  const [isCompleted, setIsCompleted] = useState(false);

  const lesson = {
    id: lessonId,
    title: 'Introduction to Motion',
    duration: 45,
    type: 'Video',
    content: 'This lesson covers the basic principles of motion, including velocity, acceleration, and displacement. Understanding these concepts is fundamental to physics.',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lesson</Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Lesson Content */}
      <View style={styles.contentCard}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        
        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={styles.metaText}>{lesson.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="play-circle-outline" size={16} color="#64748b" />
            <Text style={styles.metaText}>{lesson.type}</Text>
          </View>
        </View>

        {/* Video Placeholder */}
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={64} color="#2563eb" />
          <Text style={styles.videoText}>Video Player</Text>
        </View>

        {/* Lesson Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this lesson</Text>
          <Text style={styles.descriptionText}>{lesson.content}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isCompleted && styles.actionButtonCompleted]}
            onPress={() => setIsCompleted(!isCompleted)}
          >
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={20} 
              color="#ffffff" 
            />
            <Text style={styles.actionButtonText}>
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => navigation.navigate('Quiz', { lessonId })}
          >
            <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.actionButtonSecondaryText}>Take Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationCard}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color="#64748b" />
          <Text style={styles.navButtonText}>Previous Lesson</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Next Lesson</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
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
  bookmarkButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
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
  lessonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  videoText: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 8,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
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

export default LessonScreen;

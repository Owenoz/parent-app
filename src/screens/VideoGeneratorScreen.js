import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Picker,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../services/api';

const VideoGeneratorScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [videoStyle, setVideoStyle] = useState('educational');
  const [videoLength, setVideoLength] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);

  const videoStyles = [
    { id: 'educational', name: 'Educational', icon: 'school-outline' },
    { id: 'animated', name: 'Animated', icon: 'videocam-outline' },
    { id: 'slide', name: 'Slide Show', icon: 'images-outline' },
    { id: 'talking', name: 'Talking Head', icon: 'person-outline' },
  ];

  const videoLengths = [
    { id: '2', name: '2 minutes', value: 2 },
    { id: '5', name: '5 minutes', value: 5 },
    { id: '10', name: '10 minutes', value: 10 },
    { id: '15', name: '15 minutes', value: 15 },
  ];

  const handleGenerateVideo = async () => {
    if (!topic.trim() || !description.trim()) {
      Alert.alert('Input Required', 'Please enter both topic and description.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await aiAPI.generateVideo({
        topic,
        description,
        style: videoStyle,
        length: parseInt(videoLength),
        childId: selectedChildId
      });

      if (response.data.success) {
        const videoData = {
          id: Date.now(),
          topic: topic,
          description: description,
          videoUrl: response.data.videoUrl,
          style: videoStyle,
          length: videoLength,
          thumbnail: response.data.thumbnail,
          timestamp: new Date().toLocaleString()
        };
        
        setGeneratedVideos(prev => [videoData, ...prev]);
        Alert.alert('Success', 'Video generated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      Alert.alert('Error', 'Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayVideo = (videoData) => {
    Alert.alert('Play Video', `Playing: ${videoData.topic}`);
  };

  const handleDownloadVideo = (videoData) => {
    Alert.alert('Download', `Downloading video: ${videoData.topic}`);
  };

  const handleDeleteVideo = (videoId) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setGeneratedVideos(prev => prev.filter(video => video.id !== videoId)) }
      ]
    );
  };

  const getStyleIcon = (styleId) => {
    const style = videoStyles.find(s => s.id === styleId);
    return style ? style.icon : 'videocam-outline';
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
            <Text style={[styles.headerTitle, accessibilityStyles]}>Video Generator</Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              Create AI-powered educational videos
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Input Section */}
      <View style={[styles.inputSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Video Details</Text>
        
        {/* Topic Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, accessibilityStyles]}>Topic</Text>
          <TextInput
            style={[
              styles.textInput,
              accessibilityStyles,
              { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
            ]}
            placeholder="Enter video topic..."
            placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
            value={topic}
            onChangeText={setTopic}
            accessibilityLabel="Video topic"
            accessibilityRole="text"
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, accessibilityStyles]}>Description</Text>
          <TextInput
            style={[
              styles.textInput,
              accessibilityStyles,
              { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
            ]}
            placeholder="Describe what the video should cover..."
            placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            accessibilityLabel="Video description"
            accessibilityRole="text"
          />
        </View>

        {/* Video Style Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, accessibilityStyles]}>Video Style</Text>
          <View style={styles.styleSelector}>
            {videoStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleOption,
                  {
                    backgroundColor: videoStyle === style.id ? '#2563eb' : '#f8fafc',
                    borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0'
                  }
                ]}
                onPress={() => setVideoStyle(style.id)}
                accessibilityLabel={`Select ${style.name} style`}
                accessibilityRole="button"
                accessibilityState={{ selected: videoStyle === style.id }}
              >
                <Ionicons name={getStyleIcon(style.id)} size={20} color={videoStyle === style.id ? '#ffffff' : '#64748b'} />
                <Text style={[
                  styles.styleOptionText,
                  accessibilityStyles,
                  { color: videoStyle === style.id ? '#ffffff' : '#64748b' }
                ]}>
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Video Length Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, accessibilityStyles]}>Video Length</Text>
          <View style={styles.lengthSelector}>
            {videoLengths.map((length) => (
              <TouchableOpacity
                key={length.id}
                style={[
                  styles.lengthOption,
                  {
                    backgroundColor: videoLength === length.id ? '#2563eb' : '#f8fafc',
                    borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0'
                  }
                ]}
                onPress={() => setVideoLength(length.id)}
                accessibilityLabel={`Select ${length.name}`}
                accessibilityRole="button"
                accessibilityState={{ selected: videoLength === length.id }}
              >
                <Text style={[
                  styles.lengthOptionText,
                  accessibilityStyles,
                  { color: videoLength === length.id ? '#ffffff' : '#64748b' }
                ]}>
                  {length.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            { backgroundColor: (topic.trim() && description.trim()) ? '#2563eb' : '#94a3b8' }
          ]}
          onPress={handleGenerateVideo}
          disabled={!topic.trim() || !description.trim() || isGenerating}
          accessibilityLabel="Generate Video"
          accessibilityRole="button"
        >
          {isGenerating ? (
            <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
          ) : (
            <Ionicons name="videocam-outline" size={20} color="#ffffff" />
          )}
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generated Videos */}
      {generatedVideos.length > 0 && (
        <View style={[styles.historySection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, accessibilityStyles]}>Generated Videos</Text>
          
          {generatedVideos.map((video) => (
            <View key={video.id} style={styles.videoItem}>
              <View style={styles.videoThumbnail}>
                <Ionicons name="play-circle-outline" size={48} color="#2563eb" />
                <Text style={[styles.videoLength, accessibilityStyles]}>{video.length} min</Text>
              </View>
              
              <View style={styles.videoInfo}>
                <Text style={[styles.videoTitle, accessibilityStyles]} numberOfLines={2}>
                  {video.topic}
                </Text>
                <Text style={[styles.videoDescription, accessibilityStyles]} numberOfLines={2}>
                  {video.description}
                </Text>
                <Text style={[styles.videoMeta, accessibilityStyles]}>
                  {video.style} • {video.timestamp}
                </Text>
              </View>
              
              <View style={styles.videoActions}>
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => handlePlayVideo(video)}
                  accessibilityLabel="Play Video"
                  accessibilityRole="button"
                >
                  <Ionicons name="play-circle-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => handleDownloadVideo(video)}
                  accessibilityLabel="Download Video"
                  accessibilityRole="button"
                >
                  <Ionicons name="download-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => handleDeleteVideo(video.id)}
                  accessibilityLabel="Delete Video"
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tips Section */}
      <View style={[styles.tipsSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Tips</Text>
        <View style={styles.tipItem}>
          <Ionicons name="bulb-outline" size={16} color="#2563eb" />
          <Text style={[styles.tipText, accessibilityStyles]}>
            Be specific about your topic for better video generation
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="document-text-outline" size={16} color="#2563eb" />
          <Text style={[styles.tipText, accessibilityStyles]}>
            Provide detailed descriptions for more comprehensive videos
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="timer-outline" size={16} color="#2563eb" />
          <Text style={[styles.tipText, accessibilityStyles]}>
            Choose appropriate video length based on topic complexity
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="school-outline" size={16} color="#2563eb" />
          <Text style={[styles.tipText, accessibilityStyles]}>
            Educational style works best for learning content
          </Text>
        </View>
      </View>

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode - Video generation may be limited</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  inputSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    minHeight: 40,
  },
  styleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  styleOptionText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  lengthSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lengthOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  lengthOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  historySection: {
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
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  videoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoLength: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 20,
  },
  videoMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoButton: {
    padding: 8,
    marginLeft: 8,
  },
  tipsSection: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    lineHeight: 20,
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

export default VideoGeneratorScreen;
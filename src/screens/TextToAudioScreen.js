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
import Slider from '@react-native-community/slider';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../services/api';

const TextToAudioScreen = ({ navigation }) => {
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voiceType, setVoiceType] = useState('neutral');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [generatedAudios, setGeneratedAudios] = useState([]);

  const voiceOptions = [
    { id: 'neutral', name: 'Neutral', icon: 'mic-outline' },
    { id: 'male', name: 'Male', icon: 'male-outline' },
    { id: 'female', name: 'Female', icon: 'female-outline' },
    { id: 'child', name: 'Child', icon: 'school-outline' },
  ];

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      Alert.alert('Input Required', 'Please enter text to convert to audio.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await aiAPI.textToAudio(text, {
        voice: voiceType,
        rate: speechRate,
        pitch: speechPitch,
        childId: selectedChildId
      });

      if (response.data.success) {
        const audioData = {
          id: Date.now(),
          text: text,
          audioUrl: response.data.audioUrl,
          voiceType: voiceType,
          rate: speechRate,
          pitch: speechPitch,
          timestamp: new Date().toLocaleString()
        };
        
        setGeneratedAudios(prev => [audioData, ...prev]);
        setAudioUrl(response.data.audioUrl);
        Alert.alert('Success', 'Audio generated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to generate audio');
      }
    } catch (error) {
      console.error('Text-to-audio error:', error);
      Alert.alert('Error', 'Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = (audioData) => {
    // In a real implementation, this would use a media player
    Alert.alert('Play Audio', `Playing: ${audioData.text.substring(0, 50)}...`);
    setIsPlaying(true);
  };

  const handleDownloadAudio = (audioData) => {
    Alert.alert('Download', `Downloading audio: ${audioData.text.substring(0, 30)}...`);
  };

  const handleDeleteAudio = (audioId) => {
    Alert.alert(
      'Delete Audio',
      'Are you sure you want to delete this audio?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setGeneratedAudios(prev => prev.filter(audio => audio.id !== audioId)) }
      ]
    );
  };

  const getVoiceIcon = (voiceId) => {
    const voice = voiceOptions.find(v => v.id === voiceId);
    return voice ? voice.icon : 'mic-outline';
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
            <Text style={[styles.headerTitle, accessibilityStyles]}>Text to Audio</Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              Convert text to spoken audio with AI
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Input Section */}
      <View style={[styles.inputSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Text Input</Text>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={[
              styles.textInput,
              accessibilityStyles,
              { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
            ]}
            placeholder="Enter text to convert to audio..."
            placeholderTextColor={settings.isHighContrast ? '#888' : '#94a3b8'}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            accessibilityLabel="Text to convert"
            accessibilityRole="text"
          />
        </View>

        {/* Voice Settings */}
        <View style={styles.settingsContainer}>
          <Text style={[styles.settingsTitle, accessibilityStyles]}>Voice Settings</Text>
          
          {/* Voice Type Selection */}
          <View style={styles.voiceSelector}>
            <Text style={[styles.selectorLabel, accessibilityStyles]}>Voice Type</Text>
            <View style={styles.voiceOptions}>
              {voiceOptions.map((voice) => (
                <TouchableOpacity
                  key={voice.id}
                  style={[
                    styles.voiceOption,
                    {
                      backgroundColor: voiceType === voice.id ? '#2563eb' : '#f8fafc',
                      borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0'
                    }
                  ]}
                  onPress={() => setVoiceType(voice.id)}
                  accessibilityLabel={`Select ${voice.name} voice`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: voiceType === voice.id }}
                >
                  <Ionicons name={getVoiceIcon(voice.id)} size={20} color={voiceType === voice.id ? '#ffffff' : '#64748b'} />
                  <Text style={[
                    styles.voiceOptionText,
                    accessibilityStyles,
                    { color: voiceType === voice.id ? '#ffffff' : '#64748b' }
                  ]}>
                    {voice.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Speech Rate */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, accessibilityStyles]}>Speech Rate</Text>
              <Text style={[styles.sliderValue, accessibilityStyles]}>{speechRate.toFixed(1)}x</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={speechRate}
              onValueChange={setSpeechRate}
              minimumTrackTintColor="#2563eb"
              maximumTrackTintColor="#e2e8f0"
              thumbTintColor="#2563eb"
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabelText, accessibilityStyles]}>Slow</Text>
              <Text style={[styles.sliderLabelText, accessibilityStyles]}>Normal</Text>
              <Text style={[styles.sliderLabelText, accessibilityStyles]}>Fast</Text>
            </View>
          </View>

          {/* Speech Pitch */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, accessibilityStyles]}>Speech Pitch</Text>
              <Text style={[styles.sliderValue, accessibilityStyles]}>{speechPitch.toFixed(1)}x</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={speechPitch}
              onValueChange={setSpeechPitch}
              minimumTrackTintColor="#2563eb"
              maximumTrackTintColor="#e2e8f0"
              thumbTintColor="#2563eb"
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabelText, accessibilityStyles]}>Low</Text>
              <Text style={[styles.sliderLabelText, accessibilityStyles]}>Normal</Text>
              <Text style={[styles.sliderLabelText, accessibilityStyles]}>High</Text>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            { backgroundColor: text.trim() ? '#2563eb' : '#94a3b8' }
          ]}
          onPress={handleGenerateAudio}
          disabled={!text.trim() || isGenerating}
          accessibilityLabel="Generate Audio"
          accessibilityRole="button"
        >
          {isGenerating ? (
            <Ionicons name="sync-outline" size={20} color="#ffffff" style={styles.spinner} />
          ) : (
            <Ionicons name="play-circle-outline" size={20} color="#ffffff" />
          )}
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Audio'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generated Audios */}
      {generatedAudios.length > 0 && (
        <View style={[styles.historySection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, accessibilityStyles]}>Generated Audio History</Text>
          
          {generatedAudios.map((audio) => (
            <View key={audio.id} style={styles.audioItem}>
              <View style={styles.audioInfo}>
                <Text style={[styles.audioText, accessibilityStyles]} numberOfLines={2}>
                  {audio.text}
                </Text>
                <Text style={[styles.audioMeta, accessibilityStyles]}>
                  {audio.voiceType} • {audio.rate}x speed • {audio.timestamp}
                </Text>
              </View>
              
              <View style={styles.audioActions}>
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => handlePlayAudio(audio)}
                  accessibilityLabel="Play Audio"
                  accessibilityRole="button"
                >
                  <Ionicons name="play-circle-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => handleDownloadAudio(audio)}
                  accessibilityLabel="Download Audio"
                  accessibilityRole="button"
                >
                  <Ionicons name="download-outline" size={24} color="#2563eb" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => handleDeleteAudio(audio.id)}
                  accessibilityLabel="Delete Audio"
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
            Use clear, properly punctuated text for better audio quality
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="headset-outline" size={16} color="#2563eb" />
          <Text style={[styles.tipText, accessibilityStyles]}>
            Adjust speech rate for comfortable listening speed
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="volume-high-outline" size={16} color="#2563eb" />
          <Text style={[styles.tipText, accessibilityStyles]}>
            Choose voice type based on your preference or learning needs
          </Text>
        </View>
      </View>

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode - Audio generation may be limited</Text>
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
  settingsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  voiceSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  voiceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  voiceOption: {
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
  voiceOptionText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  sliderValue: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 10,
    color: '#64748b',
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
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  audioMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  audioActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioButton: {
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

export default TextToAudioScreen;
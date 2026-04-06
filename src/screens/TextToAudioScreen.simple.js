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

const TextToAudioScreen = ({ navigation }) => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('female');
  const [selectedSpeed, setSelectedSpeed] = useState('normal');

  const voices = [
    { id: 'male', name: 'Male Voice', icon: 'man-outline' },
    { id: 'female', name: 'Female Voice', icon: 'woman-outline' },
  ];

  const speeds = [
    { id: 'slow', name: 'Slow', value: '0.75x' },
    { id: 'normal', name: 'Normal', value: '1x' },
    { id: 'fast', name: 'Fast', value: '1.5x' },
  ];

  const handlePlay = () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Text to Audio</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Text Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Enter Text</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Type or paste text here..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={8}
        />
        <Text style={styles.charCount}>{text.length} characters</Text>
      </View>

      {/* Voice Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Voice</Text>
        <View style={styles.optionsRow}>
          {voices.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.optionButton,
                selectedVoice === voice.id && styles.optionButtonSelected
              ]}
              onPress={() => setSelectedVoice(voice.id)}
            >
              <Ionicons 
                name={voice.icon} 
                size={24} 
                color={selectedVoice === voice.id ? '#ffffff' : '#64748b'} 
              />
              <Text style={[
                styles.optionText,
                selectedVoice === voice.id && styles.optionTextSelected
              ]}>
                {voice.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Speed Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Speed</Text>
        <View style={styles.optionsRow}>
          {speeds.map((speed) => (
            <TouchableOpacity
              key={speed.id}
              style={[
                styles.speedButton,
                selectedSpeed === speed.id && styles.speedButtonSelected
              ]}
              onPress={() => setSelectedSpeed(speed.id)}
            >
              <Text style={[
                styles.speedText,
                selectedSpeed === speed.id && styles.speedTextSelected
              ]}>
                {speed.value}
              </Text>
              <Text style={[
                styles.speedLabel,
                selectedSpeed === speed.id && styles.speedLabelSelected
              ]}>
                {speed.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Play Button */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Ionicons 
            name={isPlaying ? "pause-circle" : "play-circle"} 
            size={32} 
            color="#ffffff" 
          />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause Audio' : 'Generate & Play'}
          </Text>
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
    backgroundColor: '#f59e0b',
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
  card: {
    marginHorizontal: 20,
    marginTop: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 150,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  optionButtonSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b',
  },
  optionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 8,
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  speedButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  speedButtonSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b',
  },
  speedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  speedTextSelected: {
    color: '#ffffff',
  },
  speedLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  speedLabelSelected: {
    color: '#ffffff',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 12,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TextToAudioScreen;

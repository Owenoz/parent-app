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

const VideoGeneratorScreen = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('animated');
  const [isGenerating, setIsGenerating] = useState(false);

  const styles_options = [
    { id: 'animated', name: 'Animated', icon: 'color-palette-outline' },
    { id: 'whiteboard', name: 'Whiteboard', icon: 'create-outline' },
    { id: 'presentation', name: 'Presentation', icon: 'easel-outline' },
  ];

  const handleGenerate = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the video you want to create');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert('Success', 'Video generated successfully!');
    }, 3000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Generator</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Description Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Video Description</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe the educational video you want to create..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
        />
      </View>

      {/* Style Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Video Style</Text>
        <View style={styles.stylesContainer}>
          {styles_options.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleButton,
                selectedStyle === style.id && styles.styleButtonSelected
              ]}
              onPress={() => setSelectedStyle(style.id)}
            >
              <Ionicons 
                name={style.icon} 
                size={32} 
                color={selectedStyle === style.id ? '#ffffff' : '#8b5cf6'} 
              />
              <Text style={[
                styles.styleText,
                selectedStyle === style.id && styles.styleTextSelected
              ]}>
                {style.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Generate Button */}
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          <Ionicons 
            name={isGenerating ? "sync" : "videocam"} 
            size={24} 
            color="#ffffff" 
          />
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating Video...' : 'Generate Video'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Placeholder */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.videoPreview}>
          <Ionicons name="play-circle-outline" size={64} color="#8b5cf6" />
          <Text style={styles.previewText}>Video preview will appear here</Text>
        </View>
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
    backgroundColor: '#8b5cf6',
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
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
  },
  stylesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  styleButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  styleButtonSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf6',
  },
  styleText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600',
    marginTop: 8,
  },
  styleTextSelected: {
    color: '#ffffff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9d5ff',
    borderStyle: 'dashed',
  },
  previewText: {
    fontSize: 14,
    color: '#8b5cf6',
    marginTop: 12,
  },
});

export default VideoGeneratorScreen;

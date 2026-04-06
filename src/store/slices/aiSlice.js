import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  aiTools: [],
  aiResponses: [],
  loading: false,
  error: null,
  textToAudio: {
    text: '',
    audioUrl: null,
    isGenerating: false,
    progress: 0,
  },
  videoGenerator: {
    script: '',
    videoUrl: null,
    isGenerating: false,
    progress: 0,
  },
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    fetchAIToolsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAIToolsSuccess: (state, action) => {
      state.loading = false;
      state.aiTools = action.payload;
      state.error = null;
    },
    fetchAIToolsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addAIResponse: (state, action) => {
      state.aiResponses.push(action.payload);
    },
    clearAIResponses: (state) => {
      state.aiResponses = [];
    },
    setTextToAudioText: (state, action) => {
      state.textToAudio.text = action.payload;
    },
    setTextToAudioGenerating: (state, action) => {
      state.textToAudio.isGenerating = action.payload;
    },
    setTextToAudioProgress: (state, action) => {
      state.textToAudio.progress = action.payload;
    },
    setTextToAudioUrl: (state, action) => {
      state.textToAudio.audioUrl = action.payload;
    },
    setVideoGeneratorScript: (state, action) => {
      state.videoGenerator.script = action.payload;
    },
    setVideoGeneratorGenerating: (state, action) => {
      state.videoGenerator.isGenerating = action.payload;
    },
    setVideoGeneratorProgress: (state, action) => {
      state.videoGenerator.progress = action.payload;
    },
    setVideoGeneratorUrl: (state, action) => {
      state.videoGenerator.videoUrl = action.payload;
    },
    resetAITools: (state) => {
      state.aiTools = [];
      state.aiResponses = [];
      state.loading = false;
      state.error = null;
      state.textToAudio = {
        text: '',
        audioUrl: null,
        isGenerating: false,
        progress: 0,
      };
      state.videoGenerator = {
        script: '',
        videoUrl: null,
        isGenerating: false,
        progress: 0,
      };
    },
  },
});

export const {
  fetchAIToolsStart,
  fetchAIToolsSuccess,
  fetchAIToolsFailure,
  addAIResponse,
  clearAIResponses,
  setTextToAudioText,
  setTextToAudioGenerating,
  setTextToAudioProgress,
  setTextToAudioUrl,
  setVideoGeneratorScript,
  setVideoGeneratorGenerating,
  setVideoGeneratorProgress,
  setVideoGeneratorUrl,
  resetAITools,
} = aiSlice.actions;

export default aiSlice.reducer;
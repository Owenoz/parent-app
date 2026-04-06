import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assessmentsService from '../../services/assessments.service';

const initialState = {
  assessments: [],
  selectedAssessment: null,
  submissions: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAssessments = createAsyncThunk(
  'assessments/fetch',
  async ({ courseId, type }, { rejectWithValue }) => {
    try {
      const result = await assessmentsService.getAssessments(courseId, type);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAssessmentDetails = createAsyncThunk(
  'assessments/fetchDetails',
  async (assessmentId, { rejectWithValue }) => {
    try {
      const result = await assessmentsService.getAssessmentDetails(assessmentId);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startAssessment = createAsyncThunk(
  'assessments/start',
  async (assessmentId, { rejectWithValue }) => {
    try {
      const result = await assessmentsService.startAssessment(assessmentId);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitAssessment = createAsyncThunk(
  'assessments/submit',
  async ({ assessmentId, submission }, { rejectWithValue }) => {
    try {
      const result = await assessmentsService.submitAssessment(assessmentId, submission);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMySubmissions = createAsyncThunk(
  'assessments/fetchSubmissions',
  async (courseId, { rejectWithValue }) => {
    try {
      const result = await assessmentsService.getMySubmissions(courseId);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    selectAssessment: (state, action) => {
      state.selectedAssessment = action.payload;
    },
    clearAssessment: (state) => {
      state.selectedAssessment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assessments
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch assessment details
      .addCase(fetchAssessmentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAssessment = action.payload;
      })
      .addCase(fetchAssessmentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Start assessment
      .addCase(startAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAssessment = action.payload;
      })
      .addCase(startAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit assessment
      .addCase(submitAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions.push(action.payload);
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch submissions
      .addCase(fetchMySubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectAssessment,
  clearAssessment,
  clearError,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
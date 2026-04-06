import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import coursesService from '../../services/courses.service';

const initialState = {
  courses: [],
  enrollments: [],
  selectedCourse: null,
  loading: false,
  error: null,
  meta: {}
};

// Async Thunks
export const fetchPublicCourses = createAsyncThunk(
  'courses/fetchPublic',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await coursesService.getPublicCourses(params);
      if (result.success) {
        return { data: result.data, meta: result.meta };
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchDetails',
  async (courseId, { rejectWithValue }) => {
    try {
      const result = await coursesService.getCourseDetails(courseId);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const result = await coursesService.enrollInCourse(courseId);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyEnrollments = createAsyncThunk(
  'courses/fetchEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const result = await coursesService.getMyEnrollments();
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCourses = createAsyncThunk(
  'courses/search',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const result = await coursesService.searchCourses(query, filters);
      if (result.success) {
        return { data: result.data, meta: result.meta };
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    selectCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    clearCourse: (state) => {
      state.selectedCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch public courses
      .addCase(fetchPublicCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPublicCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch course details
      .addCase(fetchCourseDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Enroll in course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload);
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch enrollments
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search courses
      .addCase(searchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectCourse,
  clearCourse,
  clearError,
} = courseSlice.actions;

export default courseSlice.reducer;
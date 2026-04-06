/**
 * Services Index
 * Central export for all API services
 */

import api from './api';
import coursesService from './courses.service';
import contentService from './content.service';
import assessmentsService from './assessments.service';
import certificatesService from './certificates.service';
import progressService from './progress.service';
import notificationsService from './notifications.service';
import profileService from './profile.service';

export {
  api,
  coursesService,
  contentService,
  assessmentsService,
  certificatesService,
  progressService,
  notificationsService,
  profileService
};

// Default export
export default {
  api,
  courses: coursesService,
  content: contentService,
  assessments: assessmentsService,
  certificates: certificatesService,
  progress: progressService,
  notifications: notificationsService,
  profile: profileService
};

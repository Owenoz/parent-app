import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import certificatesService from '../services/certificates.service';

const CertificateScreen = ({ navigation, route }) => {
  const { certificateId } = route.params || {};
  const { user, selectedChildId } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [certificate, setCertificate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(!!certificateId);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    if (certificateId) {
      loadCertificateDetails(certificateId);
    } else {
      loadCertificates();
    }
  }, [certificateId]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const result = await certificatesService.getMyCertificates();
      
      if (result.success) {
        setCertificates(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load certificates');
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      Alert.alert('Error', 'Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCertificateDetails = async (id) => {
    try {
      setIsLoading(true);
      const result = await certificatesService.getCertificateDetails(id);
      
      if (result.success) {
        setCertificate(result.data);
        setSelectedCertificate(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load certificate');
      }
    } catch (error) {
      console.error('Error loading certificate:', error);
      Alert.alert('Error', 'Failed to load certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareCertificate = async (cert) => {
    try {
      const shareMessage = `I've earned a ${cert.title} certificate from ${cert.institution}! Check out my achievement.`;
      
      await Share.share({
        message: shareMessage,
        title: 'My Certificate Achievement',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share certificate');
    }
  };

  const handleDownloadCertificate = (cert) => {
    Alert.alert('Download', `Downloading ${cert.title} certificate...`);
  };

  const getCertificateColor = (type) => {
    switch (type) {
      case 'bronze': return ['#f59e0b', '#d97706'];
      case 'silver': return ['#94a3b8', '#64748b'];
      case 'gold': return ['#fbbf24', '#f59e0b'];
      case 'platinum': return ['#06b6d4', '#0891b2'];
      default: return ['#2563eb', '#1e40af'];
    }
  };

  const getCertificateIcon = (type) => {
    switch (type) {
      case 'bronze': return 'medal-outline';
      case 'silver': return 'medal-outline';
      case 'gold': return 'medal-outline';
      case 'platinum': return 'star-outline';
      default: return 'school-outline';
    }
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const accessibilityStyles = getAccessibilityStyles();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}>
        <LinearGradient
          colors={settings.isHighContrast ? ['#ffffff', '#ffffff'] : ['#2563eb', '#1e40af']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, accessibilityStyles]}>Certificates</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <Ionicons name="certificate-outline" size={48} color="#64748b" />
          <Text style={[styles.loadingText, accessibilityStyles]}>Loading certificates...</Text>
        </View>
      </View>
    );
  }

  if (isViewingDetails && selectedCertificate) {
    return (
      <View style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}>
        {/* Header */}
        <LinearGradient
          colors={getCertificateColor(selectedCertificate.type)}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => {
              setIsViewingDetails(false);
              setSelectedCertificate(null);
            }}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, accessibilityStyles]}>Certificate</Text>
            <TouchableOpacity style={styles.shareButton} onPress={() => handleShareCertificate(selectedCertificate)}>
              <Ionicons name="share-social-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Certificate Details */}
        <ScrollView style={styles.certificateContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.certificateCard, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            {/* Certificate Header */}
            <View style={styles.certificateHeader}>
              <Ionicons name={getCertificateIcon(selectedCertificate.type)} size={64} color="#ffffff" />
              <Text style={styles.certificateType}>{selectedCertificate.type.toUpperCase()}</Text>
            </View>

            {/* Certificate Content */}
            <View style={styles.certificateContent}>
              <Text style={[styles.certificateTitle, accessibilityStyles]}>
                {selectedCertificate.title}
              </Text>
              
              <Text style={[styles.certificateSubtitle, accessibilityStyles]}>
                {selectedCertificate.description}
              </Text>

              <View style={styles.certificateMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="school-outline" size={16} color="#64748b" />
                  <Text style={[styles.metaText, accessibilityStyles]}>{selectedCertificate.institution}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#64748b" />
                  <Text style={[styles.metaText, accessibilityStyles]}>
                    Awarded: {formatDateString(selectedCertificate.dateAwarded)}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="star-outline" size={16} color="#64748b" />
                  <Text style={[styles.metaText, accessibilityStyles]}>
                    Score: {selectedCertificate.score}/{selectedCertificate.maxScore}
                  </Text>
                </View>
              </View>

              {/* Certificate Body */}
              <View style={styles.certificateBody}>
                <Text style={[styles.certificateBodyText, accessibilityStyles]}>
                  This is to certify that
                </Text>
                <Text style={[styles.certificateName, accessibilityStyles]}>
                  {selectedCertificate.studentName}
                </Text>
                <Text style={[styles.certificateBodyText, accessibilityStyles]}>
                  has successfully completed the course
                </Text>
                <Text style={[styles.certificateCourse, accessibilityStyles]}>
                  {selectedCertificate.courseTitle}
                </Text>
                <Text style={[styles.certificateBodyText, accessibilityStyles]}>
                  and demonstrated proficiency in the subject matter.
                </Text>
              </View>

              {/* Signature Section */}
              <View style={styles.signatureSection}>
                <View style={styles.signatureLine}>
                  <Text style={[styles.signatureLabel, accessibilityStyles]}>Instructor Signature</Text>
                  <View style={styles.signaturePlaceholder} />
                </View>
                
                <View style={styles.signatureLine}>
                  <Text style={[styles.signatureLabel, accessibilityStyles]}>Director</Text>
                  <View style={styles.signaturePlaceholder} />
                </View>
              </View>

              {/* Certificate ID */}
              <View style={styles.certificateIdContainer}>
                <Text style={[styles.certificateIdLabel, accessibilityStyles]}>Certificate ID</Text>
                <Text style={[styles.certificateId, accessibilityStyles]}>{selectedCertificate.id}</Text>
                <Text style={[styles.certificateIdNote, accessibilityStyles]}>
                  This certificate can be verified at {selectedCertificate.verificationUrl}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actionsContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDownloadCertificate(selectedCertificate)}
              accessibilityLabel="Download Certificate"
              accessibilityRole="button"
            >
              <Ionicons name="download-outline" size={20} color="#2563eb" />
              <Text style={[styles.actionButtonText, accessibilityStyles]}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShareCertificate(selectedCertificate)}
              accessibilityLabel="Share Certificate"
              accessibilityRole="button"
            >
              <Ionicons name="share-social-outline" size={20} color="#2563eb" />
              <Text style={[styles.actionButtonText, accessibilityStyles]}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setIsViewingDetails(false);
                setSelectedCertificate(null);
              }}
              accessibilityLabel="Back to Certificates"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={20} color="#2563eb" />
              <Text style={[styles.actionButtonText, accessibilityStyles]}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Offline Indicator */}
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="wifi-outline" size={16} color="#ef4444" />
            <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
          </View>
        )}
      </View>
    );
  }

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
          <Text style={[styles.headerTitle, accessibilityStyles]}>My Certificates</Text>
        </View>
      </LinearGradient>

      {/* Empty State */}
      {certificates.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          <Ionicons name="trophy-outline" size={64} color="#94a3b8" />
          <Text style={[styles.emptyTitle, accessibilityStyles]}>No Certificates Yet</Text>
          <Text style={[styles.emptySubtitle, accessibilityStyles]}>
            Complete courses and assessments to earn certificates
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Courses')}
            accessibilityLabel="Explore Courses"
            accessibilityRole="button"
          >
            <Text style={styles.exploreButtonText}>Explore Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View style={[styles.summaryContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.summaryTitle, accessibilityStyles]}>Achievement Summary</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Ionicons name="medal-outline" size={24} color="#f59e0b" />
                <Text style={[styles.statValue, accessibilityStyles]}>
                  {certificates.filter(c => c.type === 'bronze').length}
                </Text>
                <Text style={[styles.statLabel, accessibilityStyles]}>Bronze</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="medal-outline" size={24} color="#94a3b8" />
                <Text style={[styles.statValue, accessibilityStyles]}>
                  {certificates.filter(c => c.type === 'silver').length}
                </Text>
                <Text style={[styles.statLabel, accessibilityStyles]}>Silver</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="medal-outline" size={24} color="#fbbf24" />
                <Text style={[styles.statValue, accessibilityStyles]}>
                  {certificates.filter(c => c.type === 'gold').length}
                </Text>
                <Text style={[styles.statLabel, accessibilityStyles]}>Gold</Text>
              </View>
            </View>
          </View>

          {/* Certificates List */}
          <View style={[styles.certificatesContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.certificatesTitle, accessibilityStyles]}>Recent Certificates</Text>
            
            {certificates.map((certificate) => (
              <TouchableOpacity
                key={certificate.id}
                style={[
                  styles.certificateCard,
                  { backgroundColor: settings.isHighContrast ? '#333333' : '#ffffff' }
                ]}
                onPress={() => {
                  setSelectedCertificate(certificate);
                  setIsViewingDetails(true);
                }}
                accessibilityLabel={`View ${certificate.title} certificate`}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={getCertificateColor(certificate.type)}
                  style={styles.certificateGradient}
                >
                  <View style={styles.certificatePreview}>
                    <Ionicons name={getCertificateIcon(certificate.type)} size={32} color="#ffffff" />
                    <Text style={styles.certificatePreviewTitle}>{certificate.title}</Text>
                    <Text style={styles.certificatePreviewDate}>
                      {formatDateString(certificate.dateAwarded)}
                    </Text>
                  </View>
                  
                  <View style={styles.certificatePreviewDetails}>
                    <Text style={styles.certificatePreviewType}>{certificate.type.toUpperCase()}</Text>
                    <Text style={styles.certificatePreviewScore}>
                      {certificate.score}/{certificate.maxScore} points
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  shareButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  certificateContainer: {
    flex: 1,
  },
  certificateCard: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certificateGradient: {
    borderRadius: 16,
    padding: 20,
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  certificateType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  certificateContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: -20,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  certificateSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  certificateMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  certificateBody: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  certificateBodyText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 4,
  },
  certificateName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
    marginVertical: 8,
    textTransform: 'uppercase',
  },
  certificateCourse: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 4,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  signatureLine: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  signatureLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  signaturePlaceholder: {
    width: '80%',
    height: 2,
    backgroundColor: '#e2e8f0',
  },
  certificateIdContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  certificateIdLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  certificateId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  certificateIdNote: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  certificatesContainer: {
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
  certificatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  certificatePreview: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  certificatePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  certificatePreviewDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  certificatePreviewDetails: {
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  certificatePreviewType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  certificatePreviewScore: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
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

export default CertificateScreen;
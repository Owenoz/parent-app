import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CertificateScreen = ({ navigation, route }) => {
  const courseId = route?.params?.courseId || 1;

  const certificate = {
    id: 1,
    courseName: 'Introduction to Physics',
    studentName: 'John Doe',
    completionDate: '2026-03-15',
    instructor: 'Dr. Smith',
    grade: 'A',
    certificateNumber: 'CERT-2026-001234',
  };

  const handleDownload = () => {
    Alert.alert('Success', 'Certificate downloaded successfully!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share certificate via email or social media');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificate</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Certificate Card */}
      <View style={styles.certificateCard}>
        <View style={styles.certificateBorder}>
          <View style={styles.certificateHeader}>
            <Ionicons name="ribbon" size={48} color="#f59e0b" />
            <Text style={styles.certificateTitle}>Certificate of Completion</Text>
          </View>

          <View style={styles.certificateBody}>
            <Text style={styles.certText}>This is to certify that</Text>
            <Text style={styles.studentName}>{certificate.studentName}</Text>
            <Text style={styles.certText}>has successfully completed</Text>
            <Text style={styles.courseName}>{certificate.courseName}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Completion Date:</Text>
                <Text style={styles.detailValue}>{certificate.completionDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Instructor:</Text>
                <Text style={styles.detailValue}>{certificate.instructor}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Grade:</Text>
                <Text style={styles.detailValue}>{certificate.grade}</Text>
              </View>
            </View>

            <Text style={styles.certificateNumber}>
              Certificate No: {certificate.certificateNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Download PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#2563eb" />
          <Text style={styles.actionButtonSecondaryText}>Share</Text>
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
  certificateCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  certificateBorder: {
    borderWidth: 3,
    borderColor: '#f59e0b',
    borderRadius: 16,
    padding: 24,
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  certificateBody: {
    alignItems: 'center',
  },
  certText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  courseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  certificateNumber: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  actionButtonSecondaryText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CertificateScreen;

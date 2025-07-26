import { TechUpdate, EmailNotificationLog } from '../firebase/techUpdates';
import { User } from '../types/User';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Email service configuration
interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

// EmailJS configuration (you'll need to set up EmailJS account)
const EMAIL_CONFIG: EmailConfig = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id',
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id',
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

// Email template for tech updates
interface EmailTemplate {
  to_email: string;
  to_name: string;
  subject: string;
  update_title: string;
  update_summary: string;
  update_content: string;
  update_category: string;
  update_priority: string;
  created_by: string;
  created_date: string;
  dashboard_link: string;
  unsubscribe_link?: string;
}

// Initialize EmailJS (you'll need to install emailjs-com: npm install emailjs-com)
let emailjs: any = null;

try {
  // Dynamically import EmailJS to avoid build errors if not installed
  emailjs = require('emailjs-com');
} catch (error) {
  console.warn('EmailJS not installed. Email notifications will be logged but not sent.');
}

// Send email notification for tech update
export const sendTechUpdateEmail = async (
  user: User,
  update: TechUpdate
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`📧 Preparing to send email notification to ${user.email} for update: ${update.title}`);

    // Prepare email template data
    const templateData: EmailTemplate = {
      to_email: user.email,
      to_name: user.name,
      subject: `[Tech Update] ${update.title}`,
      update_title: update.title,
      update_summary: update.summary,
      update_content: update.content.substring(0, 500) + (update.content.length > 500 ? '...' : ''),
      update_category: update.category,
      update_priority: update.priority,
      created_by: update.createdByName,
      created_date: new Date(update.createdAt).toLocaleDateString(),
      dashboard_link: `${window.location.origin}/dashboard`,
      unsubscribe_link: `${window.location.origin}/unsubscribe?user=${user._id}`
    };

    let emailResult = { success: false, message: 'Email service not configured' };

    // Send email using EmailJS if available
    if (emailjs && EMAIL_CONFIG.serviceId !== 'your_service_id') {
      try {
        await emailjs.send(
          EMAIL_CONFIG.serviceId,
          EMAIL_CONFIG.templateId,
          templateData,
          EMAIL_CONFIG.publicKey
        );
        emailResult = { success: true, message: 'Email sent successfully' };
        console.log(`✅ Email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error('❌ EmailJS error:', emailError);
        emailResult = { 
          success: false, 
          message: `EmailJS error: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` 
        };
      }
    } else {
      // Simulate email sending for development/demo
      console.log('📧 Email simulation - would send to:', user.email);
      console.log('📧 Email content:', templateData);
      emailResult = { success: true, message: 'Email simulated successfully (EmailJS not configured)' };
    }

    // Log email attempt to Firebase
    const emailLog: Omit<EmailNotificationLog, 'id'> = {
      updateId: update.id,
      recipientEmail: user.email,
      recipientName: user.name,
      sentAt: new Date().toISOString(),
      status: emailResult.success ? 'sent' : 'failed',
      errorMessage: emailResult.success ? undefined : emailResult.message
    };

    try {
      await addDoc(collection(db, 'emailNotificationLogs'), emailLog);
      console.log('📝 Email log saved to Firebase');
    } catch (logError) {
      console.error('❌ Error saving email log:', logError);
    }

    return emailResult;
  } catch (error) {
    console.error('❌ Error in sendTechUpdateEmail:', error);
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Send bulk email notifications
export const sendBulkTechUpdateEmails = async (
  users: User[],
  update: TechUpdate,
  onProgress?: (sent: number, total: number) => void
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> => {
  console.log(`📧 Starting bulk email send for ${users.length} users`);
  
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Filter users based on target audience
  const targetUsers = users.filter(user => {
    if (update.targetAudience === 'all') return true;
    if (update.targetAudience === 'students' && user.role === 'student') return true;
    if (update.targetAudience === 'faculty' && user.role === 'faculty') return true;
    if (update.targetAudience === 'admin' && user.role === 'admin') return true;
    return false;
  });

  console.log(`📧 Filtered to ${targetUsers.length} target users`);

  // Send emails with delay to avoid rate limiting
  for (let i = 0; i < targetUsers.length; i++) {
    const user = targetUsers[i];
    
    try {
      const result = await sendTechUpdateEmail(user, update);
      
      if (result.success) {
        sent++;
        console.log(`✅ Email ${i + 1}/${targetUsers.length} sent to ${user.email}`);
      } else {
        failed++;
        errors.push(`${user.email}: ${result.message}`);
        console.log(`❌ Email ${i + 1}/${targetUsers.length} failed for ${user.email}: ${result.message}`);
      }
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${user.email}: ${errorMessage}`);
      console.error(`❌ Email ${i + 1}/${targetUsers.length} error for ${user.email}:`, error);
    }

    // Report progress
    if (onProgress) {
      onProgress(sent, targetUsers.length);
    }

    // Add delay between emails to avoid rate limiting (adjust as needed)
    if (i < targetUsers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  console.log(`📧 Bulk email send completed: ${sent} sent, ${failed} failed`);

  return {
    success: sent > 0,
    sent,
    failed,
    errors
  };
};

// Email template for testing
export const sendTestEmail = async (
  recipientEmail: string,
  recipientName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const testUpdate: Partial<TechUpdate> = {
      id: 'test-update',
      title: 'Test Tech Update',
      summary: 'This is a test email notification for tech updates.',
      content: 'This is a test email to verify that the email notification system is working correctly. If you receive this email, the system is functioning properly.',
      category: 'general',
      priority: 'low',
      createdByName: 'System Administrator',
      createdAt: new Date().toISOString()
    };

    const testUser: Partial<User> = {
      _id: 'test-user',
      email: recipientEmail,
      name: recipientName,
      role: 'student'
    };

    return await sendTechUpdateEmail(testUser as User, testUpdate as TechUpdate);
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return {
      success: false,
      message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get email notification statistics
export const getEmailStats = async (): Promise<{
  totalSent: number;
  totalFailed: number;
  recentLogs: EmailNotificationLog[];
}> => {
  try {
    // This would typically query the emailNotificationLogs collection
    // For now, return mock data
    return {
      totalSent: 0,
      totalFailed: 0,
      recentLogs: []
    };
  } catch (error) {
    console.error('❌ Error fetching email stats:', error);
    return {
      totalSent: 0,
      totalFailed: 0,
      recentLogs: []
    };
  }
};

// Validate email configuration
export const validateEmailConfig = (): { isValid: boolean; message: string } => {
  if (!emailjs) {
    return {
      isValid: false,
      message: 'EmailJS library not installed. Run: npm install emailjs-com'
    };
  }

  if (EMAIL_CONFIG.serviceId === 'your_service_id' || 
      EMAIL_CONFIG.templateId === 'your_template_id' || 
      EMAIL_CONFIG.publicKey === 'your_public_key') {
    return {
      isValid: false,
      message: 'EmailJS not configured. Please set up environment variables: REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, REACT_APP_EMAILJS_PUBLIC_KEY'
    };
  }

  return {
    isValid: true,
    message: 'Email configuration is valid'
  };
};

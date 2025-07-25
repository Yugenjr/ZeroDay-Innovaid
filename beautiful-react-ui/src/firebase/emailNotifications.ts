// @ts-ignore
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import { TechEvent } from './techEvents';
import { createTechEventNotification } from './notifications';
import emailjs from '@emailjs/browser';

// EmailJS configuration - Replace with your actual EmailJS credentials
const EMAIL_SERVICE_ID = 'service_innovaid'; // Your EmailJS service ID
const EMAIL_TEMPLATE_ID = 'template_tech_event'; // Your EmailJS template ID
const EMAIL_PUBLIC_KEY = 'your_public_key_here'; // Your EmailJS public key

// Enable/disable email service (set to true when EmailJS is configured)
const EMAIL_SERVICE_ENABLED = true; // Set to true to enable real email sending

/*
📧 EMAILJS SETUP INSTRUCTIONS:

1. Go to https://www.emailjs.com/ and create an account
2. Create a new service (Gmail, Outlook, etc.)
3. Create a new email template with these variables:
   - {{to_email}} - Recipient email
   - {{to_name}} - Recipient name
   - {{event_title}} - Event title
   - {{event_type}} - Event type (Hackathon, Internship, etc.)
   - {{event_details}} - Event description
   - {{event_date}} - Event date and time
   - {{event_venue}} - Event venue
   - {{event_place}} - Event location
   - {{event_requirements}} - Event requirements
   - {{registration_link}} - Registration URL
   - {{deadline}} - Registration deadline
   - {{department}} - Student department
   - {{year}} - Student year

4. Sample Email Template:
   Subject: New {{event_type}}: {{event_title}}

   Dear {{to_name}},

   We're excited to announce a new {{event_type}}:

   📅 Event: {{event_title}}
   📍 Venue: {{event_venue}}, {{event_place}}
   🗓️ Date: {{event_date}}
   🎓 Department: {{department}} | Year: {{year}}

   📋 Details:
   {{event_details}}

   🎯 Requirements:
   {{event_requirements}}

   🔗 Registration: {{registration_link}}
   ⏰ Deadline: {{deadline}}

   Best regards,
   InnovAid Team

5. Update the constants above with your actual values
6. Set EMAIL_SERVICE_ENABLED to true
*/

interface EmailData {
  to_email: string;
  to_name: string;
  event_title: string;
  event_details: string;
  event_date: string;
  event_venue: string;
  event_place: string;
  event_type: string;
  event_requirements: string;
  registration_link?: string;
  deadline?: string;
  department?: string;
  year?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

interface BulkEmailResult {
  success: number;
  failed: number;
  total: number;
  errors: string[];
}

// Initialize EmailJS (call this once in your app)
export const initializeEmailJS = () => {
  if (EMAIL_SERVICE_ENABLED && EMAIL_PUBLIC_KEY !== 'your_public_key_here') {
    emailjs.init(EMAIL_PUBLIC_KEY);
    console.log('✅ EmailJS initialized successfully');
  } else {
    console.log('⚠️ EmailJS not configured - using fallback notifications');
  }
};

// Get all registered users for email notifications
export const getAllRegisteredUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'user') // Only send to regular users, not admins
    );

    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        department: data.department || 'Unknown',
        year: data.year || 'Unknown',
        studentId: data.studentId || 'Unknown'
      };
    });
  } catch (error) {
    console.error('Error fetching registered users:', error);
    throw error;
  }
};

// Send email notification using EmailJS with timeout
export const sendEmailNotification = async (emailData: EmailData): Promise<EmailResult> => {
  if (!EMAIL_SERVICE_ENABLED || EMAIL_PUBLIC_KEY === 'your_public_key_here') {
    // Fallback: Show browser notification instead of email
    console.log('📧 Email notification (simulated):', emailData.to_email, emailData.event_title);

    // Show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New ${emailData.event_type}: ${emailData.event_title}`, {
        body: `📅 ${emailData.event_date}\n📍 ${emailData.event_venue}`,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }

    // Add small delay to simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true }; // Simulate success for demo purposes
  }

  try {
    console.log('📧 Sending email to:', emailData.to_email);

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 10000); // 10 second timeout
    });

    // Use EmailJS browser SDK with timeout
    const emailPromise = emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        event_title: emailData.event_title,
        event_type: emailData.event_type,
        event_details: emailData.event_details,
        event_date: emailData.event_date,
        event_venue: emailData.event_venue,
        event_place: emailData.event_place,
        event_requirements: emailData.event_requirements,
        registration_link: emailData.registration_link || 'Not provided',
        deadline: emailData.deadline || 'Not specified',
        department: emailData.department || 'Unknown',
        year: emailData.year || 'Unknown'
      }
    );

    const response = await Promise.race([emailPromise, timeoutPromise]);
    console.log('✅ Email sent successfully to:', emailData.to_email, response);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending email to:', emailData.to_email, error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Send bulk email notifications to all registered users
export const sendBulkEmailNotifications = async (techEvent: TechEvent): Promise<BulkEmailResult> => {
  try {
    const users = await getAllRegisteredUsers();
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    console.log(`📧 Sending email notifications to ${users.length} users for event: ${techEvent.title}`);

    // Send emails in batches to avoid overwhelming the service
    const batchSize = 3; // Small batch size for better reliability and speed
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      const batchPromises = batch.map(async (user) => {
        const emailData: EmailData = {
          to_email: user.email,
          to_name: user.name,
          event_title: techEvent.title,
          event_details: techEvent.details,
          event_date: techEvent.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          event_venue: techEvent.venue,
          event_place: techEvent.place,
          event_type: techEvent.type.charAt(0).toUpperCase() + techEvent.type.slice(1),
          event_requirements: techEvent.requirements,
          registration_link: techEvent.registrationLink || '',
          deadline: techEvent.deadline ? techEvent.deadline.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '',
          department: user.department,
          year: user.year.toString()
        };

        const result = await sendEmailNotification(emailData);
        return { user: user.email, result };
      });

      const batchResults = await Promise.all(batchPromises);

      // Process results
      batchResults.forEach(({ user, result }) => {
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
          errors.push(`${user}: ${result.error || 'Unknown error'}`);
        }
      });

      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay for faster processing
      }
    }

    console.log(`📧 Email notifications completed: ${successCount} successful, ${failedCount} failed`);

    return {
      success: successCount,
      failed: failedCount,
      total: users.length,
      errors
    };
  } catch (error) {
    console.error('❌ Error sending bulk email notifications:', error);
    throw error;
  }
};

// Fast notification system: Create database notification immediately, send emails in background
export const sendFastNotifications = async (techEvent: TechEvent): Promise<{
  notificationResult: { success: boolean; notificationId?: string; error?: string };
}> => {
  try {
    console.log('🚀 Starting fast notification process for:', techEvent.title);

    // Step 1: Create database notification for all users (fast)
    console.log('📊 Creating database notification...');
    let notificationResult;
    try {
      const notificationId = await createTechEventNotification(techEvent);
      notificationResult = { success: true, notificationId };
      console.log('✅ Database notification created:', notificationId);
    } catch (notificationError) {
      console.error('❌ Failed to create database notification:', notificationError);
      notificationResult = {
        success: false,
        error: notificationError instanceof Error ? notificationError.message : 'Unknown error'
      };
    }

    // Step 2: Send email notifications in background (don't wait)
    console.log('📧 Starting email notifications in background...');
    sendBulkEmailNotifications(techEvent)
      .then((emailResult) => {
        console.log('✅ Background email notifications completed:');
        console.log(`📧 Email notifications: ${emailResult.success}/${emailResult.total} successful`);
        if (emailResult.failed > 0) {
          console.warn('⚠️ Some email notifications failed:', emailResult.errors);
        }
      })
      .catch((emailError) => {
        console.error('❌ Background email notifications failed:', emailError);
      });

    console.log('🎉 Fast notification process completed! Emails are being sent in background.');

    return {
      notificationResult
    };
  } catch (error) {
    console.error('❌ Error in fast notification process:', error);
    throw error;
  }
};

// Complete notification system: Send emails AND create database notifications (slower but complete)
export const sendCompleteNotifications = async (techEvent: TechEvent): Promise<{
  emailResult: BulkEmailResult;
  notificationResult: { success: boolean; notificationId?: string; error?: string };
}> => {
  try {
    console.log('🚀 Starting complete notification process for:', techEvent.title);

    // Step 1: Create database notification for all users
    console.log('📊 Creating database notification...');
    let notificationResult;
    try {
      const notificationId = await createTechEventNotification(techEvent);
      notificationResult = { success: true, notificationId };
      console.log('✅ Database notification created:', notificationId);
    } catch (notificationError) {
      console.error('❌ Failed to create database notification:', notificationError);
      notificationResult = {
        success: false,
        error: notificationError instanceof Error ? notificationError.message : 'Unknown error'
      };
    }

    // Step 2: Send email notifications to all users
    console.log('📧 Sending email notifications...');
    const emailResult = await sendBulkEmailNotifications(techEvent);

    console.log('🎉 Complete notification process finished!');
    console.log(`📊 Database notification: ${notificationResult.success ? 'Success' : 'Failed'}`);
    console.log(`📧 Email notifications: ${emailResult.success}/${emailResult.total} successful`);

    return {
      emailResult,
      notificationResult
    };
  } catch (error) {
    console.error('❌ Error in complete notification process:', error);
    throw error;
  }
};

// Alternative: Simple email notification using mailto (fallback)
export const sendSimpleEmailNotification = (techEvent: TechEvent, userEmail: string) => {
  const subject = `New ${techEvent.type.charAt(0).toUpperCase() + techEvent.type.slice(1)}: ${techEvent.title}`;
  const body = `
Dear Student,

We're excited to announce a new ${techEvent.type}:

📅 Event: ${techEvent.title}
📍 Venue: ${techEvent.venue}, ${techEvent.place}
🗓️ Date: ${techEvent.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}

📋 Details:
${techEvent.details}

🎯 Requirements:
${techEvent.requirements}

${techEvent.registrationLink ? `🔗 Registration Link: ${techEvent.registrationLink}` : ''}
${techEvent.deadline ? `⏰ Registration Deadline: ${techEvent.deadline.toLocaleDateString()}` : ''}

Don't miss this opportunity to enhance your skills and network with industry professionals!

Best regards,
InnovAid Team
  `.trim();

  const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
};

// Email template for EmailJS (to be configured in EmailJS dashboard)
export const EMAIL_TEMPLATE_HTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .event-type { background: #4CAF50; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; display: inline-block; margin-bottom: 10px; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .btn { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 InnovAid</h1>
            <h2>New Tech Opportunity!</h2>
        </div>
        <div class="content">
            <div class="event-type">{{event_type}}</div>
            <h2>{{event_title}}</h2>
            
            <div class="details">
                <p><strong>📅 Date:</strong> {{event_date}}</p>
                <p><strong>📍 Venue:</strong> {{event_venue}}, {{event_place}}</p>
                {{#deadline}}<p><strong>⏰ Deadline:</strong> {{deadline}}</p>{{/deadline}}
            </div>
            
            <div class="details">
                <h3>📋 Event Details:</h3>
                <p>{{event_details}}</p>
            </div>
            
            <div class="details">
                <h3>🎯 Requirements:</h3>
                <p>{{event_requirements}}</p>
            </div>
            
            {{#registration_link}}
            <a href="{{registration_link}}" class="btn">Register Now</a>
            {{/registration_link}}
        </div>
        <div class="footer">
            <p>This email was sent to {{to_email}} because you are registered with InnovAid.</p>
            <p>© 2024 InnovAid. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Instructions for setting up EmailJS
export const EMAILJS_SETUP_INSTRUCTIONS = `
To set up email notifications:

1. Create an account at https://www.emailjs.com/
2. Create a new email service (Gmail, Outlook, etc.)
3. Create a new email template with the provided HTML template
4. Update the configuration constants in this file:
   - SERVICE_ID: Your EmailJS service ID
   - TEMPLATE_ID: Your EmailJS template ID  
   - PUBLIC_KEY: Your EmailJS public key
5. Configure your email template with the following variables:
   - {{to_email}}, {{to_name}}, {{event_title}}, {{event_details}}
   - {{event_date}}, {{event_venue}}, {{event_place}}, {{event_type}}
   - {{event_requirements}}, {{registration_link}}, {{deadline}}
`;

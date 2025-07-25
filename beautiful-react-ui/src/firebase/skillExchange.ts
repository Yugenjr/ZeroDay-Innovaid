// @ts-ignore
import { ref as dbRef, push, set, get, update, remove, onValue, off } from 'firebase/database';
// @ts-ignore
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// @ts-ignore
import { realtimeDb, storage } from './config';

export interface SkillCourse {
  id?: string;
  title: string;
  description: string;
  techStack: string[];
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  instructorDepartment?: string;
  instructorYear?: number;
  instructorPhone?: string;
  dateTime: string;
  duration: number; // in minutes
  maxLearners: number;
  registrationDeadline: string;
  meetLink: string;
  promoVideoUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registeredStudents: string[]; // array of student IDs
  createdAt: string;
  updatedAt: string;
  category: string;
  prerequisites?: string;
  learningOutcomes?: string[];
}

export interface CourseRegistration {
  id?: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  registrationDate: string;
  status: 'registered' | 'attended' | 'missed' | 'cancelled';
  feedback?: string;
  rating?: number;
}

// Create a new skill course
export const createSkillCourse = async (courseData: Omit<SkillCourse, 'id' | 'createdAt' | 'updatedAt' | 'registeredStudents'>) => {
  try {
    const coursesRef = dbRef(realtimeDb, 'skillCourses');
    const newCourseRef = push(coursesRef);
    
    const course: SkillCourse = {
      ...courseData,
      id: newCourseRef.key!,
      registeredStudents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(newCourseRef, course);
    console.log('✅ Skill course created successfully:', newCourseRef.key);

    return {
      success: true,
      message: 'Course created successfully',
      courseId: newCourseRef.key
    };
  } catch (error: any) {
    console.error('❌ Error creating skill course:', error);
    return {
      success: false,
      message: error.message || 'Failed to create course'
    };
  }
};

// Upload promo video
export const uploadPromoVideo = async (courseId: string, videoFile: File) => {
  try {
    // Validate file size (max 50MB)
    if (videoFile.size > 50 * 1024 * 1024) {
      return {
        success: false,
        message: 'Video file is too large. Maximum size is 50MB.'
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${videoFile.name}`;
    const filePath = `skill-courses/${courseId}/promo-video/${fileName}`;

    // Upload file to Firebase Storage
    const fileStorageRef = storageRef(storage, filePath);
    const snapshot = await uploadBytes(fileStorageRef, videoFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update course with video URL
    const courseRef = dbRef(realtimeDb, `skillCourses/${courseId}`);
    await update(courseRef, {
      promoVideoUrl: downloadURL,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Promo video uploaded successfully');

    return {
      success: true,
      message: 'Promo video uploaded successfully',
      videoUrl: downloadURL
    };
  } catch (error: any) {
    console.error('❌ Error uploading promo video:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload promo video'
    };
  }
};

// Get all skill courses
export const getAllSkillCourses = async () => {
  try {
    const coursesRef = dbRef(realtimeDb, 'skillCourses');
    const snapshot = await get(coursesRef);

    if (snapshot.exists()) {
      const coursesData = snapshot.val();
      const courses: SkillCourse[] = Object.keys(coursesData).map(key => ({
        ...coursesData[key],
        id: key,
        // Ensure arrays are always defined
        techStack: coursesData[key].techStack || [],
        registeredStudents: coursesData[key].registeredStudents || [],
        learningOutcomes: coursesData[key].learningOutcomes || []
      }));

      // Sort by creation date (newest first)
      courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        success: true,
        courses
      };
    } else {
      return {
        success: true,
        courses: []
      };
    }
  } catch (error: any) {
    console.error('❌ Error fetching skill courses:', error);
    return {
      success: false,
      courses: [],
      message: error.message || 'Failed to fetch courses'
    };
  }
};

// Get courses by instructor
export const getCoursesByInstructor = async (instructorId: string) => {
  try {
    const coursesRef = dbRef(realtimeDb, 'skillCourses');
    const snapshot = await get(coursesRef);

    const courses: SkillCourse[] = [];
    if (snapshot.exists()) {
      const coursesData = snapshot.val();
      Object.keys(coursesData).forEach(key => {
        const course = coursesData[key];
        if (course.instructorId === instructorId) {
          courses.push({
            ...course,
            id: key,
            // Ensure arrays are always defined
            techStack: course.techStack || [],
            registeredStudents: course.registeredStudents || [],
            learningOutcomes: course.learningOutcomes || []
          });
        }
      });
    }

    // Sort by creation date (newest first)
    courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      courses
    };
  } catch (error: any) {
    console.error('❌ Error fetching instructor courses:', error);
    return {
      success: false,
      courses: [],
      message: error.message || 'Failed to fetch courses'
    };
  }
};

// Register for a course
export const registerForCourse = async (courseId: string, studentData: {
  studentId: string;
  studentName: string;
  studentEmail: string;
}) => {
  try {
    // Check if course exists and has space
    const courseRef = dbRef(realtimeDb, `skillCourses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      return {
        success: false,
        message: 'Course not found'
      };
    }

    const course = courseSnapshot.val();

    // Ensure registeredStudents array exists
    const registeredStudents = course.registeredStudents || [];

    // Check if registration deadline has passed
    if (new Date() > new Date(course.registrationDeadline)) {
      return {
        success: false,
        message: 'Registration deadline has passed'
      };
    }

    // Check if course is full
    if (registeredStudents.length >= course.maxLearners) {
      return {
        success: false,
        message: 'Course is full'
      };
    }

    // Check if student is already registered
    if (registeredStudents.includes(studentData.studentId)) {
      return {
        success: false,
        message: 'You are already registered for this course'
      };
    }

    // Add student to course
    const updatedRegisteredStudents = [...registeredStudents, studentData.studentId];
    await update(courseRef, {
      registeredStudents: updatedRegisteredStudents,
      updatedAt: new Date().toISOString()
    });

    // Create registration record
    const registrationsRef = dbRef(realtimeDb, 'courseRegistrations');
    const newRegistrationRef = push(registrationsRef);
    
    const registration: CourseRegistration = {
      id: newRegistrationRef.key!,
      courseId,
      courseTitle: course.title,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentEmail: studentData.studentEmail,
      registrationDate: new Date().toISOString(),
      status: 'registered'
    };

    await set(newRegistrationRef, registration);

    return {
      success: true,
      message: 'Successfully registered for the course'
    };
  } catch (error: any) {
    console.error('❌ Error registering for course:', error);
    return {
      success: false,
      message: error.message || 'Failed to register for course'
    };
  }
};

// Get student's registered courses
export const getStudentRegistrations = async (studentId: string) => {
  try {
    const registrationsRef = dbRef(realtimeDb, 'courseRegistrations');
    const snapshot = await get(registrationsRef);

    const registrations: CourseRegistration[] = [];
    if (snapshot.exists()) {
      const registrationsData = snapshot.val();
      Object.keys(registrationsData).forEach(key => {
        const registration = registrationsData[key];
        if (registration.studentId === studentId) {
          registrations.push({
            ...registration,
            id: key
          });
        }
      });
    }

    // Sort by registration date (newest first)
    registrations.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());

    return {
      success: true,
      registrations
    };
  } catch (error: any) {
    console.error('❌ Error fetching student registrations:', error);
    return {
      success: false,
      registrations: [],
      message: error.message || 'Failed to fetch registrations'
    };
  }
};

// Update course
export const updateSkillCourse = async (courseId: string, updateData: Partial<SkillCourse>) => {
  try {
    const courseRef = dbRef(realtimeDb, `skillCourses/${courseId}`);
    await update(courseRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Course updated successfully'
    };
  } catch (error: any) {
    console.error('❌ Error updating course:', error);
    return {
      success: false,
      message: error.message || 'Failed to update course'
    };
  }
};

// Delete course
export const deleteSkillCourse = async (courseId: string) => {
  try {
    const courseRef = dbRef(realtimeDb, `skillCourses/${courseId}`);
    await remove(courseRef);

    return {
      success: true,
      message: 'Course deleted successfully'
    };
  } catch (error: any) {
    console.error('❌ Error deleting course:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete course'
    };
  }
};

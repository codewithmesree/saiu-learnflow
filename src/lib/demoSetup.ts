import { createUser } from './userStorage';

// Demo setup function to create sample users
export const setupDemoUsers = () => {
  try {
    // Create some sample professors
    createUser({
      email: 'prof@learnflow.com',
      password: 'prof123',
      role: 'professor',
      name: 'Dr. Sarah Wilson',
      department: 'School of Computing and Data Science',
    });

    createUser({
      email: 'prof2@learnflow.com',
      password: 'prof123',
      role: 'professor',
      name: 'Dr. Michael Chen',
      department: 'School of AI',
    });

    createUser({
      email: 'prof3@learnflow.com',
      password: 'prof123',
      role: 'professor',
      name: 'Dr. Emily Rodriguez',
      department: 'School of Business',
    });

    // Create some sample students
    createUser({
      email: 'student@learnflow.com',
      password: 'student123',
      role: 'student',
      name: 'John Doe',
      department: 'School of Computing and Data Science',
    });

    createUser({
      email: 'student2@learnflow.com',
      password: 'student123',
      role: 'student',
      name: 'Emily Johnson',
      department: 'School of Arts and Sciences',
    });

    createUser({
      email: 'student3@learnflow.com',
      password: 'student123',
      role: 'student',
      name: 'Michael Brown',
      department: 'School of Law',
    });

    console.log('Demo users created successfully!');
    console.log('You can now login with any of these accounts:');
    console.log('');
    console.log('Professors:');
    console.log('- prof@learnflow.com / prof123');
    console.log('- prof2@learnflow.com / prof123');
    console.log('- prof3@learnflow.com / prof123');
    console.log('');
    console.log('Students:');
    console.log('- student@learnflow.com / student123');
    console.log('- student2@learnflow.com / student123');
    console.log('- student3@learnflow.com / student123');
    console.log('');
    console.log('Admin:');
    console.log('- admin@learnflow.com / admin123');
    
  } catch (error) {
    console.error('Error setting up demo users:', error);
  }
};

// Function to check if demo users exist
export const checkDemoUsers = () => {
  const { getAllUsers } = require('./userStorage');
  const users = getAllUsers();
  
  console.log('Current users in system:');
  users.forEach(user => {
    console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.department}`);
  });
  
  return users.length;
};

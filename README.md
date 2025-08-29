# LearnFlow - Learning Management System

A modern, responsive Learning Management System built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication System
- **Admin Registration & Login**: Secure admin account creation and authentication
- **Role-based Access Control**: Different permissions for admins, professors, and students
- **Protected Routes**: Secure access to admin dashboard

### Admin Dashboard
- **Overview Dashboard**: Key metrics and statistics
- **User Management**: Register and manage students and professors
- **Quick Actions**: Easy access to common administrative tasks
- **Analytics**: Comprehensive insights and metrics (coming soon)
- **Settings**: System configuration panel (coming soon)

### User Registration System
- **Student Registration**: Create student accounts with department assignment
- **Professor Registration**: Create professor accounts with department assignment
- **Department Selection**: Choose from 7 different schools:
  - School of Computing and Data Science
  - School of Arts and Sciences
  - School of Law
  - School of Business
  - School of AI
  - School of Media
  - School of Technology

### Technical Features
- **Modern UI Components**: Built with shadcn/ui components
- **Form Validation**: Zod schema validation for all forms
- **Responsive Design**: Mobile-first responsive design
- **TypeScript**: Full type safety throughout the application
- **Toast Notifications**: User feedback for successful operations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd saiu-learnflow
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Admin Access
- **Default Credentials**: 
  - Email: `admin@learnflow.com`
  - Password: `admin123`

### Registering New Users
1. Login as an administrator
2. Navigate to the Dashboard
3. Use the "Register New Student" or "Register New Professor" buttons
4. Fill in the required information:
   - Full Name
   - Email Address
   - Department Selection
   - Password
   - Confirm Password
5. Submit the form to create the new user account

### Department Options
The system supports 7 different departments, each representing a school within the institution. Users must be assigned to one of these departments during registration.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   └── UserRegistrationModal.tsx  # User registration modal
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Dashboard.tsx   # Admin dashboard
│   ├── Login.tsx       # Login page
│   └── Register.tsx    # Admin registration
├── types/              # TypeScript type definitions
│   └── auth.ts         # Authentication types
└── main.tsx            # Application entry point
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Routing**: React Router v6

## Future Enhancements

- [ ] Database integration for persistent user storage
- [ ] Email verification system
- [ ] Course management system
- [ ] Student enrollment and progress tracking
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

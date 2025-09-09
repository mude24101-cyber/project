# Student Attendance System

## Overview

A web-based student attendance management system that uses simulated fingerprint biometric authentication. The application allows students to check in/out using fingerprint scanning simulation and provides faculty with an administrative dashboard to manage students, attendance sessions, and view comprehensive reports. The system operates entirely in the browser using localStorage for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript
- **Screen-based Navigation**: Multiple screens (login, admin panel) managed through CSS display toggling
- **Component-based Structure**: Modular JavaScript class (`AttendanceSystem`) handling all application logic
- **Responsive Design**: CSS Grid and Flexbox layouts with mobile-first approach

### Authentication System
- **Dual Authentication**: Supports both student fingerprint simulation and faculty username/password login
- **Simulated Biometrics**: Fingerprint scanning is simulated through student selection dropdown for demonstration purposes
- **Session Management**: Basic session tracking for active attendance sessions and user authentication states

### Data Management
- **Client-side Storage**: All data persisted in browser localStorage
- **Data Structures**: 
  - Students: ID, name, email
  - Attendance Records: timestamps, student IDs, session data
  - Admin Credentials: username/password pairs
- **Default Data Initialization**: Automatically populates sample students and admin credentials on first run

### User Interface Design
- **Modern UI/UX**: Gradient backgrounds, card-based layouts, and Font Awesome icons
- **Interactive Elements**: Animated fingerprint scanner, form validation, and real-time feedback
- **Admin Dashboard**: Comprehensive faculty interface for student management and attendance tracking

### Application Flow
- **Student Self-Service**: Students scan fingerprint → automatic attendance marking for active sessions
- **Faculty Session Management**: Faculty create and monitor attendance sessions → students mark their own attendance
- **Real-time Monitoring**: Faculty can view attendance in real-time as students scan their fingerprints
- **Data Persistence**: All actions immediately saved to localStorage for data retention

## External Dependencies

### CDN Resources
- **Font Awesome 6.0.0**: Icon library for UI elements and branding
- **CSS Fonts**: Standard web fonts for typography

### Browser APIs
- **localStorage API**: Primary data storage mechanism for all application data
- **DOM Manipulation**: Native JavaScript for UI interactions and dynamic content updates

### Development Dependencies
- **None**: Pure vanilla web technologies without build tools or frameworks
- **Browser Compatibility**: Requires modern browser with ES6+ support and localStorage capability
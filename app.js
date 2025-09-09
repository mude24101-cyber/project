// Student Attendance System - Main Application Logic
class AttendanceSystem {
    constructor() {
        this.currentUser = null;
        this.isSessionActive = false;
        this.currentSession = null;
        this.initializeApp();
    }

    initializeApp() {
        this.initializeDefaultData();
        this.setupEventListeners();
        this.loadStudentOptions();
        this.setDefaultDates();
    }

    initializeDefaultData() {
        // Initialize default admin credentials
        if (!localStorage.getItem('adminCredentials')) {
            const defaultAdmin = {
                username: 'admin',
                password: 'admin123'
            };
            localStorage.setItem('adminCredentials', JSON.stringify(defaultAdmin));
        }

        // Initialize default students if none exist
        if (!localStorage.getItem('students')) {
            const defaultStudents = [
                { id: 'ST001', name: 'John Smith', email: 'john.smith@email.com' },
                { id: 'ST002', name: 'Emma Johnson', email: 'emma.johnson@email.com' },
                { id: 'ST003', name: 'Michael Brown', email: 'michael.brown@email.com' },
                { id: 'ST004', name: 'Sarah Davis', email: 'sarah.davis@email.com' },
                { id: 'ST005', name: 'David Wilson', email: 'david.wilson@email.com' },
                { id: 'ST006', name: 'Jessica Miller', email: 'jessica.miller@email.com' },
                { id: 'ST007', name: 'Daniel Garcia', email: 'daniel.garcia@email.com' },
                { id: 'ST008', name: 'Ashley Martinez', email: 'ashley.martinez@email.com' }
            ];
            localStorage.setItem('students', JSON.stringify(defaultStudents));
        }

        // Initialize attendance records if none exist
        if (!localStorage.getItem('attendanceRecords')) {
            localStorage.setItem('attendanceRecords', JSON.stringify([]));
        }
    }

    setupEventListeners() {
        // Fingerprint scanner simulation
        const scanner = document.getElementById('fingerprintScanner');
        if (scanner) {
            scanner.addEventListener('click', () => this.simulateFingerprintScan());
        }

        // Student select change
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.simulateFingerprintScan();
                }
            });
        }

        // Set current date
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }

    loadStudentOptions() {
        const students = this.getStudents();
        const studentSelect = document.getElementById('studentSelect');
        const manualStudentSelect = document.getElementById('manualStudentSelect');
        
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Select Student (Simulation)</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id})`;
                studentSelect.appendChild(option);
            });
        }

        if (manualStudentSelect) {
            manualStudentSelect.innerHTML = '<option value="">Manual Entry - Select Student</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id})`;
                manualStudentSelect.appendChild(option);
            });
        }
    }

    simulateFingerprintScan() {
        const studentSelect = document.getElementById('studentSelect');
        const selectedStudentId = studentSelect.value;
        
        if (!selectedStudentId) {
            alert('Please select a student to simulate fingerprint authentication');
            return;
        }

        const scanner = document.getElementById('fingerprintScanner');
        scanner.classList.add('scanning');
        scanner.querySelector('p').textContent = 'Scanning...';

        setTimeout(() => {
            const student = this.getStudents().find(s => s.id === selectedStudentId);
            if (student) {
                this.authenticateStudent(student);
            }
            scanner.classList.remove('scanning');
            scanner.querySelector('p').textContent = 'Place finger on scanner';
        }, 2000);
    }

    authenticateStudent(student) {
        // Check if there's an active session for marking attendance
        const activeSessions = this.getActiveSessions();
        
        if (activeSessions.length > 0) {
            // Try to mark attendance for active sessions
            this.markStudentAttendance(student, activeSessions);
        } else {
            // No active session, go to student dashboard
            this.currentUser = student;
            this.showScreen('studentPanel');
            this.loadStudentDashboard();
            document.getElementById('studentWelcome').textContent = `Welcome, ${student.name}`;
        }
    }

    getStudents() {
        return JSON.parse(localStorage.getItem('students') || '[]');
    }

    getAttendanceRecords() {
        return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }

    saveAttendanceRecord(record) {
        const records = this.getAttendanceRecords();
        records.push(record);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
    }

    getActiveSessions() {
        return JSON.parse(localStorage.getItem('activeSessions') || '[]');
    }

    saveActiveSessions(sessions) {
        localStorage.setItem('activeSessions', JSON.stringify(sessions));
    }

    markStudentAttendance(student, activeSessions) {
        const records = this.getAttendanceRecords();
        let markedCount = 0;
        
        activeSessions.forEach(session => {
            // Check if student already marked for this session
            const existingRecord = records.find(r => 
                r.studentId === student.id && 
                r.subject === session.subject && 
                r.date === session.date
            );
            
            if (!existingRecord) {
                const attendanceRecord = {
                    studentId: student.id,
                    studentName: student.name,
                    subject: session.subject,
                    date: session.date,
                    time: new Date().toLocaleTimeString(),
                    timestamp: new Date().toISOString()
                };
                
                this.saveAttendanceRecord(attendanceRecord);
                markedCount++;
            }
        });
        
        if (markedCount > 0) {
            alert(`Attendance marked successfully for ${student.name}!\nMarked present for ${markedCount} session(s).`);
        } else {
            alert(`Welcome ${student.name}!\nYou are already marked present for all active sessions.`);
        }
        
        // Reset the form
        document.getElementById('studentSelect').value = '';
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    loadStudentDashboard() {
        if (!this.currentUser) return;

        const records = this.getAttendanceRecords();
        const studentRecords = records.filter(r => r.studentId === this.currentUser.id);
        
        const totalClasses = records.filter((r, index, arr) => 
            arr.findIndex(item => item.subject === r.subject && item.date === r.date) === index
        ).length;

        const attendedClasses = studentRecords.length;
        const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

        document.getElementById('totalClasses').textContent = totalClasses;
        document.getElementById('attendedClasses').textContent = attendedClasses;
        document.getElementById('attendancePercentage').textContent = attendancePercentage + '%';

        this.loadStudentAttendance();
    }

    loadStudentAttendance() {
        if (!this.currentUser) return;

        const filter = document.getElementById('studentSubjectFilter').value;
        const records = this.getAttendanceRecords();
        let studentRecords = records.filter(r => r.studentId === this.currentUser.id);

        if (filter !== 'all') {
            studentRecords = studentRecords.filter(r => r.subject === filter);
        }

        const attendanceList = document.getElementById('studentAttendanceList');
        if (studentRecords.length === 0) {
            attendanceList.innerHTML = '<p>No attendance records found.</p>';
            return;
        }

        const table = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentRecords.map(record => `
                        <tr>
                            <td>${new Date(record.date).toLocaleDateString()}</td>
                            <td>${record.subject}</td>
                            <td>${record.time}</td>
                            <td><span class="success">Present</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        attendanceList.innerHTML = table;
    }
}

// Global instance
const attendanceSystem = new AttendanceSystem();

// Admin Authentication
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    const credentials = JSON.parse(localStorage.getItem('adminCredentials'));
    
    if (username === credentials.username && password === credentials.password) {
        attendanceSystem.currentUser = { type: 'admin', username };
        attendanceSystem.showScreen('adminPanel');
        document.getElementById('adminWelcome').textContent = `Welcome, ${username}`;
        loadStudentsList();
        refreshManualStudentSelect();
    } else {
        alert('Invalid credentials. Use: admin / admin123');
    }
}

// Logout function
function logout() {
    attendanceSystem.currentUser = null;
    attendanceSystem.isSessionActive = false;
    attendanceSystem.currentSession = null;
    
    // Clear form fields
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('studentSelect').value = '';
    
    // Hide attendance session
    document.getElementById('attendanceSession').classList.add('hidden');
    
    attendanceSystem.showScreen('loginScreen');
}

// Tab Management
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Attendance Session Management
function startAttendanceSession() {
    const subject = document.getElementById('subjectSelect').value;
    const date = document.getElementById('attendanceDate').value;
    
    if (!subject || !date) {
        alert('Please select subject and date');
        return;
    }
    
    // Check if session already exists
    const activeSessions = attendanceSystem.getActiveSessions();
    const existingSession = activeSessions.find(s => s.subject === subject && s.date === date);
    
    if (existingSession) {
        alert('A session for this subject and date is already active');
        return;
    }
    
    // Create new session
    const newSession = {
        id: Date.now(),
        subject,
        date,
        startTime: new Date().toISOString(),
        status: 'active'
    };
    
    activeSessions.push(newSession);
    attendanceSystem.saveActiveSessions(activeSessions);
    
    attendanceSystem.isSessionActive = true;
    attendanceSystem.currentSession = newSession;
    
    document.getElementById('currentSubject').textContent = subject;
    document.getElementById('currentDate').textContent = new Date(date).toLocaleDateString();
    document.getElementById('attendanceSession').classList.remove('hidden');
    
    alert(`Attendance session started for ${subject} on ${new Date(date).toLocaleDateString()}.\nStudents can now mark their attendance using the fingerprint scanner.`);
    
    updateAttendanceDisplay();
    loadActiveSessionsList();
}

function markManualAttendance() {
    if (!attendanceSystem.isSessionActive) {
        alert('Please start an attendance session first');
        return;
    }
    
    const studentId = document.getElementById('manualStudentSelect').value;
    if (!studentId) {
        alert('Please select a student');
        return;
    }
    
    const student = attendanceSystem.getStudents().find(s => s.id === studentId);
    if (!student) {
        alert('Student not found');
        return;
    }
    
    // Check if already marked present
    const records = attendanceSystem.getAttendanceRecords();
    const existing = records.find(r => 
        r.studentId === studentId && 
        r.subject === attendanceSystem.currentSession.subject && 
        r.date === attendanceSystem.currentSession.date
    );
    
    if (existing) {
        alert('Student already marked present');
        return;
    }
    
    // Mark attendance
    const attendanceRecord = {
        studentId: studentId,
        studentName: student.name,
        subject: attendanceSystem.currentSession.subject,
        date: attendanceSystem.currentSession.date,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString()
    };
    
    attendanceSystem.saveAttendanceRecord(attendanceRecord);
    
    // Update UI
    updateAttendanceDisplay();
    document.getElementById('manualStudentSelect').value = '';
    
    alert(`${student.name} marked present manually`);
}

function updateAttendanceDisplay() {
    if (!attendanceSystem.currentSession) {
        return;
    }
    
    const records = attendanceSystem.getAttendanceRecords();
    const sessionRecords = records.filter(r => 
        r.subject === attendanceSystem.currentSession.subject && 
        r.date === attendanceSystem.currentSession.date
    );
    
    document.getElementById('presentCount').textContent = sessionRecords.length;
    
    const attendanceList = document.getElementById('todaysAttendance');
    attendanceList.innerHTML = sessionRecords.map(record => `
        <div class="attendance-item">
            <div>
                <strong>${record.studentName}</strong> (${record.studentId})
            </div>
            <div class="success">${record.time}</div>
        </div>
    `).join('');
}

function endAttendanceSession() {
    if (!attendanceSystem.isSessionActive) {
        alert('No active session to end');
        return;
    }
    
    // Mark session as ended
    const activeSessions = attendanceSystem.getActiveSessions();
    const sessionIndex = activeSessions.findIndex(s => s.id === attendanceSystem.currentSession.id);
    
    if (sessionIndex !== -1) {
        activeSessions[sessionIndex].status = 'ended';
        activeSessions[sessionIndex].endTime = new Date().toISOString();
        attendanceSystem.saveActiveSessions(activeSessions.filter(s => s.status === 'active'));
    }
    
    const records = attendanceSystem.getAttendanceRecords();
    const sessionRecords = records.filter(r => 
        r.subject === attendanceSystem.currentSession.subject && 
        r.date === attendanceSystem.currentSession.date
    );
    
    alert(`Attendance session ended for ${attendanceSystem.currentSession.subject}.\n${sessionRecords.length} students marked present.`);
    
    attendanceSystem.isSessionActive = false;
    attendanceSystem.currentSession = null;
    document.getElementById('attendanceSession').classList.add('hidden');
    loadActiveSessionsList();
}

// Reports Generation
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const subject = document.getElementById('reportSubject').value;
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    
    if (!fromDate || !toDate) {
        alert('Please select date range');
        return;
    }
    
    const records = attendanceSystem.getAttendanceRecords();
    const students = attendanceSystem.getStudents();
    
    let filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        let dateMatch = recordDate >= from && recordDate <= to;
        let subjectMatch = subject === 'all' || record.subject === subject;
        
        return dateMatch && subjectMatch;
    });
    
    const resultsDiv = document.getElementById('reportResults');
    
    if (filteredRecords.length === 0) {
        resultsDiv.innerHTML = '<p>No records found for the selected criteria.</p>';
        return;
    }
    
    let reportHTML = '';
    
    if (reportType === 'subject') {
        reportHTML = generateSubjectWiseReport(filteredRecords, students);
    } else if (reportType === 'date') {
        reportHTML = generateDateWiseReport(filteredRecords, students);
    } else if (reportType === 'student') {
        reportHTML = generateStudentWiseReport(filteredRecords, students);
    }
    
    resultsDiv.innerHTML = reportHTML;
}

function generateSubjectWiseReport(records, students) {
    const subjectData = {};
    
    records.forEach(record => {
        if (!subjectData[record.subject]) {
            subjectData[record.subject] = new Set();
        }
        subjectData[record.subject].add(record.studentId);
    });
    
    let html = '<h3>Subject-wise Attendance Report</h3>';
    html += '<table class="report-table"><thead><tr><th>Subject</th><th>Students Present</th><th>Attendance Count</th></tr></thead><tbody>';
    
    Object.keys(subjectData).forEach(subject => {
        const studentIds = Array.from(subjectData[subject]);
        const studentNames = studentIds.map(id => {
            const student = students.find(s => s.id === id);
            return student ? student.name : id;
        }).join(', ');
        
        html += `
            <tr>
                <td>${subject}</td>
                <td>${studentNames}</td>
                <td>${studentIds.length}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    return html;
}

function generateDateWiseReport(records, students) {
    const dateData = {};
    
    records.forEach(record => {
        const dateKey = record.date;
        if (!dateData[dateKey]) {
            dateData[dateKey] = {};
        }
        if (!dateData[dateKey][record.subject]) {
            dateData[dateKey][record.subject] = new Set();
        }
        dateData[dateKey][record.subject].add(record.studentId);
    });
    
    let html = '<h3>Date-wise Attendance Report</h3>';
    html += '<table class="report-table"><thead><tr><th>Date</th><th>Subject</th><th>Present Students</th><th>Count</th></tr></thead><tbody>';
    
    Object.keys(dateData).sort().forEach(date => {
        Object.keys(dateData[date]).forEach(subject => {
            const studentIds = Array.from(dateData[date][subject]);
            const studentNames = studentIds.map(id => {
                const student = students.find(s => s.id === id);
                return student ? student.name : id;
            }).join(', ');
            
            html += `
                <tr>
                    <td>${new Date(date).toLocaleDateString()}</td>
                    <td>${subject}</td>
                    <td>${studentNames}</td>
                    <td>${studentIds.length}</td>
                </tr>
            `;
        });
    });
    
    html += '</tbody></table>';
    return html;
}

function generateStudentWiseReport(records, students) {
    const studentData = {};
    
    records.forEach(record => {
        if (!studentData[record.studentId]) {
            studentData[record.studentId] = [];
        }
        studentData[record.studentId].push(record);
    });
    
    let html = '<h3>Student-wise Attendance Report</h3>';
    html += '<table class="report-table"><thead><tr><th>Student</th><th>Subject</th><th>Dates Present</th><th>Total Classes</th></tr></thead><tbody>';
    
    students.forEach(student => {
        const studentRecords = studentData[student.id] || [];
        const subjectGroups = {};
        
        studentRecords.forEach(record => {
            if (!subjectGroups[record.subject]) {
                subjectGroups[record.subject] = [];
            }
            subjectGroups[record.subject].push(record.date);
        });
        
        if (Object.keys(subjectGroups).length === 0) {
            html += `
                <tr>
                    <td>${student.name} (${student.id})</td>
                    <td colspan="3">No attendance records</td>
                </tr>
            `;
        } else {
            Object.keys(subjectGroups).forEach(subject => {
                const dates = subjectGroups[subject].map(date => new Date(date).toLocaleDateString()).join(', ');
                html += `
                    <tr>
                        <td>${student.name} (${student.id})</td>
                        <td>${subject}</td>
                        <td>${dates}</td>
                        <td>${subjectGroups[subject].length}</td>
                    </tr>
                `;
            });
        }
    });
    
    html += '</tbody></table>';
    return html;
}

// Student Management
function addStudent() {
    const name = document.getElementById('newStudentName').value.trim();
    const id = document.getElementById('newStudentId').value.trim();
    const email = document.getElementById('newStudentEmail').value.trim();
    
    if (!name || !id || !email) {
        alert('Please fill in all fields');
        return;
    }
    
    const students = attendanceSystem.getStudents();
    
    // Check if student ID already exists
    if (students.find(s => s.id === id)) {
        alert('Student ID already exists');
        return;
    }
    
    students.push({ id, name, email });
    localStorage.setItem('students', JSON.stringify(students));
    
    // Clear form
    document.getElementById('newStudentName').value = '';
    document.getElementById('newStudentId').value = '';
    document.getElementById('newStudentEmail').value = '';
    
    // Refresh lists
    loadStudentsList();
    attendanceSystem.loadStudentOptions();
    refreshManualStudentSelect();
    
    alert('Student added successfully');
}

function loadStudentsList() {
    const students = attendanceSystem.getStudents();
    const studentsList = document.getElementById('studentsList');
    
    if (students.length === 0) {
        studentsList.innerHTML = '<p>No students registered</p>';
        return;
    }
    
    studentsList.innerHTML = students.map(student => `
        <div class="student-item">
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>ID: ${student.id} | Email: ${student.email}</p>
            </div>
            <button class="delete-btn" onclick="deleteStudent('${student.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    let students = attendanceSystem.getStudents();
    students = students.filter(s => s.id !== studentId);
    localStorage.setItem('students', JSON.stringify(students));
    
    loadStudentsList();
    attendanceSystem.loadStudentOptions();
    refreshManualStudentSelect();
}

function refreshManualStudentSelect() {
    const students = attendanceSystem.getStudents();
    const manualStudentSelect = document.getElementById('manualStudentSelect');
    
    if (manualStudentSelect) {
        manualStudentSelect.innerHTML = '<option value="">Manual Entry - Select Student</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.id})`;
            manualStudentSelect.appendChild(option);
        });
    }
}

// Defaulters List
function generateDefaultersList() {
    const threshold = parseInt(document.getElementById('attendanceThreshold').value);
    
    if (threshold < 0 || threshold > 100) {
        alert('Please enter a valid percentage (0-100)');
        return;
    }
    
    const students = attendanceSystem.getStudents();
    const records = attendanceSystem.getAttendanceRecords();
    
    // Calculate total classes per subject
    const totalClassesBySubject = {};
    records.forEach(record => {
        const key = `${record.subject}-${record.date}`;
        if (!totalClassesBySubject[record.subject]) {
            totalClassesBySubject[record.subject] = new Set();
        }
        totalClassesBySubject[record.subject].add(record.date);
    });
    
    // Convert to counts
    Object.keys(totalClassesBySubject).forEach(subject => {
        totalClassesBySubject[subject] = totalClassesBySubject[subject].size;
    });
    
    const defaultersList = [];
    
    students.forEach(student => {
        const studentRecords = records.filter(r => r.studentId === student.id);
        const subjectAttendance = {};
        
        studentRecords.forEach(record => {
            if (!subjectAttendance[record.subject]) {
                subjectAttendance[record.subject] = 0;
            }
            subjectAttendance[record.subject]++;
        });
        
        // Check each subject
        Object.keys(totalClassesBySubject).forEach(subject => {
            const attended = subjectAttendance[subject] || 0;
            const total = totalClassesBySubject[subject];
            const percentage = total > 0 ? (attended / total) * 100 : 0;
            
            if (percentage < threshold) {
                defaultersList.push({
                    student,
                    subject,
                    attended,
                    total,
                    percentage: Math.round(percentage)
                });
            }
        });
    });
    
    const defaultersDiv = document.getElementById('defaultersList');
    
    if (defaultersList.length === 0) {
        defaultersDiv.innerHTML = `<p>No defaulters found (students with attendance below ${threshold}%)</p>`;
        return;
    }
    
    let html = `<h3>Defaulters List (Below ${threshold}% attendance)</h3>`;
    html += '<table class="report-table"><thead><tr><th>Student</th><th>Subject</th><th>Classes Attended</th><th>Total Classes</th><th>Attendance %</th></tr></thead><tbody>';
    
    defaultersList.forEach(item => {
        html += `
            <tr>
                <td>${item.student.name} (${item.student.id})</td>
                <td>${item.subject}</td>
                <td>${item.attended}</td>
                <td>${item.total}</td>
                <td><span class="danger">${item.percentage}%</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    defaultersDiv.innerHTML = html;
}

// Load active sessions list
function loadActiveSessionsList() {
    const activeSessions = attendanceSystem.getActiveSessions();
    const sessionsList = document.getElementById('activeSessionsList');
    
    if (!sessionsList) return;
    
    if (activeSessions.length === 0) {
        sessionsList.innerHTML = '<p>No active sessions</p>';
        return;
    }
    
    sessionsList.innerHTML = activeSessions.map(session => {
        const records = attendanceSystem.getAttendanceRecords();
        const sessionAttendance = records.filter(r => 
            r.subject === session.subject && r.date === session.date
        );
        
        return `
            <div class="session-item">
                <div class="session-info">
                    <h4>${session.subject}</h4>
                    <p>Date: ${new Date(session.date).toLocaleDateString()}</p>
                    <p>Started: ${new Date(session.startTime).toLocaleTimeString()}</p>
                    <p class="success">Students Present: ${sessionAttendance.length}</p>
                </div>
                <button onclick="viewSessionDetails('${session.id}')" class="view-btn">
                    View Details
                </button>
            </div>
        `;
    }).join('');
}

function viewSessionDetails(sessionId) {
    const activeSessions = attendanceSystem.getActiveSessions();
    const session = activeSessions.find(s => s.id == sessionId);
    
    if (!session) {
        alert('Session not found');
        return;
    }
    
    const records = attendanceSystem.getAttendanceRecords();
    const sessionAttendance = records.filter(r => 
        r.subject === session.subject && r.date === session.date
    );
    
    let details = `Session Details:\n`;
    details += `Subject: ${session.subject}\n`;
    details += `Date: ${new Date(session.date).toLocaleDateString()}\n`;
    details += `Started: ${new Date(session.startTime).toLocaleTimeString()}\n`;
    details += `Students Present: ${sessionAttendance.length}\n\n`;
    
    if (sessionAttendance.length > 0) {
        details += `Attendance List:\n`;
        sessionAttendance.forEach((record, index) => {
            details += `${index + 1}. ${record.studentName} (${record.studentId}) - ${record.time}\n`;
        });
    }
    
    alert(details);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
    
    // Load active sessions if on admin panel
    setTimeout(() => {
        loadActiveSessionsList();
    }, 500);
});
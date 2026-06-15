# Netzertech Backend Endpoints

Total endpoints found: 157

| Method | Path | Handler | Allowed Roles | Controller File |
|---|---|---|---|---|
| **GET** | `/` | `getHello` | *Public / Inherited* | `src/app.controller.ts` |
| **GET** | `/academic/assignments` | `getAssignments` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/assignments/:assignmentId` | `getAssignmentDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/assignments/:assignmentId/preview` | `previewAssignmentSubmission` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/assignments/:assignmentId/save-draft` | `saveAssignmentDraft` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/assignments/:assignmentId/start` | `startAssignment` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/assignments/:assignmentId/submission` | `viewAssignmentSubmission` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/assignments/:assignmentId/submit` | `submitAssignment` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/class-activities` | `getClassActivities` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/class-activities/:classActivityId` | `getClassActivityDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/class-activities/:classActivityId/questions` | `getClassActivityQuestions` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/class-activities/:classActivityId/review` | `getClassActivityReview` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/class-activities/:classActivityId/start` | `startClassActivity` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/class-activities/:classActivityId/submit` | `submitClassActivity` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/class-activities/:id/result` | `getClassActivityResult` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/class-activities/:id/save-progress` | `saveClassActivityProgress` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/class/:classId/module` | `createSubjectModule` | `TEACHER` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/classes/:classId/learning-materials` | `getLearningMaterials` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/courses` | `getStudentCourses` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/learning-materials/:materialId` | `getLearningMaterialDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/live-sessions` | `getLiveClasses` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/live-sessions/:sessionId` | `getLiveSessionDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/live-sessions/:sessionId/join` | `joinLiveSession` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/live-sessions/:sessionId/leave` | `leaveLiveSession` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/live-sessions/:sessionId/message` | `sendLiveSessionMessage` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT`, `TEACHER` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/live-sessions/:sessionId/messages` | `getLiveSessionMessages` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT`, `TEACHER` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/live-sessions/:sessionId/reminder` | `scheduleReminder` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/register-subject` | `registerSubject` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/roadmap` | `getStudentRoadmap` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/roadmap/:subjectName` | `getSubjectRoadmapDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/subjects` | `getAvailableSubjects` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT`, `TEACHER`, `ADMIN` | `src/academic/academic.controller.ts` |
| **POST** | `/academic/subjects` | `createSubject` | `ADMIN`, `TEACHER` | `src/academic/academic.controller.ts` |
| **GET** | `/academic/subjects-progress` | `getStudentSubjectsProgress` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/academic.controller.ts` |
| **POST** | `/admin/announcements` | `createAnnouncement` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/classes` | `createClass` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/classes/overview` | `getClassesOverview` | `ADMIN`, `TEACHER` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/dashboard-stats` | `getDashboardStats` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/events` | `createEvent` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/examinations/timetable` | `createExamTimetable` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/finance/bills` | `getBills` | *Public / Inherited* | `src/finance/finance.controller.ts` |
| **POST** | `/admin/finance/bills` | `createBill` | *Public / Inherited* | `src/finance/finance.controller.ts` |
| **PATCH** | `/admin/finance/bills/:id/publish` | `publishBill` | *Public / Inherited* | `src/finance/finance.controller.ts` |
| **GET** | `/admin/finance/payments` | `getPayments` | *Public / Inherited* | `src/finance/finance.controller.ts` |
| **POST** | `/admin/finance/payments` | `recordPayment` | *Public / Inherited* | `src/finance/finance.controller.ts` |
| **GET** | `/admin/finance/revenue` | `getRevenue` | *Public / Inherited* | `src/finance/finance.controller.ts` |
| **POST** | `/admin/id-cards/send-to-vendor` | `sendIdCardsToVendor` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/parents` | `getParents` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/parents` | `createParent` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/seed` | `runSeed` | *Public / Inherited* | `src/admin/admin.controller.ts` |
| **GET** | `/admin/students` | `getStudents` | `ADMIN`, `TEACHER` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/students` | `createStudentWithParent` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/students/:id` | `getStudent` | `ADMIN`, `TEACHER` | `src/admin/admin.controller.ts` |
| **PATCH** | `/admin/students/:id` | `updateStudent` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/system-users` | `getSystemUsers` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/system-users` | `createSystemUser` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/teachers` | `getTeachers` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/teachers` | `createTeacher` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/admin/teachers/:id` | `getTeacher` | `ADMIN` | `src/admin/admin.controller.ts` |
| **PATCH** | `/admin/teachers/:id` | `updateTeacher` | `ADMIN` | `src/admin/admin.controller.ts` |
| **POST** | `/admin/timetable/periods` | `createTimetablePeriod` | `ADMIN` | `src/admin/admin.controller.ts` |
| **GET** | `/attendance/admin/classes` | `getAdminClasses` | `ADMIN`, `TEACHER` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/admin/leave-requests` | `getAdminLeaveRequests` | `ADMIN`, `TEACHER` | `src/attendance/attendance.controller.ts` |
| **POST** | `/attendance/admin/leave-requests/:id/status` | `updateLeaveRequestStatus` | `ADMIN`, `TEACHER` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/admin/students` | `getAdminStudents` | `ADMIN`, `TEACHER` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/calendar` | `getCalendar` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/history` | `getHistory` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/leave-requests` | `getLeaveRequests` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **POST** | `/attendance/leave-requests` | `createLeaveRequest` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/leave-requests/:id` | `getLeaveRequestById` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/leave-requests/stats` | `getLeaveRequestStats` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/overview` | `getOverview` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **GET** | `/attendance/subjects` | `getSubjects` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/attendance/attendance.controller.ts` |
| **POST** | `/auth/change-password` | `changePassword` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/forgot-password` | `forgotPassword` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/login/admin` | `adminLogin` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/login/parent` | `parentLogin` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/login/student/secondary` | `studentLogin` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/login/student/university` | `universityStudentLogin` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/login/teacher` | `teacherLogin` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/logout` | `logout` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **GET** | `/auth/profile` | `getProfile` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/reset-password` | `resetPassword` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/auth/school-signup` | `schoolSignup` | *Public / Inherited* | `src/auth/auth.controller.ts` |
| **POST** | `/contact/submit` | `submitContactForm` | *Public / Inherited* | `src/contact/contact.controller.ts` |
| **GET** | `/dashboard/parent` | `getParentDashboard` | `PARENT` | `src/dashboard/dashboard.controller.ts` |
| **GET** | `/dashboard/secondary-student` | `getSecondaryStudentDashboard` | `SECONDARY_STUDENT` | `src/dashboard/dashboard.controller.ts` |
| **GET** | `/dashboard/teacher` | `getTeacherDashboard` | `TEACHER` | `src/dashboard/dashboard.controller.ts` |
| **GET** | `/dashboard/university-student` | `getUniversityStudentDashboard` | `UNIVERSITY_STUDENT` | `src/dashboard/dashboard.controller.ts` |
| **GET** | `/examination` | `getExaminations` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **GET** | `/examination/:examinationId/review` | `getClassActivityReview` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **GET** | `/examination/:id` | `getExaminationDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **GET** | `/examination/:id/questions` | `getExaminationQuestions` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **GET** | `/examination/:id/result` | `getExaminationResult` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **POST** | `/examination/:id/save-progress` | `saveExaminationProgress` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **POST** | `/examination/:id/start` | `startExamination` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **POST** | `/examination/:id/submit` | `submitExamination` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/examination.controller.ts` |
| **POST** | `/library/borrow/:bookId` | `borrowBook` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/borrowed` | `getBorrowedBooks` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/catalog` | `getCatalog` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/catalog` | `addBook` | `ADMIN`, `TEACHER` | `src/library/library.controller.ts` |
| **GET** | `/library/fines` | `getActiveFines` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/fines/:loanId/pay` | `payFine` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/fines/history` | `getFineHistory` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/goals` | `setReadingGoal` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/history` | `getBorrowHistory` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/rate/:loanId` | `rateBook` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/reminders/:loanId` | `setReminder` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/renew/:loanId` | `renewBook` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/reserve/:bookId` | `reserveBook` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/reserved` | `getReservations` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/return/:loanId` | `returnBook` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/stats` | `getStats` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/library/wishlist` | `getWishlist` | *Public / Inherited* | `src/library/library.controller.ts` |
| **POST** | `/library/wishlist/:bookId` | `toggleWishlist` | *Public / Inherited* | `src/library/library.controller.ts` |
| **GET** | `/practice-tests` | `getPracticeTests` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **GET** | `/practice-tests/:examinationId/review` | `getPracticeTestReview` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **GET** | `/practice-tests/:id` | `getPracticeTestDetail` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **GET** | `/practice-tests/:id/questions` | `getPracticeTestQuestions` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **GET** | `/practice-tests/:id/result` | `getPracticeTestResult` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **POST** | `/practice-tests/:id/save-progress` | `savePracticeTestProgress` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **POST** | `/practice-tests/:id/start` | `startPracticeTest` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **POST** | `/practice-tests/:id/submit` | `submitPracticeTest` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/academic/practice-test.controller.ts` |
| **GET** | `/profile` | `getProfile` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT`, `PARENT` | `src/profile/profile.controller.ts` |
| **PATCH** | `/profile/contact` | `updateContactInfo` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/profile/profile.controller.ts` |
| **PATCH** | `/profile/guardian` | `updateGuardianInfo` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/profile/profile.controller.ts` |
| **PATCH** | `/profile/password` | `updatePassword` | *Public / Inherited* | `src/profile/profile.controller.ts` |
| **PATCH** | `/profile/personal` | `updatePersonalInfo` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/profile/profile.controller.ts` |
| **GET** | `/records/download` | `downloadReportCard` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/records/records.controller.ts` |
| **GET** | `/records/performance` | `getPerformanceAnalytics` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/records/records.controller.ts` |
| **GET** | `/records/report-card` | `getReportCard` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/records/records.controller.ts` |
| **GET** | `/records/terms` | `getAvailableTerms` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/records/records.controller.ts` |
| **GET** | `/student-life/clubs` | `getAllClubs` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT`, `ADMIN` | `src/student-life/club.controller.ts` |
| **POST** | `/student-life/clubs` | `createClub` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **GET** | `/student-life/clubs/:id` | `getClubDetails` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **POST** | `/student-life/clubs/:id/join` | `joinClub` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **POST** | `/student-life/clubs/:id/leave` | `leaveClub` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **GET** | `/student-life/clubs/events` | `getUpcomingEvents` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **POST** | `/student-life/clubs/events/:eventId/attend` | `confirmEventAttendance` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **GET** | `/student-life/clubs/leadership` | `getLeadershipClubs` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **GET** | `/student-life/clubs/my-clubs` | `getMyClubs` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **GET** | `/student-life/clubs/stats` | `getStats` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/student-life/club.controller.ts` |
| **GET** | `/support/categories` | `getCategories` | *Public / Inherited* | `src/support/support.controller.ts` |
| **GET** | `/support/faqs` | `getFaqs` | *Public / Inherited* | `src/support/support.controller.ts` |
| **POST** | `/support/faqs` | `createFaq` | `ADMIN` | `src/support/support.controller.ts` |
| **GET** | `/support/tickets` | `getTickets` | *Public / Inherited* | `src/support/support.controller.ts` |
| **POST** | `/support/tickets` | `createTicket` | *Public / Inherited* | `src/support/support.controller.ts` |
| **GET** | `/support/tickets/:id` | `getTicket` | *Public / Inherited* | `src/support/support.controller.ts` |
| **POST** | `/support/tickets/:id/email` | `sendTicketEmail` | `ADMIN` | `src/support/support.controller.ts` |
| **POST** | `/support/tickets/:id/notes` | `addTicketNote` | `ADMIN` | `src/support/support.controller.ts` |
| **GET** | `/timetable` | `getTimetable` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/timetable/timetable.controller.ts` |
| **GET** | `/timetable/download` | `downloadTimetable` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/timetable/timetable.controller.ts` |
| **POST** | `/timetable/join` | `joinEvent` | `SECONDARY_STUDENT`, `UNIVERSITY_STUDENT` | `src/timetable/timetable.controller.ts` |
| **GET** | `/users` | `findAll` | `ADMIN` | `src/users/users.controller.ts` |
| **GET** | `/users/:id` | `findOne` | `ADMIN` | `src/users/users.controller.ts` |
| **PATCH** | `/users/:id/activate` | `activateUser` | `ADMIN` | `src/users/users.controller.ts` |
| **PATCH** | `/users/:id/deactivate` | `deactivateUser` | `ADMIN` | `src/users/users.controller.ts` |
| **GET** | `/users/role/:userType` | `findByRole` | `ADMIN` | `src/users/users.controller.ts` |

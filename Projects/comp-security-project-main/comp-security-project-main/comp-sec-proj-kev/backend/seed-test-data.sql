-- Seed Test Data for Student Information System
-- Run this after setup-database.sql to add test users

USE login_db;

-- Create a faculty user
-- Password: Faculty123!
INSERT INTO users (username, email, password, role, is_active) 
VALUES ('faculty1', 'faculty@university.edu', '$2b$10$yL7cCRWGWwTlSUM/Akr6L.imN6ZlrRERHY7.KLmjF9ii9T8Dyk58S', 'faculty', 1)
ON DUPLICATE KEY UPDATE email = email;

-- Create test student users
-- Password for all: Student123!
INSERT INTO users (username, email, password, role, is_active) 
VALUES 
('student1', 'john.doe@student.edu', '$2b$10$yL7cCRWGWwTlSUM/Akr6L.imN6ZlrRERHY7.KLmjF9ii9T8Dyk58S', 'student', 1),
('student2', 'jane.smith@student.edu', '$2b$10$yL7cCRWGWwTlSUM/Akr6L.imN6ZlrRERHY7.KLmjF9ii9T8Dyk58S', 'student', 1)
ON DUPLICATE KEY UPDATE email = email;

USE info_db;

-- Add student information records
-- Get user IDs from login_db
SET @john_user_id = (SELECT id FROM login_db.users WHERE email = 'john.doe@student.edu');
SET @jane_user_id = (SELECT id FROM login_db.users WHERE email = 'jane.smith@student.edu');

-- Insert student records
INSERT INTO students (user_id, bluegold_id, first_name, last_name, email, phone_number, address, city, state, zip_code, gpa, total_credits, account_balance, enrollment_date)
VALUES 
(@john_user_id, 'BG123456', 'John', 'Doe', 'john.doe@student.edu', '555-0101', '123 Main St', 'College Town', 'CA', '90210', 3.45, 60, 0.00, '2023-09-01'),
(@jane_user_id, 'BG789012', 'Jane', 'Smith', 'jane.smith@student.edu', '555-0102', '456 Oak Ave', 'University City', 'CA', '90211', 3.78, 45, 0.00, '2023-09-01')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Add a sample transaction
INSERT INTO transactions (user_id, transaction_type, description, created_at)
VALUES 
(@john_user_id, 'ENROLLMENT', 'Student enrolled in Fall 2023 semester', NOW()),
(@jane_user_id, 'ENROLLMENT', 'Student enrolled in Fall 2023 semester', NOW());

SELECT '=== TEST DATA CREATED ===' AS status;
SELECT '=== FACULTY LOGIN ===' AS info;
SELECT 'Email: faculty@university.edu' AS credentials;
SELECT 'Password: Faculty123!' AS credentials;
SELECT '=== STUDENT LOGINS ===' AS info;
SELECT 'Student 1 - Email: john.doe@student.edu | Password: Student123!' AS credentials;
SELECT 'Student 2 - Email: jane.smith@student.edu | Password: Student123!' AS credentials;

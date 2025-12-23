-- Complete Database Setup Script for Student Information System
-- Separated into login and information databases as per requirements
-- Run this in MySQL Shell after connecting: SOURCE setup-database.sql;

-- Create both databases
DROP DATABASE IF EXISTS login_db;
DROP DATABASE IF EXISTS info_db;
CREATE DATABASE login_db;
CREATE DATABASE info_db;

-- Create tables in login_db
USE login_db;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tables in info_db
USE info_db;
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bluegold_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    gpa DECIMAL(3, 2) DEFAULT 0.00,
    total_credits INT DEFAULT 0,
    account_balance DECIMAL(10, 2) DEFAULT 0.00,
    enrollment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    student_id INT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tuition_charges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    charged_by INT NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    due_date DATE,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create admin user in login database
USE login_db;
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@university.edu', '$2b$10$yL7cCRWGWwTlSUM/Akr6L.imN6ZlrRERHY7.KLmjF9ii9T8Dyk58S', 'admin');

USE login_db;
INSERT INTO users (username, email, password, role) 
VALUES ('$2b$10$J6rx3om26ZLp12szu5r8culeydupdABUiZtmvgoI.BEweJEAZPCgm', 'admin1@university.edu', '$2b$10$scTNHoNQshWviowSG6/TD.feu1DPedgwkmtMFKMJRuNVoT4FVUnr.', 'admin');

-- Verify setup and show credentials
SELECT '=== DATABASE SETUP COMPLETE ===' AS status;
SELECT '=== Login Database (login_db) ===' AS db_info;
SELECT id, username, email, role FROM login_db.users WHERE email = 'admin@university.edu';
SELECT '=== Information Database (info_db) ===' AS db_info;
SELECT id, user_id, bluegold_id, first_name, last_name, email FROM info_db.students LIMIT 5;

-- Show tables in both databases for verification
SELECT '=== TABLES IN LOGIN_DB ===' AS verification;
SHOW TABLES FROM login_db;
SELECT '=== TABLES IN INFO_DB ===' AS verification;
SHOW TABLES FROM info_db;

SELECT '=== DEFAULT ADMIN CREDENTIALS ===' AS info;
SELECT 'Email: admin@university.edu' AS credentials;
SELECT 'Password: Admin123!' AS credentials;
SELECT 'Access: http://localhost:4200/admin-dashboard' AS access;

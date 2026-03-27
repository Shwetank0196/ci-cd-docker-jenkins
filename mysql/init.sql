-- MySQL Initialization Script for Student Management System
-- This script runs automatically when the MySQL container starts for the first time

-- Use the student_management database
USE student_management;

-- Set proper charset and collation for the database
ALTER DATABASE student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create students table with MySQL-specific syntax
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
  class VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index on aadhaar_number for faster lookups
CREATE INDEX idx_aadhaar_number ON students(aadhaar_number);

-- Create index on created_at for faster ordering
CREATE INDEX idx_created_at ON students(created_at);

-- Insert some sample data for testing (optional)
INSERT IGNORE INTO students (name, age, father_name, aadhaar_number, class) VALUES
  ('Raj Kumar', 15, 'Suresh Kumar', '123456789012', '10th Grade'),
  ('Priya Singh', 17, 'Ramesh Singh', '234567890123', '12th Grade'),
  ('Amit Sharma', 16, 'Vijay Sharma', '345678901234', '11th Grade');

-- Grant necessary privileges to student_user (already done by MySQL init, but ensuring)
-- This is mainly for documentation purposes as the user creation is handled by environment variables
FLUSH PRIVILEGES;

-- Display success message
SELECT 'Student Management Database Initialized Successfully!' as Message;
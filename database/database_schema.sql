-- Gramin Healthcare Database Schema
-- MySQL Database Setup

-- Create Database
CREATE DATABASE IF NOT EXISTS gramin_healthcare;
USE gramin_healthcare;

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    village VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_village (village)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Doctors Table
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    fees DECIMAL(10, 2) NOT NULL CHECK (fees >= 0),
    available_days VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    seat_capacity INT NOT NULL CHECK (seat_capacity > 0),
    experience INT NOT NULL CHECK (experience >= 0),
    qualification VARCHAR(100) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_specialization (specialization),
    INDEX idx_location (location),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    booking_date DATE NOT NULL,
    token_number INT NOT NULL,
    fees DECIMAL(10, 2) NOT NULL,
    status ENUM('confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    UNIQUE KEY unique_token (doctor_id, booking_date, token_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Doctors Data
INSERT INTO doctors (name, specialization, location, contact_number, fees, available_days, start_time, end_time, seat_capacity, experience, qualification, rating) VALUES
('Dr. Rajesh Kumar', 'General Physician', 'Rampur Village', '9876543210', 150.00, 'Monday,Wednesday,Friday', '09:00:00', '17:00:00', 20, 15, 'MBBS, MD', 4.8),
('Dr. Priya Sharma', 'Pediatrician', 'Shivpur Village', '9876543211', 200.00, 'Tuesday,Thursday,Saturday', '10:00:00', '18:00:00', 15, 10, 'MBBS, MD (Pediatrics)', 4.9),
('Dr. Anamika Singh', 'Gynecologist', 'Lakshmipur Village', '9876543212', 300.00, 'Monday,Tuesday,Thursday', '09:00:00', '16:00:00', 12, 12, 'MBBS, MS (Gynecology)', 4.7),
('Dr. Sunil Verma', 'Dentist', 'Rampur Village', '9876543213', 250.00, 'Wednesday,Friday,Saturday', '11:00:00', '19:00:00', 18, 8, 'BDS, MDS', 4.6),
('Dr. Meera Devi', 'Ayurveda', 'Ganeshpur Village', '9876543214', 100.00, 'Monday,Tuesday,Wednesday,Thursday,Friday', '08:00:00', '14:00:00', 30, 25, 'BAMS, MD (Ayurveda)', 4.9),
('Dr. Vikram Patel', 'Cardiologist', 'Krishnapur Village', '9876543215', 500.00, 'Tuesday,Thursday', '14:00:00', '20:00:00', 8, 20, 'MBBS, MD (Cardiology)', 4.9),
('Dr. Kavita Rao', 'Dermatologist', 'Shivpur Village', '9876543216', 350.00, 'Wednesday,Saturday', '10:00:00', '17:00:00', 10, 7, 'MBBS, MD (Dermatology)', 4.5),
('Dr. Suresh Yadav', 'Orthopedic', 'Suryapur Village', '9876543217', 400.00, 'Monday,Friday', '09:00:00', '15:00:00', 15, 18, 'MBBS, MS (Orthopedics)', 4.8),
('Dr. Anita Devi', 'General Physician', 'Ganeshpur Village', '9876543218', 120.00, 'Tuesday,Wednesday,Thursday,Friday', '08:30:00', '16:30:00', 25, 10, 'MBBS', 4.6),
('Dr. Ramesh Prasad', 'Pediatrician', 'Lakshmipur Village', '9876543219', 180.00, 'Monday,Wednesday,Friday', '09:00:00', '17:00:00', 20, 12, 'MBBS, DCH', 4.7);
('Dr. Amit Barman', 'Neurologist', 'Ranjitpur Village', '9876543229', 2000.00, 'Monday,Friday', '09:00:00', '18:00:00', 20, 13, 'MBBS, MD Neurology', 4.7);


-- Create Views for Common Queries

-- View: Active Doctors Summary
CREATE VIEW active_doctors_summary AS
SELECT 
    id,
    name,
    specialization,
    location,
    fees,
    rating,
    experience,
    seat_capacity
FROM doctors
WHERE is_active = TRUE;

-- View: Today's Bookings
CREATE VIEW todays_bookings AS
SELECT 
    b.id,
    b.token_number,
    b.booking_date,
    b.status,
    u.name AS patient_name,
    u.phone AS patient_phone,
    d.name AS doctor_name,
    d.specialization,
    d.location
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN doctors d ON b.doctor_id = d.id
WHERE DATE(b.booking_date) = CURDATE();

-- View: Booking Statistics
CREATE VIEW booking_statistics AS
SELECT 
    d.id AS doctor_id,
    d.name AS doctor_name,
    d.specialization,
    COUNT(b.id) AS total_bookings,
    SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
    SUM(b.fees) AS total_revenue
FROM doctors d
LEFT JOIN bookings b ON d.id = b.doctor_id
GROUP BY d.id, d.name, d.specialization;

-- Create Stored Procedures

-- Procedure: Check Seat Availability
DELIMITER //
CREATE PROCEDURE CheckSeatAvailability(
    IN p_doctor_id INT,
    IN p_booking_date DATE
)
BEGIN
    SELECT 
        d.name AS doctor_name,
        d.specialization,
        d.seat_capacity,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS booked_seats,
        (d.seat_capacity - COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)) AS available_seats,
        CASE 
            WHEN (d.seat_capacity - COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)) > 0 
            THEN 'Available' 
            ELSE 'Full' 
        END AS availability_status
    FROM doctors d
    LEFT JOIN bookings b ON d.id = b.doctor_id 
        AND b.booking_date = p_booking_date 
        AND b.status = 'confirmed'
    WHERE d.id = p_doctor_id
    GROUP BY d.id, d.name, d.specialization, d.seat_capacity;
END //
DELIMITER ;

-- Procedure: Generate Token
DELIMITER //
CREATE PROCEDURE GenerateToken(
    IN p_doctor_id INT,
    IN p_booking_date DATE,
    OUT p_token_number INT
)
BEGIN
    DECLARE max_token INT;
    
    -- Get the maximum token number for that doctor on that date
    SELECT COALESCE(MAX(token_number), 0) INTO max_token
    FROM bookings
    WHERE doctor_id = p_doctor_id 
      AND booking_date = p_booking_date 
      AND status = 'confirmed';
    
    -- Generate new token (increment by 1)
    SET p_token_number = max_token + 1;
END //
DELIMITER ;

-- Triggers

-- Trigger: Update seat monitoring (for analytics)
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    -- This trigger can be used for logging or analytics
    INSERT INTO audit_log (event_type, table_name, record_id, action, timestamp)
    VALUES ('BOOKING', 'bookings', NEW.id, 'INSERT', NOW());
END;

-- Create audit_log table for tracking
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Grant Permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON gramin_healthcare.* TO 'healthcare_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Display Setup Summary
SELECT 'Database setup completed successfully!' AS message;
SELECT COUNT(*) AS total_doctors FROM doctors;
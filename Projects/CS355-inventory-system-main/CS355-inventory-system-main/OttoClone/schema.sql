-- MySQL schema for Inventory Management System with roles
CREATE DATABASE IF NOT EXISTS ims;

USE ims;

CREATE TABLE
    IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM ('Admin', 'Manager', 'Worker') NOT NULL DEFAULT 'Worker'
    );

CREATE TABLE
    IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        category VARCHAR(50),
        location VARCHAR(100),
        purchase_price DECIMAL(10, 2),
        sale_price DECIMAL(10, 2),
        quantity INT
    );

CREATE TABLE
    IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT,
        username VARCHAR(50),
        updated_category VARCHAR(50),
        previous_value TEXT,
        updated_value TEXT,
        timestamp DATETIME,
        FOREIGN KEY (item_id) REFERENCES items (id)
    );
CREATE DATABASE campus_marketplace;

\c campus_marketplace

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(8) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(10),
  password VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255)
);



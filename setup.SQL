CREATE DATABASE marketplace;
\c marketplace
CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
    user_id INTEGER,
	title VARCHAR(20),
	post_desription VARCHAR(500),
	time_posted TIMESTAMP 
);

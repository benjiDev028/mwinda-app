CREATE SEQUENCE barcode_seq START WITH 120000001;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    password_salt VARCHAR NOT NULL,
    date_birth VARCHAR,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR DEFAULT 'client',
    pointstudios INT DEFAULT 0,
    pointevents INT DEFAULT 0,
    barcode INT DEFAULT nextval('barcode_seq'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL,
    code VARCHAR NOT NULL
);

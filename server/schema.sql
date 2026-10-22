-- ============================================================================
-- FoodLoop: Surplus Food Rescue & Community Donation Platform
-- Relational Database Schema (PostgreSQL)
-- ============================================================================

-- Drop existing tables in reverse dependency order if resetting
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS donation_requests CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Stores user identity, credentials, roles, and account status
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(128) UNIQUE NOT NULL, -- Firebase UID or auth identifier
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Optional bcrypt hash when using native password auth
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('donor', 'recipient', 'volunteer', 'admin')),
    phone VARCHAR(32),
    location VARCHAR(255),
    account_status VARCHAR(32) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_approval')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 2. ORGANIZATIONS TABLE
-- Recipient organizations (orphanages, shelters, NGOs) and donor entities
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    org_type VARCHAR(64) NOT NULL CHECK (org_type IN ('Orphanage', 'NGO', 'Shelter', 'Community Kitchen', 'Food Bank', 'Restaurant', 'College Canteen', 'Hostel', 'Event Organizer')),
    registration_number VARCHAR(128),
    contact_person VARCHAR(150) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    general_location VARCHAR(255) NOT NULL,
    full_address TEXT,
    beneficiaries_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_user ON organizations(user_id);
CREATE INDEX idx_organizations_type ON organizations(org_type);
CREATE INDEX idx_organizations_verified ON organizations(is_verified);

-- 3. DONATIONS TABLE
-- Surplus food postings published by food donors
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    food_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Cooked Meals', 'Bakery & Bread', 'Fresh Produce', 'Dairy & Packaged', 'Beverages', 'Desserts & Snacks')),
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
    original_quantity NUMERIC(10, 2) NOT NULL CHECK (original_quantity > 0),
    unit VARCHAR(32) NOT NULL, -- e.g. 'kg', 'meals', 'boxes', 'litres'
    pickup_location VARCHAR(255) NOT NULL, -- General area for public view
    pickup_address_details TEXT, -- Exact street / door details (unlocked on accepted request)
    prep_time TIMESTAMP WITH TIME ZONE,
    pickup_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    storage_conditions VARCHAR(64) DEFAULT 'Room Temperature' CHECK (storage_conditions IN ('Refrigerated', 'Room Temperature', 'Heated/Insulated', 'Frozen')),
    allergens VARCHAR(255) DEFAULT 'None',
    status VARCHAR(32) DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Completed', 'Expired', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_category ON donations(category);
CREATE INDEX idx_donations_deadline ON donations(pickup_deadline);
CREATE INDEX idx_donations_donor ON donations(donor_id);

-- 4. DONATION REQUESTS TABLE
-- Claims made by recipient organizations
CREATE TABLE donation_requests (
    id SERIAL PRIMARY KEY,
    donation_id INTEGER NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    requested_quantity NUMERIC(10, 2) NOT NULL CHECK (requested_quantity > 0),
    intended_collection_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Cancelled', 'Collected', 'Completed')),
    volunteer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_donation ON donation_requests(donation_id);
CREATE INDEX idx_requests_recipient ON donation_requests(recipient_id);
CREATE INDEX idx_requests_status ON donation_requests(status);

-- 5. CONVERSATIONS TABLE
-- Links a communication thread to a donation request
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL UNIQUE REFERENCES donation_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_request ON conversations(request_id);

-- 6. MESSAGES TABLE
-- Individual messages exchanged between donor, recipient, and volunteer
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(32) NOT NULL CHECK (sender_role IN ('donor', 'recipient', 'volunteer')),
    message_text TEXT NOT NULL,
    is_status_update BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- 7. COLLECTIONS & LOGISTICS TABLE
-- Tracking handover and optional volunteer delivery assistance
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL UNIQUE REFERENCES donation_requests(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    volunteer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    handover_status VARCHAR(32) DEFAULT 'Scheduled' CHECK (handover_status IN ('Scheduled', 'In Transit', 'Handed Over', 'Confirmed Completed', 'Cancelled')),
    donor_confirmed BOOLEAN DEFAULT FALSE,
    recipient_confirmed BOOLEAN DEFAULT FALSE,
    collection_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collections_request ON collections(request_id);
CREATE INDEX idx_collections_volunteer ON collections(volunteer_id);
CREATE INDEX idx_collections_status ON collections(handover_status);

-- 8. OPTIONAL AUDIT & SAFETY REPORTING
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    donation_id INTEGER NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(128) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_donations_timestamp
BEFORE UPDATE ON donations
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_requests_timestamp
BEFORE UPDATE ON donation_requests
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

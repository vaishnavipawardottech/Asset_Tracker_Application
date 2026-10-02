CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (email, password_hash)
VALUES (
    'pawarvaishnavi.3010@gmail.com',
    crypt('vaishnavi@test', gen_salt('bf', 12))
)
ON CONFLICT (email) DO NOTHING;


INSERT INTO assets
    (name, type, serial_number, assigned_to, status, purchase_date)
VALUES
    ('Dell Latitude 5440', 'Laptop', 'DL-001', 'Vaishnavi', 'Assigned', '2026-01-15'),
    ('HP Monitor', 'Monitor', 'HP-001', 'Amit', 'Assigned', '2026-02-10'),
    ('Server-01', 'Server', 'SRV-001', NULL, 'Available', '2026-03-05');
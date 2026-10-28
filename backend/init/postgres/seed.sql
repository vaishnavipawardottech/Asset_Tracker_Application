-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- INSERT INTO users (email, password_hash)
-- VALUES (
--     'pawarvaishnavi.3010@gmail.com',
--     crypt('vaishnavi@test', gen_salt('bf', 12))
-- )
-- ON CONFLICT (email) DO NOTHING;


-- INSERT INTO assets
--     (name, type, serial_number, assigned_to, status, purchase_date)
-- VALUES
--     ('Dell Latitude 5440', 'Laptop', 'DL-001', 'Vaishnavi', 'Assigned', '2026-01-15'),
--     ('HP Monitor', 'Monitor', 'HP-001', 'Vaishnavi', 'Assigned', '2026-02-10'),
--     ('Server-01', 'Server', 'SRV-001', NULL, 'Available', '2026-03-05');



-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Seed a test user
-- Email: pawarvaishnavi.3010@gmail.com
-- Password: vaishnavi@test

INSERT INTO users (email, password_hash)
VALUES (
    'pawarvaishnavi.3010@gmail.com',
    crypt('vaishnavi@test', gen_salt('bf', 12))
)
ON CONFLICT (email) DO NOTHING;


-- 2. Seed employees
INSERT INTO employees (name, email, phone, department, designation)
VALUES
    ('Akash Verma', 'akash.verma@example.com',
     '9876543210', 'Engineering', 'Software Engineer'),
    ('Riya Agarwal', 'riya.agarwal@example.com',
     '9876543211', 'IT', 'System Administrator'),
    ('Nisha Patil', 'nisha.patil@example.com',
     '9876543212', 'HR', 'HR Executive')
ON CONFLICT (email) DO NOTHING;


-- 3. Seed assets and link them to employees
INSERT INTO assets
    (name, type, serial_number, assigned_to, status, purchase_date, employee_id)
VALUES
    (
        'Dell Latitude 5440',
        'Laptop',
        'DL-001',
        'Akash Verma',
        'Assigned',
        '2026-01-15',
        (SELECT id FROM employees
         WHERE email = 'akash.verma@example.com')
    ),
    (
        'HP Monitor',
        'Monitor',
        'HP-001',
        'Akash Verma',
        'Assigned',
        '2026-02-10',
        (SELECT id FROM employees
         WHERE email = 'akash.verma@example.com')
    ),
    (
        'Server-01',
        'Server',
        'SRV-001',
        NULL,
        'Available',
        '2026-03-05',
        NULL
    ),
    (
        'Lenovo ThinkPad',
        'Laptop',
        'LEN-001',
        'Riya Agarwal',
        'Assigned',
        '2026-04-12',
        (SELECT id FROM employees
         WHERE email = 'riya.agarwal@example.com')
    ),
    (
        'HP LaserJet',
        'Printer',
        'HP-PR-001',
        NULL,
        'Maintenance',
        '2026-05-20',
        NULL
    )
ON CONFLICT (serial_number) DO NOTHING;

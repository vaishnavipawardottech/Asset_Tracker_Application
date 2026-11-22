-- -- Enable pgcrypto for password hashing
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -- 1. Seed a test user
-- -- Email: pawarvaishnavi.3010@gmail.com
-- -- Password: vaishnavi@test

-- INSERT INTO admin (email, password_hash)
-- VALUES (
--     'pawarvaishnavi.3010@gmail.com',
--     crypt('vaishnavi@test', gen_salt('bf', 12))
-- )
-- ON CONFLICT (email) DO NOTHING;


-- -- 2. Seed employees
-- INSERT INTO employees
--     (name, email, password_hash, phone, department, designation)
-- VALUES
--     ('Akash Sharma', 'akash.sharma@example.com',
--      crypt('employee@test', gen_salt('bf', 12)),
--      '9876543210', 'Engineering', 'Software Engineer'),
--     ('Riya Agarwal', 'riya.agarwal@example.com',
--      crypt('employee@test', gen_salt('bf', 12)),
--      '9876543211', 'IT', 'System Administrator'),
--     ('Nisha Patil', 'nisha.patil@example.com',
--      crypt('employee@test', gen_salt('bf', 12)),
--      '9876543212', 'HR', 'HR Executive')
-- ON CONFLICT (email) DO NOTHING;


-- -- 3. Seed assets and link them to employees
-- INSERT INTO assets
--     (name, type, serial_number, assigned_to, status, purchase_date, employee_id)
-- VALUES
--     (
--         'Dell Latitude 5440',
--         'Laptop',
--         'DL-001',
--         'Akash Sharma',
--         'Assigned',
--         '2026-01-15',
--         (SELECT id FROM employees
--          WHERE email = 'akash.sharma@example.com')
--     ),
--     (
--         'HP Monitor',
--         'Monitor',
--         'HP-001',
--         'Akash Sharma',
--         'Assigned',
--         '2026-02-10',
--         (SELECT id FROM employees
--          WHERE email = 'akash.sharma@example.com')
--     ),
--     (
--         'Server-01',
--         'Server',
--         'SRV-001',
--         NULL,
--         'Available',
--         '2026-03-05',
--         NULL
--     ),
--     (
--         'Lenovo ThinkPad',
--         'Laptop',
--         'LEN-001',
--         'Riya Agarwal',
--         'Assigned',
--         '2026-04-12',
--         (SELECT id FROM employees
--          WHERE email = 'riya.agarwal@example.com')
--     ),
--     (
--         'HP LaserJet',
--         'Printer',
--         'HP-PR-001',
--         NULL,
--         'Maintenance',
--         '2026-05-20',
--         NULL
--     )
-- ON CONFLICT (serial_number) DO NOTHING;



-- ============================================
-- ASSET TRACKER - INITIAL DATABASE SEED
-- ============================================

-- 1. Collect Super Admin details
-- Super Admin initial credentials

\set admin_name 'Vaishnavi Pawar'
\set admin_email 'pawarvaishnavi.3010@gmail.com'
\set admin_password 'ChangeThisPassword123!'

-- 2. Enable password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- ============================================
-- 3. DEFAULT DEPARTMENTS
-- ============================================

INSERT INTO departments (name, description)
VALUES
    ('IT', 'Information Technology Department'),
    ('Engineering', 'Software and Engineering Department'),
    ('Human Resources', 'Human Resources Department'),
    ('Finance', 'Finance and Accounting Department'),
    ('Operations', 'Business Operations Department')
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- 4. DEFAULT ROLES
-- ============================================

INSERT INTO roles (name, description)
VALUES
    ('EMPLOYEE', 'Regular employee with access to personal assets and requests'),

    ('MANAGER', 'Manager responsible for employees and request approvals'),

    ('IT_ADMIN', 'IT administrator responsible for assets and request processing'),

    ('SUPER_ADMIN', 'Application owner with complete administrative access')

ON CONFLICT (name)
DO UPDATE SET description = EXCLUDED.description;


-- ============================================
-- 5. DEFAULT PERMISSIONS
-- ============================================

INSERT INTO permissions (name, description)
VALUES

    -- Asset permissions
    ('asset.view_own', 'View assets assigned to the logged-in user'),
    ('asset.view_all', 'View all organizational assets'),
    ('asset.create', 'Create new assets'),
    ('asset.update', 'Update asset information'),
    ('asset.assign', 'Assign assets to employees'),

    -- Request permissions
    ('request.create', 'Create asset and maintenance requests'),
    ('request.view_own', 'View requests created by the logged-in user'),
    ('request.view_department', 'View requests from the manager department or reports'),
    ('request.view_all', 'View all organizational requests'),
    ('request.approve', 'Approve employee requests'),
    ('request.reject', 'Reject employee requests'),
    ('request.assign', 'Assign requests to IT handlers'),
    ('request.resolve', 'Process and resolve requests'),
    ('request.comment', 'Add comments to requests'),

    -- Employee permissions
    ('employee.view_department', 'View employees within the permitted department'),
    ('employee.create_department', 'Create employees within the permitted department'),

    -- Administrative permissions
    ('department.manage', 'Create and manage departments'),
    ('user.manage', 'Manage organizational user accounts'),
    ('role.manage', 'Create and manage roles'),
    ('permission.manage', 'Manage application permissions')

ON CONFLICT (name)
DO UPDATE SET description = EXCLUDED.description;


-- ============================================
-- 6. ROLE-PERMISSION MAPPINGS
-- ============================================

-- EMPLOYEE permissions

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'EMPLOYEE'
AND p.name IN (
    'asset.view_own',
    'request.create',
    'request.view_own',
    'request.comment'
)
ON CONFLICT DO NOTHING;


-- MANAGER permissions

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'MANAGER'
AND p.name IN (
    'employee.view_department',
    'employee.create_department',
    'request.view_department',
    'request.approve',
    'request.reject',
    'request.comment'
)
ON CONFLICT DO NOTHING;


-- IT_ADMIN permissions

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'IT_ADMIN'
AND p.name IN (
    'asset.view_all',
    'asset.create',
    'asset.update',
    'asset.assign',
    'request.view_all',
    'request.assign',
    'request.resolve',
    'request.comment'
)
ON CONFLICT DO NOTHING;


-- SUPER_ADMIN gets every defined permission

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;


-- ============================================
-- 7. CREATE FIRST SUPER ADMIN ACCOUNT
-- ============================================

-- Password is hashed using bcrypt-compatible
-- Blowfish hashing through PostgreSQL pgcrypto.

WITH created_admin AS (
    INSERT INTO users (
        name,
        email,
        password_hash,
        designation,
        is_active
    )
    VALUES (
        :'admin_name',
        :'admin_email',
        crypt(:'admin_password', gen_salt('bf', 12)),
        'Application Owner',
        TRUE
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id
)

INSERT INTO user_roles (user_id, role_id)
SELECT ca.id, r.id
FROM created_admin ca
JOIN roles r ON r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;


COMMIT;


-- ============================================
-- 8. VERIFY SEED DATA
-- ============================================

-- Display roles
SELECT id, name, description
FROM roles
ORDER BY id;

-- Display departments
SELECT id, name
FROM departments
ORDER BY id;

-- Display Super Admin account and assigned roles
SELECT
    u.id,
    u.name,
    u.email,
    r.name AS role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = :'admin_email';

-- Display role permissions
SELECT
    r.name AS role,
    p.name AS permission
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
ORDER BY r.name, p.name;

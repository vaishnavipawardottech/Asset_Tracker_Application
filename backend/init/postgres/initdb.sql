-- CREATE TABLE IF NOT EXISTS admin (
--     id SERIAL PRIMARY KEY,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash TEXT NOT NULL,
--     refresh_token TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS employees (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(150) NOT NULL UNIQUE,
--     password_hash TEXT NOT NULL,
--     refresh_token TEXT,
--     phone VARCHAR(20),
--     department VARCHAR(100),
--     designation VARCHAR(100),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- CREATE TABLE IF NOT EXISTS assets (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     type VARCHAR(50) NOT NULL,
--     serial_number VARCHAR(100) UNIQUE NOT NULL,
--     assigned_to VARCHAR(100),
--     status VARCHAR(30) NOT NULL,
--     purchase_date DATE,
--     employee_id INTEGER REFERENCES employees(id),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );



CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    -- Authentication fields
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    refresh_token TEXT,

    -- Employee profile fields
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),

    department_id INTEGER
        REFERENCES departments(id),

    designation VARCHAR(100),

    -- Reporting hierarchy
    manager_id INTEGER
        REFERENCES users(id),

    -- Account management
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    role_id INTEGER NOT NULL
        REFERENCES roles(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL
        REFERENCES roles(id) ON DELETE CASCADE,

    permission_id INTEGER NOT NULL
        REFERENCES permissions(id) ON DELETE CASCADE,

    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    type VARCHAR(50) NOT NULL,

    serial_number VARCHAR(100) UNIQUE NOT NULL,

    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'AVAILABLE',
                'ASSIGNED',
                'UNDER_MAINTENANCE',
                'RETIRED',
                'LOST'
            )
        ),

    purchase_date DATE,

    employee_id INTEGER
        REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,

    request_number VARCHAR(30) UNIQUE NOT NULL,

    subject VARCHAR(200) NOT NULL,

    description TEXT,

    request_type VARCHAR(30) NOT NULL
        CHECK (
            request_type IN (
                'ASSET_REQUEST',
                'MAINTENANCE'
            )
        ),

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL'
        CHECK (
            status IN (
                'PENDING_APPROVAL',
                'APPROVED',
                'REJECTED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED'
            )
        ),

    priority VARCHAR(20) DEFAULT 'MEDIUM'
        CHECK (
            priority IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'URGENT'
            )
        ),

    requested_by INTEGER NOT NULL
        REFERENCES users(id),

    requested_for INTEGER
         REFERENCES users(id),

    assigned_to INTEGER
        REFERENCES users(id),

    department_id INTEGER
        REFERENCES departments(id),

    asset_id INTEGER
        REFERENCES assets(id),

    requested_asset_type VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    closed_at TIMESTAMP,

    CHECK (
        (
            request_type = 'MAINTENANCE'
            AND asset_id IS NOT NULL
            AND requested_asset_type IS NULL
        )
        OR
        (
            request_type = 'ASSET_REQUEST'
            AND requested_asset_type IS NOT NULL
            AND asset_id IS NULL
        )
    )
);

CREATE TABLE request_approvals (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES requests(id) ON DELETE CASCADE,

    approver_id INTEGER NOT NULL
        REFERENCES users(id),

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED'
            )
        ),

    comments TEXT,

    decided_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE request_comments (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES requests(id) ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id),

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE request_history (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES requests(id) ON DELETE CASCADE,

    changed_by INTEGER NOT NULL
        REFERENCES users(id),

    old_status VARCHAR(30),

    new_status VARCHAR(30),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

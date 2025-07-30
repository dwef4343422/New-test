#!/usr/bin/env python3
"""
Database Schema Fix Script for Pharmacovigilance Iraq Platform
This script adds missing columns to the PostgreSQL database tables.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_database_url():
    """Get database URL from environment variables."""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("DATABASE_URL environment variable not found")
        sys.exit(1)
    
    # Fix postgres:// to postgresql:// for SQLAlchemy compatibility
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    return database_url

def check_column_exists(engine, table_name, column_name):
    """Check if a column exists in a table."""
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        logger.warning(f"Could not inspect table {table_name}: {e}")
        return False

def add_missing_columns(engine):
    """Add missing columns to database tables."""
    
    # Define missing columns for each table
    missing_columns = {
        'educational_content': [
            ('title_en', 'VARCHAR(200)'),
            ('title_ku', 'VARCHAR(200)'),
            ('content_en', 'TEXT'),
            ('content_ku', 'TEXT')
        ],
        'faqs': [
            ('question_en', 'TEXT'),
            ('question_ku', 'TEXT'),
            ('answer_en', 'TEXT'),
            ('answer_ku', 'TEXT')
        ],
        'drug_alerts': [
            ('title_en', 'VARCHAR(200)'),
            ('title_ku', 'VARCHAR(200)'),
            ('content_en', 'TEXT'),
            ('content_ku', 'TEXT')
        ],
        'system_logs': [
            ('resource_type', 'VARCHAR(50)'),
            ('resource_id', 'VARCHAR(50)'),
            ('details', 'TEXT'),
            ('ip_address', 'VARCHAR(45)'),
            ('user_agent', 'TEXT'),
            ('timestamp', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
        ]
    }
    
    with engine.connect() as conn:
        for table_name, columns in missing_columns.items():
            logger.info(f"Checking table: {table_name}")
            
            for column_name, column_type in columns:
                if not check_column_exists(engine, table_name, column_name):
                    try:
                        sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                        conn.execute(text(sql))
                        conn.commit()
                        logger.info(f"Added column {column_name} to {table_name}")
                    except SQLAlchemyError as e:
                        if "already exists" in str(e).lower():
                            logger.info(f"Column {column_name} already exists in {table_name}")
                        else:
                            logger.error(f"Error adding column {column_name} to {table_name}: {e}")
                else:
                    logger.info(f"Column {column_name} already exists in {table_name}")

def create_missing_tables(engine):
    """Create any missing tables."""
    
    # Check if tables exist and create them if they don't
    table_creation_sql = {
        'users': '''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                full_name VARCHAR(100),
                department VARCHAR(100),
                phone VARCHAR(20),
                is_active BOOLEAN DEFAULT true,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''',
        'faqs': '''
            CREATE TABLE IF NOT EXISTS faqs (
                id SERIAL PRIMARY KEY,
                question_ar TEXT NOT NULL,
                question_en TEXT,
                question_ku TEXT,
                answer_ar TEXT NOT NULL,
                answer_en TEXT,
                answer_ku TEXT,
                category VARCHAR(50),
                order_index INTEGER,
                is_active BOOLEAN DEFAULT true,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''',
        'drug_alerts': '''
            CREATE TABLE IF NOT EXISTS drug_alerts (
                id SERIAL PRIMARY KEY,
                title_ar VARCHAR(200) NOT NULL,
                title_en VARCHAR(200),
                title_ku VARCHAR(200),
                content_ar TEXT NOT NULL,
                content_en TEXT,
                content_ku TEXT,
                drug_name VARCHAR(200),
                alert_type VARCHAR(50),
                severity VARCHAR(20),
                manufacturer VARCHAR(200),
                batch_numbers TEXT,
                expiry_date DATE,
                is_active BOOLEAN DEFAULT true,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        ''',
        'educational_content': '''
            CREATE TABLE IF NOT EXISTS educational_content (
                id SERIAL PRIMARY KEY,
                title_ar VARCHAR(200) NOT NULL,
                title_en VARCHAR(200),
                title_ku VARCHAR(200),
                content_ar TEXT NOT NULL,
                content_en TEXT,
                content_ku TEXT,
                category VARCHAR(50),
                target_audience VARCHAR(50),
                is_active BOOLEAN DEFAULT true,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        ''',
        'system_logs': '''
            CREATE TABLE IF NOT EXISTS system_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50),
                resource_id VARCHAR(50),
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        '''
    }
    
    with engine.connect() as conn:
        for table_name, sql in table_creation_sql.items():
            try:
                conn.execute(text(sql))
                conn.commit()
                logger.info(f"Ensured table {table_name} exists")
            except SQLAlchemyError as e:
                logger.error(f"Error creating table {table_name}: {e}")

def main():
    """Main function to fix database schema."""
    logger.info("Starting database schema fix...")
    
    try:
        # Get database connection
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
        
        # Create missing tables
        create_missing_tables(engine)
        
        # Add missing columns
        add_missing_columns(engine)
        
        logger.info("Database schema fix completed successfully")
        
    except Exception as e:
        logger.error(f"Database schema fix failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
WSGI Configuration for Pharmacovigilance Iraq Platform
Production-ready WSGI server configuration for Render.com deployment
"""

import os
from app import app

if __name__ == "__main__":
    # Get port from environment variable or default to 10000
    port = int(os.environ.get('PORT', 10000))
    
    # Run the application
    app.run(host='0.0.0.0', port=port, debug=False)
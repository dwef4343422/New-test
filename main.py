#!/usr/bin/env python3
"""
Main entry point for the Pharmacovigal Inc website deployment.
This file is required for the deployment service.
"""

import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app from app.py
from app import app

if __name__ == "__main__":
    # Get port from environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    
    # Run the application
    app.run(host="0.0.0.0", port=port, debug=False)


#!/usr/bin/env python3
"""
Installation script for Pharmacovigilance Iraq Platform
This script installs all required dependencies and sets up the environment
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Installing Pharmacovigilance Iraq Platform Dependencies")
    print("=" * 60)
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detected")
    
    # Install pip if not available
    try:
        import pip
        print("✅ pip is available")
    except ImportError:
        print("❌ pip is not available. Please install pip first.")
        sys.exit(1)
    
    # Upgrade pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        print("⚠️ Failed to upgrade pip, continuing anyway...")
    
    # Install requirements
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing Python packages"):
        print("❌ Failed to install requirements. Please check your internet connection and try again.")
        sys.exit(1)
    
    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        print("🔄 Creating .env file from template...")
        try:
            with open('.env.example', 'r') as example_file:
                content = example_file.read()
            
            with open('.env', 'w') as env_file:
                env_file.write(content)
            
            print("✅ .env file created successfully")
            print("⚠️  IMPORTANT: Please edit .env file with your actual configuration values")
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
    else:
        print("✅ .env file already exists")
    
    print("\n" + "=" * 60)
    print("🎉 Installation completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your configuration")
    print("2. Set up your database (PostgreSQL recommended)")
    print("3. Configure Google Sheets API credentials (optional)")
    print("4. Run: python app.py")
    print("\n🔗 For more information, see README.md")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
DayScore AI Service Startup Script
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        # Try py command first (Windows Python Launcher)
        subprocess.check_call([
            "py", "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ All packages installed successfully")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            # Fallback to python command
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
            ])
            print("✅ All packages installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install packages: {e}")
            return False

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting DayScore AI Service...")
    try:
        # Try py command first
        subprocess.run([
            "py", "-m", "uvicorn", "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except FileNotFoundError:
        try:
            # Fallback to python command
            subprocess.run([
                sys.executable, "-m", "uvicorn", "main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000", 
                "--reload"
            ])
        except KeyboardInterrupt:
            print("\n👋 DayScore AI Service stopped")
        except Exception as e:
            print(f"❌ Failed to start server: {e}")
    except KeyboardInterrupt:
        print("\n👋 DayScore AI Service stopped")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

def main():
    """Main startup function"""
    print("🧠 DayScore AI Service - Python Edition")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
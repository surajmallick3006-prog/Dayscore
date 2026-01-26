#!/usr/bin/env python3
"""
DayScore - Start All Services
Starts both the Node.js server and Python AI service
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def start_node_server():
    """Start the Node.js server"""
    print("🚀 Starting Node.js server...")
    try:
        return subprocess.Popen(
            ["node", "index-simple.js"],
            cwd="server",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except Exception as e:
        print(f"❌ Failed to start Node.js server: {e}")
        return None

def start_python_ai():
    """Start the Python AI service"""
    print("🧠 Starting Python AI service...")
    try:
        # Try py command first (Windows Python Launcher)
        return subprocess.Popen(
            ["py", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
            cwd="ai-service",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except FileNotFoundError:
        try:
            # Fallback to python command
            return subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
                cwd="ai-service",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        except Exception as e:
            print(f"❌ Failed to start Python AI service: {e}")
            return None
    except Exception as e:
        print(f"❌ Failed to start Python AI service: {e}")
        return None

def start_react_client():
    """Start the React client"""
    print("⚛️ Starting React client...")
    try:
        return subprocess.Popen(
            ["npm", "start"],
            cwd="client",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except Exception as e:
        print(f"❌ Failed to start React client: {e}")
        return None

def main():
    """Main function to start all services"""
    print("🎯 DayScore - Starting All Services")
    print("=" * 50)
    
    processes = []
    
    try:
        # Start Node.js server
        node_process = start_node_server()
        if node_process:
            processes.append(("Node.js Server", node_process))
            time.sleep(2)
        
        # Start Python AI service
        python_process = start_python_ai()
        if python_process:
            processes.append(("Python AI Service", python_process))
            time.sleep(3)
        
        # Start React client
        react_process = start_react_client()
        if react_process:
            processes.append(("React Client", react_process))
            time.sleep(2)
        
        print("\n✅ All services started successfully!")
        print("\n🌐 Access your application:")
        print("   Frontend: http://localhost:3000")
        print("   Backend:  http://localhost:5000")
        print("   AI API:   http://localhost:8000")
        print("\n📊 AI Endpoints:")
        print("   Health Check:  http://localhost:8000/health")
        print("\n🔧 Integrated Endpoint:")
        print("   Python AI via Node: http://localhost:5000/api/ai/python-analysis")
        
        print("\n⏹️  Press Ctrl+C to stop all services")
        
        # Wait for keyboard interrupt
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping all services...")
        
        # Terminate all processes
        for name, process in processes:
            try:
                print(f"   Stopping {name}...")
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"   Force killing {name}...")
                process.kill()
            except Exception as e:
                print(f"   Error stopping {name}: {e}")
        
        print("👋 All services stopped successfully!")

if __name__ == "__main__":
    main()
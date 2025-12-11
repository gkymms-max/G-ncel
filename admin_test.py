#!/usr/bin/env python3

import requests
import sys
import json

class AdminLoginTester:
    def __init__(self, base_url="https://quotecraft-42.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None

    def test_admin_login(self):
        """Test admin user login"""
        # Try to login with admin credentials
        data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/login", json=data)
            
            if response.status_code == 200:
                response_data = response.json()
                if 'access_token' in response_data and response_data.get('role') == 'admin':
                    print("✅ Admin login successful")
                    print(f"   Role: {response_data.get('role')}")
                    print(f"   Token: {response_data.get('access_token')[:20]}...")
                    return True
                else:
                    print("❌ Admin login failed - Invalid response format")
                    print(f"   Response: {response_data}")
                    return False
            else:
                print(f"❌ Admin login failed - Status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Admin login failed - Exception: {str(e)}")
            return False

    def create_admin_user(self):
        """Create admin user if it doesn't exist"""
        data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/register", json=data)
            
            if response.status_code == 200:
                response_data = response.json()
                if response_data.get('role') == 'admin':
                    print("✅ Admin user created successfully")
                    return True
                else:
                    print("❌ User created but not as admin")
                    return False
            else:
                print(f"❌ Admin user creation failed - Status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Admin user creation failed - Exception: {str(e)}")
            return False

def main():
    print("🔐 Testing Admin User Access...")
    print("=" * 50)
    
    tester = AdminLoginTester()
    
    # First try to login with existing admin
    if tester.test_admin_login():
        print("✅ Admin user exists and login works")
        return 0
    else:
        print("⚠️  Admin login failed, trying to create admin user...")
        if tester.create_admin_user():
            print("✅ Admin user created, testing login again...")
            if tester.test_admin_login():
                print("✅ Admin setup complete")
                return 0
            else:
                print("❌ Admin login still fails after creation")
                return 1
        else:
            print("❌ Failed to create admin user")
            return 1

if __name__ == "__main__":
    sys.exit(main())
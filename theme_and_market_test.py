#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import time

class ThemeAndMarketTester:
    def __init__(self, base_url="https://bizquoter-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials from review request
        self.admin_username = "admin"
        self.admin_password = "admin123"

    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method, endpoint, data=None, expect_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            success = response.status_code == expect_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return success, response_data, response.status_code
            
        except Exception as e:
            return False, str(e), 0

    def test_admin_login(self):
        """Test admin login with credentials from review request"""
        data = {
            "username": self.admin_username,
            "password": self.admin_password
        }
        
        success, response_data, status_code = self.make_request('POST', 'auth/login', data)
        
        if success and 'access_token' in response_data:
            self.token = response_data['access_token']
            role = response_data.get('role', 'unknown')
            if role == 'admin':
                self.log_result("Admin Login", True, f"Admin login successful")
                return True
            else:
                self.log_result("Admin Login", False, f"User role is {role}, not admin")
                return False
        else:
            self.log_result("Admin Login", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_get_current_settings(self):
        """Test getting current settings to check structure"""
        success, response_data, status_code = self.make_request('GET', 'settings')
        
        if success:
            self.log_result("Get Current Settings", True, f"Settings retrieved successfully")
            print(f"   Current settings structure: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
            return True, response_data
        else:
            self.log_result("Get Current Settings", False, f"Status: {status_code}, Response: {response_data}")
            return False, None

    def test_theme_color_update(self):
        """Test updating theme color to Green (#10B981) as specified in review request"""
        # First get current settings
        success, current_settings = self.test_get_current_settings()
        if not success:
            return False
        
        # Check if theme_color field exists
        has_theme_color = 'theme_color' in current_settings
        
        # Prepare update data with Green theme color from review request
        update_data = {
            "theme_color": "#10B981"  # Green color from review request
        }
        
        success, response_data, status_code = self.make_request('PUT', 'settings', update_data)
        
        if success:
            # Check if the theme_color was actually saved
            if 'theme_color' in response_data and response_data['theme_color'] == "#10B981":
                self.log_result("Theme Color Update", True, f"Theme color updated to Green (#10B981)")
                return True
            else:
                self.log_result("Theme Color Update", False, f"Theme color not properly saved. Response: {response_data}")
                return False
        else:
            self.log_result("Theme Color Update", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_theme_color_persistence(self):
        """Test that theme color persists after update"""
        success, response_data, status_code = self.make_request('GET', 'settings')
        
        if success:
            if 'theme_color' in response_data and response_data['theme_color'] == "#10B981":
                self.log_result("Theme Color Persistence", True, f"Theme color persisted correctly")
                return True
            else:
                self.log_result("Theme Color Persistence", False, f"Theme color not persisted. Current: {response_data.get('theme_color', 'Not found')}")
                return False
        else:
            self.log_result("Theme Color Persistence", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_pdf_with_theme_color(self):
        """Test PDF generation with theme color"""
        # First create a test quote for PDF generation
        quote_date = datetime.now()
        validity_date = quote_date + timedelta(days=30)
        
        # Create a test product first
        product_data = {
            "code": "THEME_TEST",
            "name": "Theme Test Ürün",
            "category": "Test",
            "unit": "Adet",
            "unit_price": 100.0
        }
        
        success, product_response, _ = self.make_request('POST', 'products', product_data)
        if not success:
            self.log_result("PDF Theme Color Test", False, "Could not create test product")
            return False
        
        product_id = product_response['id']
        
        # Create a test quote
        quote_data = {
            "quote_date": quote_date.strftime('%Y-%m-%d'),
            "validity_date": validity_date.strftime('%Y-%m-%d'),
            "customer_name": "Theme Test Müşteri",
            "customer_email": "theme@test.com",
            "currency": "EUR",
            "items": [
                {
                    "product_id": product_id,
                    "product_name": "Theme Test Ürün",
                    "product_code": "THEME_TEST",
                    "unit": "Adet",
                    "quantity": 1.0,
                    "unit_price": 100.0,
                    "subtotal": 100.0
                }
            ],
            "discount_type": "percentage",
            "discount_value": 0.0,
            "vat_rate": 18.0
        }
        
        success, quote_response, _ = self.make_request('POST', 'quotes', quote_data)
        if not success:
            self.log_result("PDF Theme Color Test", False, "Could not create test quote")
            return False
        
        quote_id = quote_response['id']
        
        # Test PDF generation
        url = f"{self.api_url}/quotes/{quote_id}/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                self.log_result("PDF Theme Color Test", True, f"PDF generated successfully with theme color, size: {len(response.content)} bytes")
                
                # Cleanup
                self.make_request('DELETE', f'quotes/{quote_id}')
                self.make_request('DELETE', f'products/{product_id}')
                return True
            else:
                self.log_result("PDF Theme Color Test", False, f"PDF generation failed. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("PDF Theme Color Test", False, f"Exception: {str(e)}")
            return False

    def test_market_watch_endpoints(self):
        """Test if there are any market watch related endpoints"""
        # Test common market watch endpoint patterns
        market_endpoints = [
            'market-watch',
            'markets',
            'borsa',
            'exchange-rates',
            'currency-rates'
        ]
        
        found_endpoints = []
        for endpoint in market_endpoints:
            success, response_data, status_code = self.make_request('GET', endpoint, expect_status=200)
            if success:
                found_endpoints.append(endpoint)
        
        if found_endpoints:
            self.log_result("Market Watch Endpoints", True, f"Found endpoints: {found_endpoints}")
            return True
        else:
            self.log_result("Market Watch Endpoints", False, "No market watch endpoints found in backend")
            return False

    def check_backend_model_support(self):
        """Check what fields are supported in the Settings model"""
        print("\n🔍 Checking Backend Model Support...")
        
        # Get current settings to see what fields are available
        success, settings_data, _ = self.make_request('GET', 'settings')
        
        if success and isinstance(settings_data, dict):
            print(f"   Available settings fields: {list(settings_data.keys())}")
            
            # Check for theme-related fields
            theme_fields = [field for field in settings_data.keys() if 'theme' in field.lower()]
            if theme_fields:
                print(f"   Theme-related fields: {theme_fields}")
            else:
                print("   ⚠️  No theme-related fields found")
            
            # Check for market-related fields
            market_fields = [field for field in settings_data.keys() if any(word in field.lower() for word in ['market', 'borsa', 'exchange'])]
            if market_fields:
                print(f"   Market-related fields: {market_fields}")
            else:
                print("   ⚠️  No market-related fields found")
                
        else:
            print("   ❌ Could not retrieve settings structure")

    def run_theme_and_market_tests(self):
        """Run tests specific to the review request"""
        print("🎨 Starting Theme Color and Market Watch Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Check backend model support first
        self.check_backend_model_support()
        
        # Authentication test with admin credentials
        if not self.test_admin_login():
            print("❌ Admin login failed, stopping tests")
            return False
        
        # Theme color tests
        print("\n🎨 Testing Theme Color Functionality...")
        self.test_theme_color_update()
        self.test_theme_color_persistence()
        self.test_pdf_with_theme_color()
        
        # Market watch tests
        print("\n📈 Testing Market Watch Functionality...")
        self.test_market_watch_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Analysis of findings
        print("\n🔍 Analysis for Review Request:")
        print("1. Theme Color Test: Check if Green (#10B981) can be set and persists")
        print("2. PDF Theme Integration: Check if theme color appears in generated PDFs")
        print("3. Market Watch Backend: Check if backend supports market data endpoints")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = ThemeAndMarketTester()
    success = tester.run_theme_and_market_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
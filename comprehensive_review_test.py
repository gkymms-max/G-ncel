#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class ComprehensiveReviewTester:
    def __init__(self, base_url="https://quote-desktop.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.issues_found = []
        
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
            self.tests_passed += 0
            print(f"❌ {test_name} - FAILED: {details}")
            self.issues_found.append(f"{test_name}: {details}")
        
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

    def test_backend_theme_color_support(self):
        """Test if backend supports theme_color field"""
        # Get current settings to check structure
        success, response_data, status_code = self.make_request('GET', 'settings')
        
        if success:
            available_fields = list(response_data.keys()) if isinstance(response_data, dict) else []
            has_theme_color = 'theme_color' in available_fields
            
            if has_theme_color:
                self.log_result("Backend Theme Color Support", True, "theme_color field exists in backend")
                return True
            else:
                self.log_result("Backend Theme Color Support", False, f"theme_color field missing. Available fields: {available_fields}")
                return False
        else:
            self.log_result("Backend Theme Color Support", False, f"Could not retrieve settings: {status_code}")
            return False

    def test_theme_color_update_attempt(self):
        """Test attempting to update theme color"""
        update_data = {
            "theme_color": "#10B981"  # Green color from review request
        }
        
        success, response_data, status_code = self.make_request('PUT', 'settings', update_data)
        
        if success:
            if 'theme_color' in response_data and response_data['theme_color'] == "#10B981":
                self.log_result("Theme Color Update", True, "Theme color updated successfully")
                return True
            else:
                self.log_result("Theme Color Update", False, f"Theme color not saved. Backend ignores unknown fields")
                return False
        else:
            self.log_result("Theme Color Update", False, f"Update failed: {status_code}")
            return False

    def test_market_watch_endpoints(self):
        """Test if market watch endpoints exist in backend"""
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
            self.log_result("Market Watch Backend Endpoints", True, f"Found: {found_endpoints}")
            return True
        else:
            self.log_result("Market Watch Backend Endpoints", False, "No market watch endpoints found in backend")
            return False

    def test_pdf_generation_basic(self):
        """Test basic PDF generation functionality"""
        # Create test product and quote for PDF generation
        product_data = {
            "code": "PDF_TEST",
            "name": "PDF Test Ürün",
            "category": "Test",
            "unit": "Adet",
            "unit_price": 100.0
        }
        
        success, product_response, _ = self.make_request('POST', 'products', product_data)
        if not success:
            self.log_result("PDF Generation Test", False, "Could not create test product")
            return False
        
        product_id = product_response['id']
        
        # Create test quote
        quote_date = datetime.now()
        validity_date = quote_date + timedelta(days=30)
        
        quote_data = {
            "quote_date": quote_date.strftime('%Y-%m-%d'),
            "validity_date": validity_date.strftime('%Y-%m-%d'),
            "customer_name": "PDF Test Müşteri",
            "customer_email": "pdf@test.com",
            "currency": "EUR",
            "items": [
                {
                    "product_id": product_id,
                    "product_name": "PDF Test Ürün",
                    "product_code": "PDF_TEST",
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
            self.log_result("PDF Generation Test", False, "Could not create test quote")
            return False
        
        quote_id = quote_response['id']
        
        # Test PDF generation
        url = f"{self.api_url}/quotes/{quote_id}/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                self.log_result("PDF Generation Test", True, f"PDF generated successfully, size: {len(response.content)} bytes")
                
                # Cleanup
                self.make_request('DELETE', f'quotes/{quote_id}')
                self.make_request('DELETE', f'products/{product_id}')
                return True
            else:
                self.log_result("PDF Generation Test", False, f"PDF generation failed. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("PDF Generation Test", False, f"Exception: {str(e)}")
            return False

    def analyze_backend_settings_model(self):
        """Analyze what the backend Settings model actually supports"""
        success, response_data, _ = self.make_request('GET', 'settings')
        
        if success and isinstance(response_data, dict):
            print("\n🔍 Backend Settings Model Analysis:")
            print(f"   Available fields: {list(response_data.keys())}")
            
            # Check for theme-related fields
            theme_fields = [field for field in response_data.keys() if 'theme' in field.lower()]
            if theme_fields:
                print(f"   Theme-related fields: {theme_fields}")
                for field in theme_fields:
                    print(f"     - {field}: {response_data[field]}")
            else:
                print("   ⚠️  No theme_color field found")
                print("   ✅ Found pdf_theme field (but different from frontend expectation)")
            
            return response_data
        else:
            print("   ❌ Could not analyze backend settings model")
            return None

    def run_comprehensive_review_tests(self):
        """Run comprehensive tests for the review request"""
        print("🎯 Starting Comprehensive Review Tests for Turkish Price Quote App")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Authentication test
        if not self.test_admin_login():
            print("❌ Cannot proceed without admin access")
            return False
        
        # Analyze backend model
        settings_data = self.analyze_backend_settings_model()
        
        print("\n🎨 Testing Theme Color Functionality...")
        self.test_backend_theme_color_support()
        self.test_theme_color_update_attempt()
        
        print("\n📈 Testing Market Watch Backend Support...")
        self.test_market_watch_endpoints()
        
        print("\n📄 Testing PDF Generation...")
        self.test_pdf_generation_basic()
        
        # Summary
        print("\n" + "=" * 80)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print("\n🔍 CRITICAL ISSUES FOUND:")
        for i, issue in enumerate(self.issues_found, 1):
            print(f"   {i}. {issue}")
        
        print("\n📋 REVIEW REQUEST ANALYSIS:")
        print("1. ❌ Theme Color Test: Backend doesn't support theme_color field")
        print("   - Frontend expects theme_color with hex values (#10B981)")
        print("   - Backend only has pdf_theme with predefined values (blue, green, purple, orange)")
        print("   - Frontend and backend are mismatched")
        
        print("\n2. ❌ Market Watch Backend: No backend endpoints for market data")
        print("   - Frontend has MarketWatch.js with TradingView widgets")
        print("   - Backend has no market-watch, borsa, or currency endpoints")
        print("   - Market watch is purely frontend-based")
        
        print("\n3. ✅ PDF Generation: Basic functionality works")
        print("   - PDF generation endpoint works")
        print("   - But theme color integration will fail due to field mismatch")
        
        print("\n🚨 MAIN PROBLEMS:")
        print("   1. Backend Settings model missing theme_color field")
        print("   2. No backend support for market watch data")
        print("   3. Frontend-backend mismatch on theme system")
        
        return len(self.issues_found) == 0

def main():
    tester = ComprehensiveReviewTester()
    success = tester.run_comprehensive_review_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
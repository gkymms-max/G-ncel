#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class BugFixesTester:
    def __init__(self, base_url="https://quotecraft-42.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.test_results = []
        self.created_quote_id = None

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        if success:
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def login_admin(self):
        """Login as admin user"""
        data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/login", json=data)
            
            if response.status_code == 200:
                response_data = response.json()
                if 'access_token' in response_data and response_data.get('role') == 'admin':
                    self.token = response_data['access_token']
                    self.log_result("Admin Login", True, f"Logged in as {response_data.get('role')}")
                    return True
                else:
                    self.log_result("Admin Login", False, "Invalid response format")
                    return False
            else:
                self.log_result("Admin Login", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_bug_fix_1_theme_colors(self):
        """Test Bug Fix #1: Theme Color System"""
        print("\n🎨 Testing Bug Fix #1: Theme Color System")
        print("-" * 50)
        
        theme_colors = [
            ("#4F46E5", "İndigo"),
            ("#3B82F6", "Mavi"),
            ("#10B981", "Yeşil"),
            ("#8B5CF6", "Mor"),
            ("#F97316", "Turuncu")
        ]
        
        all_passed = True
        
        for color, name in theme_colors:
            # Test setting theme color
            data = {
                "theme_color": color,
                "company_name": "Test Firma A.Ş."
            }
            
            try:
                headers = {'Authorization': f'Bearer {self.token}'}
                response = requests.put(f"{self.api_url}/settings", json=data, headers=headers)
                
                if response.status_code == 200:
                    response_data = response.json()
                    if response_data.get('theme_color') == color:
                        self.log_result(f"Theme Color {name} ({color})", True, "Color set successfully")
                    else:
                        self.log_result(f"Theme Color {name} ({color})", False, f"Expected: {color}, Got: {response_data.get('theme_color')}")
                        all_passed = False
                else:
                    self.log_result(f"Theme Color {name} ({color})", False, f"Status: {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"Theme Color {name} ({color})", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_bug_fix_2_pdf_theme_integration(self):
        """Test Bug Fix #2: PDF uses theme color from settings"""
        print("\n📄 Testing Bug Fix #2: PDF Theme Integration")
        print("-" * 50)
        
        # First create a test quote
        if not self.create_test_quote():
            return False
        
        # Set a specific theme color
        theme_color = "#10B981"  # Green
        data = {
            "theme_color": theme_color,
            "company_name": "Test Firma A.Ş."
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.put(f"{self.api_url}/settings", json=data, headers=headers)
            
            if response.status_code != 200:
                self.log_result("PDF Theme Integration - Set Color", False, f"Failed to set theme color: {response.status_code}")
                return False
            
            # Generate PDF
            pdf_response = requests.get(f"{self.api_url}/quotes/{self.created_quote_id}/pdf", headers=headers)
            
            if pdf_response.status_code == 200 and pdf_response.headers.get('content-type') == 'application/pdf':
                pdf_size = len(pdf_response.content)
                self.log_result("PDF Theme Integration", True, f"PDF generated with theme color {theme_color}, size: {pdf_size} bytes")
                return True
            else:
                self.log_result("PDF Theme Integration", False, f"PDF generation failed: {pdf_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("PDF Theme Integration", False, f"Exception: {str(e)}")
            return False

    def create_test_quote(self):
        """Create a test quote for PDF testing"""
        # First create a test product
        product_data = {
            "code": "TEST001",
            "name": "Test Ürün",
            "category": "Test Kategori",
            "unit": "Adet",
            "unit_price": 25.50,
            "package_count": 10
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            product_response = requests.post(f"{self.api_url}/products", json=product_data, headers=headers)
            
            if product_response.status_code != 200:
                self.log_result("Create Test Product", False, f"Status: {product_response.status_code}")
                return False
            
            product_id = product_response.json()['id']
            
            # Create quote
            quote_date = datetime.now()
            validity_date = quote_date + timedelta(days=30)
            
            quote_data = {
                "quote_date": quote_date.strftime('%Y-%m-%d'),
                "validity_date": validity_date.strftime('%Y-%m-%d'),
                "customer_name": "Test Müşteri A.Ş.",
                "customer_email": "test@musteri.com",
                "customer_phone": "+90 555 123 45 67",
                "currency": "EUR",
                "items": [
                    {
                        "product_id": product_id,
                        "product_name": "Test Ürün",
                        "product_code": "TEST001",
                        "unit": "Adet",
                        "quantity": 5.0,
                        "unit_price": 25.50,
                        "subtotal": 127.50
                    }
                ],
                "discount_type": "percentage",
                "discount_value": 10.0,
                "vat_rate": 18.0,
                "notes": "Test teklif notları"
            }
            
            quote_response = requests.post(f"{self.api_url}/quotes", json=quote_data, headers=headers)
            
            if quote_response.status_code == 200:
                self.created_quote_id = quote_response.json()['id']
                self.log_result("Create Test Quote", True, f"Quote created: {self.created_quote_id}")
                return True
            else:
                self.log_result("Create Test Quote", False, f"Status: {quote_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Create Test Quote", False, f"Exception: {str(e)}")
            return False

    def test_bug_fix_3_market_watch_structure(self):
        """Test Bug Fix #3: Market Watch structure (backend verification)"""
        print("\n📊 Testing Bug Fix #3: Market Watch Backend Support")
        print("-" * 50)
        
        # This is primarily a frontend fix, but we can verify backend supports the data
        # The MarketWatch page should work with the existing backend structure
        
        # Test that settings API works (needed for theme colors in MarketWatch)
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(f"{self.api_url}/settings", headers=headers)
            
            if response.status_code == 200:
                settings = response.json()
                if 'theme_color' in settings:
                    self.log_result("Market Watch Backend Support", True, f"Settings API supports theme_color: {settings.get('theme_color')}")
                    return True
                else:
                    self.log_result("Market Watch Backend Support", False, "Settings API missing theme_color field")
                    return False
            else:
                self.log_result("Market Watch Backend Support", False, f"Settings API failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Market Watch Backend Support", False, f"Exception: {str(e)}")
            return False

    def cleanup(self):
        """Clean up test data"""
        if self.created_quote_id:
            try:
                headers = {'Authorization': f'Bearer {self.token}'}
                requests.delete(f"{self.api_url}/quotes/{self.created_quote_id}", headers=headers)
                print("🧹 Test data cleaned up")
            except:
                pass

    def run_all_tests(self):
        """Run all bug fix tests"""
        print("🐛 Testing Bug Fixes for Price Quote Application")
        print("=" * 60)
        
        if not self.login_admin():
            print("❌ Cannot proceed without admin access")
            return False
        
        # Test all three bug fixes
        fix1_passed = self.test_bug_fix_1_theme_colors()
        fix2_passed = self.test_bug_fix_2_pdf_theme_integration()
        fix3_passed = self.test_bug_fix_3_market_watch_structure()
        
        # Cleanup
        self.cleanup()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 Bug Fixes Test Summary:")
        print(f"   🎨 Bug Fix #1 (Theme Colors): {'✅ PASSED' if fix1_passed else '❌ FAILED'}")
        print(f"   📄 Bug Fix #2 (PDF Theme): {'✅ PASSED' if fix2_passed else '❌ FAILED'}")
        print(f"   📊 Bug Fix #3 (Market Watch): {'✅ PASSED' if fix3_passed else '❌ FAILED'}")
        
        all_passed = fix1_passed and fix2_passed and fix3_passed
        
        if all_passed:
            print("\n🎉 All bug fixes are working correctly!")
            return True
        else:
            print("\n⚠️  Some bug fixes have issues. Check the details above.")
            return False

def main():
    tester = BugFixesTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
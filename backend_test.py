#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import base64

class PriceQuoteAPITester:
    def __init__(self, base_url="https://quotecraft-42.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_username = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.test_password = "TestPass123!"
        self.created_product_id = None
        self.created_quote_id = None

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

    def make_request(self, method, endpoint, data=None, files=None, expect_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if files:
            headers.pop('Content-Type', None)  # Let requests set it for multipart
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
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

    def test_auth_register(self):
        """Test user registration"""
        data = {
            "username": self.test_username,
            "password": self.test_password
        }
        
        success, response_data, status_code = self.make_request('POST', 'auth/register', data)
        
        if success and 'access_token' in response_data:
            self.token = response_data['access_token']
            self.log_result("Auth Registration", True, f"User {self.test_username} registered successfully")
            return True
        else:
            self.log_result("Auth Registration", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_auth_login(self):
        """Test user login"""
        data = {
            "username": self.test_username,
            "password": self.test_password
        }
        
        success, response_data, status_code = self.make_request('POST', 'auth/login', data)
        
        if success and 'access_token' in response_data:
            self.token = response_data['access_token']
            self.log_result("Auth Login", True, "Login successful")
            return True
        else:
            self.log_result("Auth Login", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_create_product(self):
        """Test product creation"""
        # Create a simple base64 image for testing
        test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        data = {
            "code": "TEST001",
            "name": "Test Ürün",
            "category": "Plise Sineklik",
            "unit": "Adet",
            "unit_price": 25.50,
            "package_count": 10,
            "description": "Test ürün açıklaması",
            "image": test_image
        }
        
        success, response_data, status_code = self.make_request('POST', 'products', data, expect_status=200)
        
        if success and 'id' in response_data:
            self.created_product_id = response_data['id']
            self.log_result("Product Creation", True, f"Product created with ID: {self.created_product_id}")
            return True
        else:
            self.log_result("Product Creation", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_get_products(self):
        """Test getting all products"""
        success, response_data, status_code = self.make_request('GET', 'products')
        
        if success and isinstance(response_data, list):
            self.log_result("Get Products", True, f"Retrieved {len(response_data)} products")
            return True
        else:
            self.log_result("Get Products", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_get_product_by_id(self):
        """Test getting specific product"""
        if not self.created_product_id:
            self.log_result("Get Product by ID", False, "No product ID available")
            return False
        
        success, response_data, status_code = self.make_request('GET', f'products/{self.created_product_id}')
        
        if success and 'id' in response_data:
            self.log_result("Get Product by ID", True, f"Retrieved product: {response_data.get('name', 'Unknown')}")
            return True
        else:
            self.log_result("Get Product by ID", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_update_product(self):
        """Test product update"""
        if not self.created_product_id:
            self.log_result("Update Product", False, "No product ID available")
            return False
        
        data = {
            "code": "TEST001-UPDATED",
            "name": "Test Ürün Güncellenmiş",
            "category": "Plise Perde",
            "unit": "Metre",
            "unit_price": 30.75,
            "package_length": 5.0,
            "description": "Güncellenmiş test ürün açıklaması"
        }
        
        success, response_data, status_code = self.make_request('PUT', f'products/{self.created_product_id}', data)
        
        if success and response_data.get('name') == data['name']:
            self.log_result("Update Product", True, "Product updated successfully")
            return True
        else:
            self.log_result("Update Product", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_create_quote(self):
        """Test quote creation"""
        if not self.created_product_id:
            self.log_result("Create Quote", False, "No product available for quote")
            return False
        
        quote_date = datetime.now()
        validity_date = quote_date + timedelta(days=30)
        
        data = {
            "quote_date": quote_date.strftime('%Y-%m-%d'),
            "validity_date": validity_date.strftime('%Y-%m-%d'),
            "customer_name": "Test Müşteri A.Ş.",
            "customer_email": "test@musteri.com",
            "customer_phone": "+90 555 123 45 67",
            "currency": "EUR",
            "items": [
                {
                    "product_id": self.created_product_id,
                    "product_name": "Test Ürün Güncellenmiş",
                    "product_code": "TEST001-UPDATED",
                    "unit": "Metre",
                    "quantity": 5.0,
                    "unit_price": 30.75,
                    "subtotal": 153.75,
                    "note": "Test ürün notu"
                }
            ],
            "discount_type": "percentage",
            "discount_value": 10.0,
            "vat_rate": 18.0,
            "notes": "Test teklif notları"
        }
        
        success, response_data, status_code = self.make_request('POST', 'quotes', data)
        
        if success and 'id' in response_data:
            self.created_quote_id = response_data['id']
            self.log_result("Create Quote", True, f"Quote created with ID: {self.created_quote_id}")
            return True
        else:
            self.log_result("Create Quote", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_get_quotes(self):
        """Test getting all quotes"""
        success, response_data, status_code = self.make_request('GET', 'quotes')
        
        if success and isinstance(response_data, list):
            self.log_result("Get Quotes", True, f"Retrieved {len(response_data)} quotes")
            return True
        else:
            self.log_result("Get Quotes", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_get_quote_by_id(self):
        """Test getting specific quote"""
        if not self.created_quote_id:
            self.log_result("Get Quote by ID", False, "No quote ID available")
            return False
        
        success, response_data, status_code = self.make_request('GET', f'quotes/{self.created_quote_id}')
        
        if success and 'id' in response_data:
            self.log_result("Get Quote by ID", True, f"Retrieved quote: {response_data.get('quote_number', 'Unknown')}")
            return True
        else:
            self.log_result("Get Quote by ID", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_quote_pdf_generation(self):
        """Test PDF generation for quote"""
        if not self.created_quote_id:
            self.log_result("Quote PDF Generation", False, "No quote ID available")
            return False
        
        # Make request without JSON parsing since it's a PDF
        url = f"{self.api_url}/quotes/{self.created_quote_id}/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                self.log_result("Quote PDF Generation", True, f"PDF generated successfully, size: {len(response.content)} bytes")
                return True
            else:
                self.log_result("Quote PDF Generation", False, f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
                return False
        except Exception as e:
            self.log_result("Quote PDF Generation", False, f"Exception: {str(e)}")
            return False

    def test_get_settings(self):
        """Test getting company settings"""
        success, response_data, status_code = self.make_request('GET', 'settings')
        
        if success and 'company_name' in response_data:
            self.log_result("Get Settings", True, f"Settings retrieved for: {response_data.get('company_name', 'Unknown')}")
            return True
        else:
            self.log_result("Get Settings", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_update_settings(self):
        """Test updating company settings"""
        test_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        data = {
            "company_name": "Test Firma A.Ş.",
            "company_address": "Test Mahallesi, Test Sokak No:1, İstanbul",
            "company_phone": "+90 212 555 01 23",
            "company_email": "info@testfirma.com",
            "company_website": "www.testfirma.com",
            "logo": test_logo,
            "default_currency": "EUR",
            "default_vat_rate": 20.0
        }
        
        success, response_data, status_code = self.make_request('PUT', 'settings', data)
        
        if success and response_data.get('company_name') == data['company_name']:
            self.log_result("Update Settings", True, "Settings updated successfully")
            return True
        else:
            self.log_result("Update Settings", False, f"Status: {status_code}, Response: {response_data}")
            return False

    def test_theme_color_settings(self):
        """Test theme color functionality in settings"""
        theme_colors = [
            "#4F46E5",  # İndigo
            "#3B82F6",  # Mavi
            "#10B981",  # Yeşil
            "#8B5CF6",  # Mor
            "#F97316"   # Turuncu
        ]
        
        for color in theme_colors:
            data = {
                "theme_color": color,
                "company_name": "Test Firma A.Ş."
            }
            
            success, response_data, status_code = self.make_request('PUT', 'settings', data)
            
            if success and response_data.get('theme_color') == color:
                self.log_result(f"Theme Color {color}", True, f"Theme color set to {color}")
            else:
                self.log_result(f"Theme Color {color}", False, f"Status: {status_code}, Expected: {color}, Got: {response_data.get('theme_color')}")
                return False
        
        return True

    def test_pdf_with_theme_color(self):
        """Test PDF generation with theme color"""
        if not self.created_quote_id:
            self.log_result("PDF with Theme Color", False, "No quote ID available")
            return False
        
        # First set a specific theme color
        theme_color = "#10B981"  # Green
        settings_data = {
            "theme_color": theme_color,
            "company_name": "Test Firma A.Ş."
        }
        
        success, _, _ = self.make_request('PUT', 'settings', settings_data)
        if not success:
            self.log_result("PDF with Theme Color", False, "Failed to set theme color")
            return False
        
        # Generate PDF
        url = f"{self.api_url}/quotes/{self.created_quote_id}/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                pdf_size = len(response.content)
                self.log_result("PDF with Theme Color", True, f"PDF generated with theme color {theme_color}, size: {pdf_size} bytes")
                return True
            else:
                self.log_result("PDF with Theme Color", False, f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
                return False
        except Exception as e:
            self.log_result("PDF with Theme Color", False, f"Exception: {str(e)}")
            return False

    def test_calculation_logic(self):
        """Test calculation logic with different units"""
        # Test with KG unit
        kg_product_data = {
            "code": "KG001",
            "name": "KG Test Ürün",
            "category": "Profil",
            "unit": "KG",
            "unit_price": 15.25,
            "package_kg": 2.5
        }
        
        success, response_data, status_code = self.make_request('POST', 'products', kg_product_data)
        
        if success:
            kg_product_id = response_data['id']
            
            # Create quote with KG product
            quote_data = {
                "quote_date": datetime.now().strftime('%Y-%m-%d'),
                "validity_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
                "customer_name": "KG Test Müşteri",
                "customer_email": "kg@test.com",
                "currency": "EUR",
                "items": [
                    {
                        "product_id": kg_product_id,
                        "product_name": "KG Test Ürün",
                        "product_code": "KG001",
                        "unit": "KG",
                        "quantity": 3.5,
                        "unit_price": 15.25,
                        "subtotal": 53.375
                    }
                ],
                "discount_type": "amount",
                "discount_value": 5.0,
                "vat_rate": 18.0
            }
            
            success2, quote_response, status_code2 = self.make_request('POST', 'quotes', quote_data)
            
            if success2:
                # Verify calculations
                expected_subtotal = 53.375
                expected_discount = 5.0
                expected_after_discount = expected_subtotal - expected_discount
                expected_vat = expected_after_discount * 0.18
                expected_total = expected_after_discount + expected_vat
                
                actual_total = quote_response.get('total', 0)
                calculation_correct = abs(actual_total - expected_total) < 0.01
                
                if calculation_correct:
                    self.log_result("Calculation Logic (KG)", True, f"Calculations correct: Total {actual_total:.2f} EUR")
                else:
                    self.log_result("Calculation Logic (KG)", False, f"Expected: {expected_total:.2f}, Got: {actual_total:.2f}")
                
                return calculation_correct
            else:
                self.log_result("Calculation Logic (KG)", False, f"Quote creation failed: {quote_response}")
                return False
        else:
            self.log_result("Calculation Logic (KG)", False, f"Product creation failed: {response_data}")
            return False

    def cleanup_test_data(self):
        """Clean up test data"""
        cleanup_results = []
        
        # Delete test quote
        if self.created_quote_id:
            success, _, _ = self.make_request('DELETE', f'quotes/{self.created_quote_id}', expect_status=200)
            cleanup_results.append(f"Quote cleanup: {'✅' if success else '❌'}")
        
        # Delete test product
        if self.created_product_id:
            success, _, _ = self.make_request('DELETE', f'products/{self.created_product_id}', expect_status=200)
            cleanup_results.append(f"Product cleanup: {'✅' if success else '❌'}")
        
        print(f"\n🧹 Cleanup Results: {', '.join(cleanup_results)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Price Quote API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        if not self.test_auth_register():
            print("❌ Registration failed, stopping tests")
            return False
        
        if not self.test_auth_login():
            print("❌ Login failed, stopping tests")
            return False
        
        # Product management tests
        self.test_create_product()
        self.test_get_products()
        self.test_get_product_by_id()
        self.test_update_product()
        
        # Quote management tests
        self.test_create_quote()
        self.test_get_quotes()
        self.test_get_quote_by_id()
        self.test_quote_pdf_generation()
        
        # Settings tests
        self.test_get_settings()
        self.test_update_settings()
        
        # Theme color tests (Bug Fix #1)
        self.test_theme_color_settings()
        self.test_pdf_with_theme_color()
        
        # Calculation logic tests
        self.test_calculation_logic()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = PriceQuoteAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
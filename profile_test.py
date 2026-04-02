#!/usr/bin/env python3
"""
SIRA TAXI Profile API Testing Suite
Tests profile-specific endpoints for passenger and driver profiles
"""

import requests
import sys
import json
from datetime import datetime

class ProfileAPITester:
    def __init__(self, base_url="https://uber-mali-drive.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.passenger_token = None
        self.driver_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials from review request
        self.passenger_creds = {"email": "passager@test.ml", "password": "Test123!"}
        self.driver_creds = {"email": "chauffeur@test.ml", "password": "Test123!"}

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"\n{status} - {name}")
        
        if expected_status and actual_status:
            print(f"   Expected: {expected_status}, Got: {actual_status}")
        
        if details:
            print(f"   Details: {details}")
            
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({
                "test": name,
                "details": details,
                "expected_status": expected_status,
                "actual_status": actual_status
            })

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
            
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
            
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return None

    def test_passenger_login(self):
        """Test passenger login"""
        print("\n🔍 Testing Passenger Login...")
        
        response = self.make_request('POST', 'auth/login', self.passenger_creds)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.passenger_token = data['token']
                    user = data['user']
                    if user.get('role') == 'passenger':
                        self.log_test("Passenger Login", True, f"Logged in as {user.get('name')}")
                        return True
                    else:
                        self.log_test("Passenger Login", False, f"Wrong role: {user.get('role')}")
                else:
                    self.log_test("Passenger Login", False, "Missing token or user in response")
            except:
                self.log_test("Passenger Login", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Passenger Login", False, "Login failed", 200, status)
        
        return False

    def test_driver_login(self):
        """Test driver login"""
        print("\n🔍 Testing Driver Login...")
        
        response = self.make_request('POST', 'auth/login', self.driver_creds)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.driver_token = data['token']
                    user = data['user']
                    if user.get('role') == 'driver':
                        self.log_test("Driver Login", True, f"Logged in as {user.get('name')}")
                        return True
                    else:
                        self.log_test("Driver Login", False, f"Wrong role: {user.get('role')}")
                else:
                    self.log_test("Driver Login", False, "Missing token or user in response")
            except:
                self.log_test("Driver Login", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Driver Login", False, "Login failed", 200, status)
        
        return False

    def test_passenger_profile_update(self):
        """Test passenger profile update with favorite addresses and preferred payment"""
        print("\n🔍 Testing Passenger Profile Update...")
        
        if not self.passenger_token:
            self.log_test("Passenger Profile Update", False, "No passenger token available")
            return False
        
        # Test updating passenger-specific fields
        profile_data = {
            "name": "Test Passager Updated",
            "phone": "+223 70 00 00 01",
            "favorite_addresses": {
                "home": "Hamdallaye ACI 2000, Bamako",
                "work": "Quartier du Fleuve, Bamako"
            },
            "preferred_payment": "mobile_money"
        }
        
        response = self.make_request('PUT', 'users/profile', profile_data, token=self.passenger_token)
        if response and response.status_code == 200:
            try:
                updated_user = response.json()
                
                # Check if passenger-specific fields are present
                success = True
                details = []
                
                if 'favorite_addresses' in updated_user:
                    fav_addr = updated_user['favorite_addresses']
                    if fav_addr.get('home') == profile_data['favorite_addresses']['home']:
                        details.append("✓ Home address saved")
                    else:
                        success = False
                        details.append("✗ Home address not saved correctly")
                    
                    if fav_addr.get('work') == profile_data['favorite_addresses']['work']:
                        details.append("✓ Work address saved")
                    else:
                        success = False
                        details.append("✗ Work address not saved correctly")
                else:
                    success = False
                    details.append("✗ favorite_addresses field missing")
                
                if updated_user.get('preferred_payment') == profile_data['preferred_payment']:
                    details.append("✓ Preferred payment saved")
                else:
                    success = False
                    details.append("✗ Preferred payment not saved correctly")
                
                self.log_test("Passenger Profile Update", success, "; ".join(details))
                return success
                
            except Exception as e:
                self.log_test("Passenger Profile Update", False, f"JSON parse error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Passenger Profile Update", False, "Profile update failed", 200, status)
        
        return False

    def test_driver_vehicle_update(self):
        """Test driver vehicle info update"""
        print("\n🔍 Testing Driver Vehicle Update...")
        
        if not self.driver_token:
            self.log_test("Driver Vehicle Update", False, "No driver token available")
            return False
        
        # Test updating vehicle info
        vehicle_data = {
            "make": "Toyota",
            "model": "Corolla",
            "year": "2020",
            "plate": "AB-1234-ML",
            "color": "Blanc",
            "type": "sedan"
        }
        
        response = self.make_request('PUT', 'users/vehicle', vehicle_data, token=self.driver_token)
        if response and response.status_code == 200:
            try:
                result = response.json()
                if result.get('message') == "Informations véhicule mises à jour":
                    self.log_test("Driver Vehicle Update", True, f"Vehicle info updated: {vehicle_data['make']} {vehicle_data['model']}")
                    return True
                else:
                    self.log_test("Driver Vehicle Update", False, f"Unexpected response: {result}")
            except Exception as e:
                self.log_test("Driver Vehicle Update", False, f"JSON parse error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Driver Vehicle Update", False, "Vehicle update failed", 200, status)
        
        return False

    def test_get_passenger_profile(self):
        """Test getting passenger profile data"""
        print("\n🔍 Testing Get Passenger Profile...")
        
        if not self.passenger_token:
            self.log_test("Get Passenger Profile", False, "No passenger token available")
            return False
        
        response = self.make_request('GET', 'auth/me', token=self.passenger_token)
        if response and response.status_code == 200:
            try:
                user = response.json()
                
                success = True
                details = []
                
                # Check role
                if user.get('role') == 'passenger':
                    details.append("✓ Role: passenger")
                else:
                    success = False
                    details.append(f"✗ Wrong role: {user.get('role')}")
                
                # Check passenger-specific fields
                if 'favorite_addresses' in user:
                    details.append("✓ Has favorite_addresses field")
                else:
                    details.append("⚠ No favorite_addresses field (may be empty)")
                
                if 'preferred_payment' in user:
                    details.append(f"✓ Has preferred_payment: {user['preferred_payment']}")
                else:
                    details.append("⚠ No preferred_payment field (may be default)")
                
                self.log_test("Get Passenger Profile", success, "; ".join(details))
                return success
                
            except Exception as e:
                self.log_test("Get Passenger Profile", False, f"JSON parse error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Passenger Profile", False, "Get profile failed", 200, status)
        
        return False

    def test_get_driver_profile(self):
        """Test getting driver profile data"""
        print("\n🔍 Testing Get Driver Profile...")
        
        if not self.driver_token:
            self.log_test("Get Driver Profile", False, "No driver token available")
            return False
        
        response = self.make_request('GET', 'auth/me', token=self.driver_token)
        if response and response.status_code == 200:
            try:
                user = response.json()
                
                success = True
                details = []
                
                # Check role
                if user.get('role') == 'driver':
                    details.append("✓ Role: driver")
                else:
                    success = False
                    details.append(f"✗ Wrong role: {user.get('role')}")
                
                # Check driver-specific fields
                if 'vehicle_info' in user:
                    vehicle = user['vehicle_info']
                    if vehicle and isinstance(vehicle, dict):
                        details.append(f"✓ Has vehicle_info: {vehicle.get('make', 'Unknown')} {vehicle.get('model', '')}")
                    else:
                        details.append("⚠ vehicle_info field exists but empty")
                else:
                    details.append("⚠ No vehicle_info field")
                
                # Check earnings field
                if 'earnings' in user:
                    details.append(f"✓ Has earnings: {user['earnings']} FCFA")
                else:
                    details.append("⚠ No earnings field")
                
                self.log_test("Get Driver Profile", success, "; ".join(details))
                return success
                
            except Exception as e:
                self.log_test("Get Driver Profile", False, f"JSON parse error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Driver Profile", False, "Get profile failed", 200, status)
        
        return False

    def run_all_tests(self):
        """Run all profile tests"""
        print("🚀 Starting SIRA TAXI Profile API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test authentication
        passenger_login_success = self.test_passenger_login()
        driver_login_success = self.test_driver_login()
        
        # Test profile functionality
        if passenger_login_success:
            self.test_get_passenger_profile()
            self.test_passenger_profile_update()
        
        if driver_login_success:
            self.test_get_driver_profile()
            self.test_driver_vehicle_update()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 PROFILE TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = ProfileAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
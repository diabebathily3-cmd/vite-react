#!/usr/bin/env python3
"""
Driver Profile Testing Suite
Tests driver profile specific functionality
"""

import requests
import sys
import json
from datetime import datetime

class DriverProfileTester:
    def __init__(self, base_url="https://uber-mali-drive.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.driver_token = None
        self.driver_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials from test_credentials.md
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
                    self.driver_user_id = user.get('user_id')
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

    def test_profile_update_endpoint(self):
        """Test PUT /api/users/profile endpoint for drivers"""
        print("\n🔍 Testing Driver Profile Update...")
        
        if not self.driver_token:
            self.log_test("Profile Update", False, "No driver token available")
            return False
        
        profile_data = {
            "name": "Test Chauffeur Updated",
            "phone": "+223 70 00 00 99",
            "documents": {
                "license": True,
                "insurance": False,
                "registration": True,
                "photo_id": True
            },
            "bio": "Chauffeur expérimenté à Bamako"
        }
        
        response = self.make_request('PUT', 'users/profile', profile_data, token=self.driver_token)
        if response and response.status_code == 200:
            try:
                user = response.json()
                if user.get('name') == profile_data['name'] and user.get('phone') == profile_data['phone']:
                    self.log_test("Profile Update", True, f"Profile updated successfully")
                    return True
                else:
                    self.log_test("Profile Update", False, f"Profile not updated correctly: {user}")
            except:
                self.log_test("Profile Update", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Profile Update", False, "Profile update failed", 200, status)
        
        return False

    def test_vehicle_update_endpoint(self):
        """Test PUT /api/users/vehicle endpoint"""
        print("\n🔍 Testing Vehicle Info Update...")
        
        if not self.driver_token:
            self.log_test("Vehicle Update", False, "No driver token available")
            return False
        
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
                if 'message' in result:
                    self.log_test("Vehicle Update", True, "Vehicle info updated successfully")
                    return True
                else:
                    self.log_test("Vehicle Update", False, f"Unexpected response: {result}")
            except:
                self.log_test("Vehicle Update", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Vehicle Update", False, "Vehicle update failed", 200, status)
        
        return False

    def test_profile_get_endpoint(self):
        """Test GET /api/users/profile/{user_id} for driver"""
        print("\n🔍 Testing Driver Profile Retrieval...")
        
        if not self.driver_token or not self.driver_user_id:
            self.log_test("Profile Get", False, "No driver token or user_id available")
            return False
        
        response = self.make_request('GET', f'users/profile/{self.driver_user_id}', token=self.driver_token)
        if response and response.status_code == 200:
            try:
                profile = response.json()
                # Check driver-specific fields
                required_fields = ['user_id', 'name', 'role', 'rating', 'total_rides', 'vehicle_info', 'member_since']
                if all(field in profile for field in required_fields):
                    if profile.get('role') == 'driver':
                        self.log_test("Profile Get", True, f"Driver profile retrieved with all required fields")
                        return True
                    else:
                        self.log_test("Profile Get", False, f"Wrong role in profile: {profile.get('role')}")
                else:
                    missing = [f for f in required_fields if f not in profile]
                    self.log_test("Profile Get", False, f"Missing fields: {missing}")
            except:
                self.log_test("Profile Get", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Profile Get", False, "Profile retrieval failed", 200, status)
        
        return False

    def test_driver_status_toggle(self):
        """Test PUT /api/users/status endpoint"""
        print("\n🔍 Testing Driver Status Toggle...")
        
        if not self.driver_token:
            self.log_test("Status Toggle", False, "No driver token available")
            return False
        
        response = self.make_request('PUT', 'users/status', token=self.driver_token)
        if response and response.status_code == 200:
            try:
                result = response.json()
                if 'is_online' in result:
                    self.log_test("Status Toggle", True, f"Status toggled to: {result['is_online']}")
                    return True
                else:
                    self.log_test("Status Toggle", False, f"Missing is_online in response: {result}")
            except:
                self.log_test("Status Toggle", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Status Toggle", False, "Status toggle failed", 200, status)
        
        return False

    def test_ride_history(self):
        """Test GET /api/rides/history for driver"""
        print("\n🔍 Testing Driver Ride History...")
        
        if not self.driver_token:
            self.log_test("Ride History", False, "No driver token available")
            return False
        
        response = self.make_request('GET', 'rides/history', token=self.driver_token)
        if response and response.status_code == 200:
            try:
                rides = response.json()
                if isinstance(rides, list):
                    self.log_test("Ride History", True, f"Retrieved {len(rides)} rides")
                    return True
                else:
                    self.log_test("Ride History", False, f"Expected list, got: {type(rides)}")
            except:
                self.log_test("Ride History", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Ride History", False, "Ride history failed", 200, status)
        
        return False

    def run_all_tests(self):
        """Run all driver profile tests"""
        print("🚀 Starting Driver Profile API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test driver authentication
        if not self.test_driver_login():
            print("❌ Cannot proceed without driver login")
            return False
        
        # Test profile functionality
        self.test_profile_update_endpoint()
        self.test_vehicle_update_endpoint()
        self.test_profile_get_endpoint()
        self.test_driver_status_toggle()
        self.test_ride_history()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 DRIVER PROFILE TEST SUMMARY")
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
    tester = DriverProfileTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
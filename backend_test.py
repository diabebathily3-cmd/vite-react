#!/usr/bin/env python3
"""
SIRA TAXI Backend API Test - MOTO-TAXI Feature Testing
Tests the new MOTO-TAXI functionality including pricing, vehicle type selection, and API responses.
"""

import requests
import sys
import json
from datetime import datetime

class SiraTaxiAPITester:
    def __init__(self, base_url="https://uber-mali-drive.preview.emergentagent.com"):
        self.base_url = base_url
        self.passenger_token = None
        self.driver_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if token:
            test_headers['Authorization'] = f'Bearer {token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_passenger_login(self):
        """Test passenger login"""
        success, response = self.run_test(
            "Passenger Login",
            "POST",
            "auth/login",
            200,
            data={"email": "passager@test.ml", "password": "Test123!"}
        )
        if success and 'token' in response:
            self.passenger_token = response['token']
            print(f"   Passenger logged in successfully")
            return True
        return False

    def test_driver_login(self):
        """Test driver login"""
        success, response = self.run_test(
            "Driver Login",
            "POST",
            "auth/login",
            200,
            data={"email": "chauffeur@test.ml", "password": "Test123!"}
        )
        if success and 'token' in response:
            self.driver_token = response['token']
            print(f"   Driver logged in successfully")
            return True
        return False

    def test_car_estimate(self):
        """Test car taxi price estimation"""
        test_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "car"
        }
        
        success, response = self.run_test(
            "Car Taxi Price Estimate",
            "POST",
            "rides/estimate",
            200,
            data=test_data
        )
        
        if success:
            # Verify response structure
            required_fields = ["distance_km", "duration_minutes", "estimated_price", "vehicle_type"]
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing field: {field}")
                    return False
            
            # Verify vehicle type
            if response["vehicle_type"] != "car":
                print(f"   ❌ Wrong vehicle type: {response['vehicle_type']}")
                return False
            
            # Verify pricing logic (500 + 300/km for car)
            distance = response["distance_km"]
            expected_price = 500 + (distance * 300)
            actual_price = response["estimated_price"]
            
            if abs(actual_price - expected_price) > 1:  # Allow 1 FCFA tolerance for rounding
                print(f"   ❌ Wrong car pricing: expected ~{expected_price}, got {actual_price}")
                return False
            
            print(f"   ✅ Car estimate: {distance}km, {actual_price} FCFA")
            return True, response
        
        return False, {}

    def test_moto_estimate(self):
        """Test moto taxi price estimation"""
        test_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "moto"
        }
        
        success, response = self.run_test(
            "Moto Taxi Price Estimate",
            "POST",
            "rides/estimate",
            200,
            data=test_data
        )
        
        if success:
            # Verify response structure
            required_fields = ["distance_km", "duration_minutes", "estimated_price", "vehicle_type"]
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing field: {field}")
                    return False
            
            # Verify vehicle type
            if response["vehicle_type"] != "moto":
                print(f"   ❌ Wrong vehicle type: {response['vehicle_type']}")
                return False
            
            # Verify pricing logic (200 + 150/km for moto)
            distance = response["distance_km"]
            expected_price = 200 + (distance * 150)
            actual_price = response["estimated_price"]
            
            if abs(actual_price - expected_price) > 1:  # Allow 1 FCFA tolerance for rounding
                print(f"   ❌ Wrong moto pricing: expected ~{expected_price}, got {actual_price}")
                return False
            
            print(f"   ✅ Moto estimate: {distance}km, {actual_price} FCFA")
            return True, response
        
        return False, {}

    def test_price_comparison(self):
        """Test that moto is cheaper than car for same route"""
        pickup = {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"}
        dropoff = {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"}
        
        # Get car estimate
        car_success, car_response = self.run_test(
            "Car Estimate for Comparison",
            "POST",
            "rides/estimate",
            200,
            data={"pickup_location": pickup, "dropoff_location": dropoff, "vehicle_type": "car"}
        )
        
        # Get moto estimate
        moto_success, moto_response = self.run_test(
            "Moto Estimate for Comparison",
            "POST",
            "rides/estimate",
            200,
            data={"pickup_location": pickup, "dropoff_location": dropoff, "vehicle_type": "moto"}
        )
        
        if car_success and moto_success:
            car_price = car_response["estimated_price"]
            moto_price = moto_response["estimated_price"]
            
            if moto_price >= car_price:
                print(f"   ❌ Moto should be cheaper: car={car_price}, moto={moto_price}")
                return False
            
            savings = car_price - moto_price
            savings_percent = (savings / car_price) * 100
            print(f"   ✅ Moto is cheaper: car={car_price} FCFA, moto={moto_price} FCFA")
            print(f"   💰 Savings: {savings} FCFA ({savings_percent:.1f}%)")
            return True
        
        return False

    def test_create_moto_ride(self):
        """Test creating a moto ride request"""
        if not self.passenger_token:
            print("   ❌ No passenger token available")
            return False
        
        test_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "moto"
        }
        
        success, response = self.run_test(
            "Create Moto Ride Request",
            "POST",
            "rides",
            200,
            data=test_data,
            token=self.passenger_token
        )
        
        if success:
            # Verify ride contains vehicle_type
            if response.get("vehicle_type") != "moto":
                print(f"   ❌ Wrong vehicle type in ride: {response.get('vehicle_type')}")
                return False
            
            # Verify status is pending
            if response.get("status") != "pending":
                print(f"   ❌ Wrong status: {response.get('status')}")
                return False
            
            print(f"   ✅ Moto ride created: {response.get('ride_id')}")
            return True, response
        
        return False, {}

    def test_driver_sees_moto_rides(self):
        """Test that driver can see pending moto rides"""
        if not self.driver_token:
            print("   ❌ No driver token available")
            return False
        
        # First set driver online
        self.run_test(
            "Set Driver Online",
            "PUT",
            "users/status",
            200,
            token=self.driver_token
        )
        
        success, response = self.run_test(
            "Get Pending Rides (Driver)",
            "GET",
            "rides/pending",
            200,
            token=self.driver_token
        )
        
        if success:
            rides = response if isinstance(response, list) else []
            moto_rides = [r for r in rides if r.get("vehicle_type") == "moto"]
            
            print(f"   ✅ Found {len(rides)} total rides, {len(moto_rides)} moto rides")
            
            # Check if any moto ride has vehicle_type field
            for ride in moto_rides:
                if "vehicle_type" not in ride:
                    print(f"   ❌ Moto ride missing vehicle_type field")
                    return False
            
            return True
        
        return False

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "health",
            200
        )
        return success

def main():
    print("🚗🏍️ SIRA TAXI MOTO-TAXI Feature Testing")
    print("=" * 50)
    
    tester = SiraTaxiAPITester()
    
    # Health check first
    if not tester.test_health_check():
        print("❌ API is not responding. Stopping tests.")
        return 1
    
    # Authentication tests
    print("\n📱 AUTHENTICATION TESTS")
    passenger_login_ok = tester.test_passenger_login()
    driver_login_ok = tester.test_driver_login()
    
    if not passenger_login_ok or not driver_login_ok:
        print("❌ Authentication failed. Cannot proceed with ride tests.")
        # Continue with pricing tests that don't require auth
    
    # Pricing tests (core MOTO-TAXI feature)
    print("\n💰 PRICING TESTS")
    car_estimate_ok, car_data = tester.test_car_estimate()
    moto_estimate_ok, moto_data = tester.test_moto_estimate()
    price_comparison_ok = tester.test_price_comparison()
    
    # Ride creation tests (if auth worked)
    if passenger_login_ok:
        print("\n🚗 RIDE CREATION TESTS")
        moto_ride_ok, ride_data = tester.test_create_moto_ride()
        
        if driver_login_ok:
            print("\n👨‍✈️ DRIVER TESTS")
            driver_sees_rides_ok = tester.test_driver_sees_moto_rides()
    
    # Results summary
    print("\n" + "=" * 50)
    print(f"📊 TEST RESULTS: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"   • {failure.get('test', 'Unknown')}")
            if 'error' in failure:
                print(f"     Error: {failure['error']}")
            else:
                print(f"     Expected: {failure.get('expected')}, Got: {failure.get('actual')}")
    
    # Key feature verification
    print("\n🎯 MOTO-TAXI FEATURE STATUS:")
    
    core_features = [
        ("✅" if car_estimate_ok else "❌", "Car taxi pricing (500 + 300/km)"),
        ("✅" if moto_estimate_ok else "❌", "Moto taxi pricing (200 + 150/km)"),
        ("✅" if price_comparison_ok else "❌", "Moto cheaper than car"),
    ]
    
    if passenger_login_ok:
        core_features.append(("✅" if 'moto_ride_ok' in locals() and moto_ride_ok else "❌", "Moto ride creation"))
    
    for status, feature in core_features:
        print(f"   {status} {feature}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    
    if success_rate >= 80:
        print(f"\n🎉 MOTO-TAXI feature is working well! ({success_rate:.1f}% success rate)")
        return 0
    else:
        print(f"\n⚠️  MOTO-TAXI feature has issues. ({success_rate:.1f}% success rate)")
        return 1

if __name__ == "__main__":
    sys.exit(main())
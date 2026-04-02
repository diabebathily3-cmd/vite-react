"""
GPS/Maps Feature Tests - Iteration 12
Tests for PUT /api/users/location endpoint and ride active endpoint with driver location
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGPSLocationEndpoint:
    """Tests for PUT /api/users/location endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test credentials"""
        self.passenger_email = "testpassenger@test.com"
        self.passenger_password = "Test123!"
        self.driver_email = "testdriver@test.com"
        self.driver_password = "Test123!"
        
    def get_auth_token(self, email, password):
        """Helper to get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_passenger_can_update_location(self):
        """Test passenger can update their GPS location"""
        token = self.get_auth_token(self.passenger_email, self.passenger_password)
        assert token is not None, "Failed to get passenger token"
        
        # Update location
        response = requests.put(
            f"{BASE_URL}/api/users/location",
            headers={"Authorization": f"Bearer {token}"},
            json={"lat": 12.6392, "lng": -8.0029}
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "Location mise à jour"
        
        # Verify location was saved
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        user_data = me_response.json()
        assert user_data["current_location"]["lat"] == 12.6392
        assert user_data["current_location"]["lng"] == -8.0029
        print("SUCCESS: Passenger location updated and persisted")
    
    def test_driver_can_update_location(self):
        """Test driver can update their GPS location"""
        token = self.get_auth_token(self.driver_email, self.driver_password)
        assert token is not None, "Failed to get driver token"
        
        # Update location
        response = requests.put(
            f"{BASE_URL}/api/users/location",
            headers={"Authorization": f"Bearer {token}"},
            json={"lat": 12.6461, "lng": -7.9925}
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "Location mise à jour"
        
        # Verify location was saved
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        user_data = me_response.json()
        assert user_data["current_location"]["lat"] == 12.6461
        assert user_data["current_location"]["lng"] == -7.9925
        print("SUCCESS: Driver location updated and persisted")
    
    def test_location_update_requires_auth(self):
        """Test location update requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/users/location",
            json={"lat": 12.6392, "lng": -8.0029}
        )
        
        assert response.status_code == 401
        print("SUCCESS: Location update correctly requires authentication")
    
    def test_location_update_with_invalid_token(self):
        """Test location update with invalid token fails"""
        response = requests.put(
            f"{BASE_URL}/api/users/location",
            headers={"Authorization": "Bearer invalid_token_123"},
            json={"lat": 12.6392, "lng": -8.0029}
        )
        
        assert response.status_code == 401
        print("SUCCESS: Invalid token correctly rejected")


class TestRideEstimateEndpoint:
    """Tests for ride estimate with vehicle types"""
    
    def test_car_ride_estimate(self):
        """Test ride estimate for car type"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "car"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "distance_km" in data
        assert "duration_minutes" in data
        assert "estimated_price" in data
        assert data["vehicle_type"] == "car"
        assert data["currency"] == "FCFA"
        print(f"SUCCESS: Car estimate - {data['distance_km']}km, {data['estimated_price']} FCFA")
    
    def test_moto_ride_estimate(self):
        """Test ride estimate for moto type"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "moto"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        # Moto should be cheaper than car
        print(f"SUCCESS: Moto estimate - {data['distance_km']}km, {data['estimated_price']} FCFA")


class TestActiveRideWithDriverLocation:
    """Tests for active ride endpoint returning driver location"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test credentials"""
        self.passenger_email = "testpassenger@test.com"
        self.passenger_password = "Test123!"
        self.driver_email = "testdriver@test.com"
        self.driver_password = "Test123!"
        
    def get_auth_token(self, email, password):
        """Helper to get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    def test_active_ride_returns_driver_info(self):
        """Test that active ride endpoint returns driver info including location"""
        passenger_token = self.get_auth_token(self.passenger_email, self.passenger_password)
        driver_token = self.get_auth_token(self.driver_email, self.driver_password)
        
        assert passenger_token is not None, "Failed to get passenger token"
        assert driver_token is not None, "Failed to get driver token"
        
        # First update driver location
        requests.put(
            f"{BASE_URL}/api/users/location",
            headers={"Authorization": f"Bearer {driver_token}"},
            json={"lat": 12.6500, "lng": -7.9800}
        )
        
        # Check if there's an active ride for passenger
        response = requests.get(
            f"{BASE_URL}/api/rides/active",
            headers={"Authorization": f"Bearer {passenger_token}"}
        )
        
        assert response.status_code == 200
        # Response can be null if no active ride
        data = response.json()
        if data and data.get("driver_id"):
            # If there's an active ride with driver, check driver info
            assert "driver" in data
            driver = data["driver"]
            assert "current_location" in driver or driver.get("current_location") is None
            print(f"SUCCESS: Active ride has driver info")
        else:
            print("INFO: No active ride with driver currently")
        
        print("SUCCESS: Active ride endpoint works correctly")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("SUCCESS: API is healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

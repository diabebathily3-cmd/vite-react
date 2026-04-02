"""
Test ride booking flow for SIRA TAXI
Tests: POST /api/rides, GET /api/rides/active, PUT /api/rides/{ride_id}/status
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test passenger credentials
TEST_PASSENGER_EMAIL = f"test_passenger_{uuid.uuid4().hex[:6]}@test.ml"
TEST_PASSENGER_PASSWORD = "Test123!"
TEST_PASSENGER_NAME = "Test Passenger"
TEST_PASSENGER_PHONE = "+223 70 00 00 01"

# Bamako locations for testing
PICKUP_LOCATION = {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"}
DROPOFF_LOCATION = {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"}


class TestRideBookingFlow:
    """Test the complete ride booking flow"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a requests session"""
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def passenger_token(self, session):
        """Register a test passenger and get token"""
        # Register new passenger
        register_response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_PASSENGER_EMAIL,
            "password": TEST_PASSENGER_PASSWORD,
            "name": TEST_PASSENGER_NAME,
            "phone": TEST_PASSENGER_PHONE,
            "role": "passenger"
        })
        
        if register_response.status_code == 200:
            token = register_response.json().get("token")
            return token
        elif register_response.status_code == 400:
            # User exists, try login
            login_response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_PASSENGER_EMAIL,
                "password": TEST_PASSENGER_PASSWORD
            })
            if login_response.status_code == 200:
                return login_response.json().get("token")
        
        pytest.skip(f"Could not authenticate passenger: {register_response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, passenger_token):
        """Get auth headers with token"""
        return {"Authorization": f"Bearer {passenger_token}"}
    
    def test_health_check(self, session):
        """Test API health endpoint"""
        response = session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_ride_estimate(self, session, auth_headers):
        """Test ride price estimation"""
        response = session.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": PICKUP_LOCATION,
            "dropoff_location": DROPOFF_LOCATION,
            "payment_method": "cash",
            "vehicle_type": "car"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "distance_km" in data
        assert "duration_minutes" in data
        assert "estimated_price" in data
        assert data["estimated_price"] > 0
        assert data["currency"] == "FCFA"
        print(f"✓ Ride estimate: {data['distance_km']}km, {data['estimated_price']} FCFA")
    
    def test_ride_estimate_moto(self, session, auth_headers):
        """Test moto-taxi price estimation (should be cheaper)"""
        response = session.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": PICKUP_LOCATION,
            "dropoff_location": DROPOFF_LOCATION,
            "payment_method": "cash",
            "vehicle_type": "moto"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        assert data["estimated_price"] > 0
        print(f"✓ Moto estimate: {data['estimated_price']} FCFA")
    
    def test_create_ride(self, session, auth_headers):
        """Test creating a new ride request"""
        # First cancel any existing active ride
        active_response = session.get(f"{BASE_URL}/api/rides/active", headers=auth_headers)
        if active_response.status_code == 200 and active_response.json():
            active_ride = active_response.json()
            session.put(
                f"{BASE_URL}/api/rides/{active_ride['ride_id']}/status",
                json={"status": "cancelled"},
                headers=auth_headers
            )
        
        # Create new ride
        response = session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": PICKUP_LOCATION,
            "dropoff_location": DROPOFF_LOCATION,
            "payment_method": "cash",
            "vehicle_type": "car"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "ride_id" in data
        assert data["status"] == "pending"
        assert data["pickup_location"]["address"] == "ACI 2000"
        assert data["dropoff_location"]["address"] == "Hamdallaye"
        assert data["driver_id"] is None  # No driver assigned yet
        print(f"✓ Ride created: {data['ride_id']}, status: {data['status']}")
        return data["ride_id"]
    
    def test_get_active_ride_pending(self, session, auth_headers):
        """Test getting active ride when in pending state"""
        response = session.get(f"{BASE_URL}/api/rides/active", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        if data:
            assert data["status"] in ["pending", "accepted", "arrived", "in_progress"]
            assert "ride_id" in data
            assert "pickup_location" in data
            assert "dropoff_location" in data
            print(f"✓ Active ride found: {data['ride_id']}, status: {data['status']}")
        else:
            print("✓ No active ride (expected if cancelled)")
    
    def test_cancel_ride(self, session, auth_headers):
        """Test cancelling a ride"""
        # Get active ride
        active_response = session.get(f"{BASE_URL}/api/rides/active", headers=auth_headers)
        
        if active_response.status_code == 200 and active_response.json():
            ride = active_response.json()
            ride_id = ride["ride_id"]
            
            # Cancel the ride
            cancel_response = session.put(
                f"{BASE_URL}/api/rides/{ride_id}/status",
                json={"status": "cancelled"},
                headers=auth_headers
            )
            
            assert cancel_response.status_code == 200
            data = cancel_response.json()
            assert data["status"] == "cancelled"
            print(f"✓ Ride cancelled: {ride_id}")
        else:
            print("✓ No active ride to cancel")
    
    def test_no_active_ride_after_cancel(self, session, auth_headers):
        """Test that no active ride exists after cancellation"""
        response = session.get(f"{BASE_URL}/api/rides/active", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be None or empty after cancellation
        assert data is None or data == {} or data.get("status") == "cancelled"
        print("✓ No active ride after cancellation")
    
    def test_can_book_new_ride_after_cancel(self, session, auth_headers):
        """Test that a new ride can be booked after cancellation"""
        # Create new ride
        response = session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6178, "lng": -7.9845, "address": "Badalabougou"},
            "dropoff_location": {"lat": 12.6512, "lng": -8.0234, "address": "Hippodrome"},
            "payment_method": "mobile_money",
            "vehicle_type": "moto"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        assert data["vehicle_type"] == "moto"
        print(f"✓ New ride booked after cancel: {data['ride_id']}")
        
        # Clean up - cancel this ride too
        session.put(
            f"{BASE_URL}/api/rides/{data['ride_id']}/status",
            json={"status": "cancelled"},
            headers=auth_headers
        )
    
    def test_ride_history(self, session, auth_headers):
        """Test getting ride history"""
        response = session.get(f"{BASE_URL}/api/rides/history", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Ride history: {len(data)} rides")


class TestRideValidation:
    """Test ride validation and error handling"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def passenger_token(self, session):
        """Use existing test passenger"""
        email = f"test_validation_{uuid.uuid4().hex[:6]}@test.ml"
        register_response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "Test123!",
            "name": "Validation Test",
            "phone": "+223 70 00 00 02",
            "role": "passenger"
        })
        
        if register_response.status_code == 200:
            return register_response.json().get("token")
        pytest.skip("Could not create test user")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, passenger_token):
        return {"Authorization": f"Bearer {passenger_token}"}
    
    def test_cannot_create_duplicate_active_ride(self, session, auth_headers):
        """Test that user cannot create a second active ride"""
        # Create first ride
        first_response = session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": PICKUP_LOCATION,
            "dropoff_location": DROPOFF_LOCATION,
            "payment_method": "cash",
            "vehicle_type": "car"
        }, headers=auth_headers)
        
        assert first_response.status_code == 200
        first_ride = first_response.json()
        
        # Try to create second ride
        second_response = session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": PICKUP_LOCATION,
            "dropoff_location": DROPOFF_LOCATION,
            "payment_method": "cash",
            "vehicle_type": "car"
        }, headers=auth_headers)
        
        assert second_response.status_code == 400
        assert "déjà une course" in second_response.json().get("detail", "").lower()
        print("✓ Duplicate ride prevented")
        
        # Clean up
        session.put(
            f"{BASE_URL}/api/rides/{first_ride['ride_id']}/status",
            json={"status": "cancelled"},
            headers=auth_headers
        )
    
    def test_invalid_status_update(self, session, auth_headers):
        """Test that invalid status updates are rejected"""
        # Create a ride
        create_response = session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": PICKUP_LOCATION,
            "dropoff_location": DROPOFF_LOCATION,
            "payment_method": "cash",
            "vehicle_type": "car"
        }, headers=auth_headers)
        
        ride_id = create_response.json()["ride_id"]
        
        # Try invalid status
        invalid_response = session.put(
            f"{BASE_URL}/api/rides/{ride_id}/status",
            json={"status": "invalid_status"},
            headers=auth_headers
        )
        
        assert invalid_response.status_code == 400
        print("✓ Invalid status rejected")
        
        # Clean up
        session.put(
            f"{BASE_URL}/api/rides/{ride_id}/status",
            json={"status": "cancelled"},
            headers=auth_headers
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

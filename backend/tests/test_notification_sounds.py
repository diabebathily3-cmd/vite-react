"""
Test notification sounds feature for SIRA TAXI
- Tests ride creation (triggers driver notifications)
- Tests ride acceptance (stops driver ringing)
- Tests sound file accessibility
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
PASSENGER_EMAIL = "testpassenger@test.com"
PASSENGER_PASSWORD = "Test123!"
DRIVER_EMAIL = "testdriver@test.com"
DRIVER_PASSWORD = "Test123!"


class TestSoundFileAccessibility:
    """Test that sound files are accessible via HTTP"""
    
    def test_ride_alert_wav_accessible(self):
        """Driver notification sound should be accessible"""
        response = requests.head(f"{BASE_URL}/ride_alert.wav", timeout=10)
        assert response.status_code == 200, f"ride_alert.wav not accessible: {response.status_code}"
        assert 'audio' in response.headers.get('content-type', ''), "ride_alert.wav should be audio type"
        print(f"✓ ride_alert.wav accessible - Content-Type: {response.headers.get('content-type')}")
    
    def test_passenger_alert_wav_accessible(self):
        """Passenger notification sound should be accessible"""
        response = requests.head(f"{BASE_URL}/passenger_alert.wav", timeout=10)
        assert response.status_code == 200, f"passenger_alert.wav not accessible: {response.status_code}"
        assert 'audio' in response.headers.get('content-type', ''), "passenger_alert.wav should be audio type"
        print(f"✓ passenger_alert.wav accessible - Content-Type: {response.headers.get('content-type')}")


class TestRideCreationForNotifications:
    """Test ride creation which triggers driver notifications"""
    
    @pytest.fixture
    def passenger_session(self):
        """Login as passenger and return session with token"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": PASSENGER_EMAIL,
            "password": PASSENGER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Passenger login failed: {response.status_code}")
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    @pytest.fixture
    def driver_session(self):
        """Login as driver and return session with token"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DRIVER_EMAIL,
            "password": DRIVER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Driver login failed: {response.status_code}")
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_create_ride_returns_pending_status(self, passenger_session):
        """POST /api/rides should create a ride with pending status"""
        # First cancel any existing active ride
        active = passenger_session.get(f"{BASE_URL}/api/rides/active")
        if active.status_code == 200 and active.json():
            ride_id = active.json().get("ride_id")
            if ride_id:
                passenger_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        
        # Create new ride
        ride_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        }
        
        response = passenger_session.post(f"{BASE_URL}/api/rides", json=ride_data)
        assert response.status_code == 200, f"Create ride failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert data.get("status") == "pending", f"Ride status should be pending, got: {data.get('status')}"
        assert data.get("ride_id"), "Ride should have ride_id"
        assert data.get("estimated_price") > 0, "Ride should have estimated price"
        
        print(f"✓ Ride created with ID: {data.get('ride_id')}, status: pending, price: {data.get('estimated_price')} FCFA")
        
        # Cleanup - cancel the ride
        ride_id = data.get("ride_id")
        passenger_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        return data
    
    def test_pending_rides_visible_to_driver(self, passenger_session, driver_session):
        """Driver should see pending rides (which triggers notification)"""
        # First cancel any existing active ride for passenger
        active = passenger_session.get(f"{BASE_URL}/api/rides/active")
        if active.status_code == 200 and active.json():
            ride_id = active.json().get("ride_id")
            if ride_id:
                passenger_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        
        # Set driver online
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        # Create a ride as passenger
        ride_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        }
        create_response = passenger_session.post(f"{BASE_URL}/api/rides", json=ride_data)
        assert create_response.status_code == 200, f"Create ride failed: {create_response.text}"
        ride_id = create_response.json().get("ride_id")
        
        # Driver should see pending rides
        pending_response = driver_session.get(f"{BASE_URL}/api/rides/pending")
        assert pending_response.status_code == 200, f"Get pending rides failed: {pending_response.status_code}"
        
        pending_rides = pending_response.json()
        assert isinstance(pending_rides, list), "Pending rides should be a list"
        
        # Find our ride in pending
        our_ride = next((r for r in pending_rides if r.get("ride_id") == ride_id), None)
        assert our_ride is not None, f"Created ride {ride_id} should be in pending rides"
        
        print(f"✓ Driver can see {len(pending_rides)} pending ride(s), including ride {ride_id}")
        
        # Cleanup
        passenger_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})


class TestRideAcceptance:
    """Test ride acceptance which stops driver ringing"""
    
    @pytest.fixture
    def passenger_session(self):
        """Login as passenger and return session with token"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": PASSENGER_EMAIL,
            "password": PASSENGER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Passenger login failed: {response.status_code}")
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    @pytest.fixture
    def driver_session(self):
        """Login as driver and return session with token"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DRIVER_EMAIL,
            "password": DRIVER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Driver login failed: {response.status_code}")
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_driver_can_accept_ride(self, passenger_session, driver_session):
        """PUT /api/rides/{id}/accept should change status to accepted"""
        # Cancel any existing active rides
        active_p = passenger_session.get(f"{BASE_URL}/api/rides/active")
        if active_p.status_code == 200 and active_p.json():
            ride_id = active_p.json().get("ride_id")
            if ride_id:
                passenger_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        
        active_d = driver_session.get(f"{BASE_URL}/api/rides/active")
        if active_d.status_code == 200 and active_d.json():
            ride_id = active_d.json().get("ride_id")
            if ride_id:
                driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        
        # Set driver online
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        # Create a ride as passenger
        ride_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        }
        create_response = passenger_session.post(f"{BASE_URL}/api/rides", json=ride_data)
        assert create_response.status_code == 200, f"Create ride failed: {create_response.text}"
        ride_id = create_response.json().get("ride_id")
        
        # Driver accepts the ride
        accept_response = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/accept")
        assert accept_response.status_code == 200, f"Accept ride failed: {accept_response.status_code} - {accept_response.text}"
        
        accepted_ride = accept_response.json()
        assert accepted_ride.get("status") == "accepted", f"Ride status should be accepted, got: {accepted_ride.get('status')}"
        assert accepted_ride.get("driver_id"), "Accepted ride should have driver_id"
        
        print(f"✓ Ride {ride_id} accepted by driver, status: {accepted_ride.get('status')}")
        
        # Cleanup - complete the ride
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "arrived"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "in_progress"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "completed"})
    
    def test_accept_clears_pending_rides(self, passenger_session, driver_session):
        """After accepting a ride, it should no longer appear in pending"""
        # Cancel any existing active rides
        active_p = passenger_session.get(f"{BASE_URL}/api/rides/active")
        if active_p.status_code == 200 and active_p.json():
            ride_id = active_p.json().get("ride_id")
            if ride_id:
                passenger_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        
        active_d = driver_session.get(f"{BASE_URL}/api/rides/active")
        if active_d.status_code == 200 and active_d.json():
            ride_id = active_d.json().get("ride_id")
            if ride_id:
                driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "cancelled"})
        
        # Set driver online
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        # Create a ride
        ride_data = {
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        }
        create_response = passenger_session.post(f"{BASE_URL}/api/rides", json=ride_data)
        ride_id = create_response.json().get("ride_id")
        
        # Accept the ride
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/accept")
        
        # Check pending rides - our ride should not be there
        pending_response = driver_session.get(f"{BASE_URL}/api/rides/pending")
        pending_rides = pending_response.json()
        
        our_ride = next((r for r in pending_rides if r.get("ride_id") == ride_id), None)
        assert our_ride is None, f"Accepted ride {ride_id} should NOT be in pending rides"
        
        print(f"✓ Accepted ride {ride_id} no longer in pending rides list")
        
        # Cleanup
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "arrived"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "in_progress"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "completed"})


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

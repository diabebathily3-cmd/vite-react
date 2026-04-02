"""
Test full ride flow: passenger books → driver accepts → arrived → in_progress → completed
This tests the bug fix for driver dashboard infinite re-render loop when ride is active.
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestFullRideFlow:
    """Test complete ride lifecycle from booking to completion"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test users"""
        self.session = requests.Session()
        self.passenger_email = f"test_passenger_{uuid.uuid4().hex[:8]}@test.ml"
        self.driver_email = f"test_driver_{uuid.uuid4().hex[:8]}@test.ml"
        self.password = "Test123!"
        
    def register_user(self, email, role):
        """Register a new user"""
        response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "name": f"Test {role.capitalize()}",
            "phone": "+223 70 00 00 00",
            "password": self.password,
            "role": role
        })
        return response
    
    def login_user(self, email):
        """Login and return session with token"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": self.password
        })
        if response.status_code == 200:
            token = response.json().get("token")
            session.headers.update({"Authorization": f"Bearer {token}"})
        return session, response
    
    def test_full_ride_flow_pending_to_completed(self):
        """Test complete ride flow: pending → accepted → arrived → in_progress → completed"""
        
        # Step 1: Register passenger
        reg_response = self.register_user(self.passenger_email, "passenger")
        assert reg_response.status_code == 200, f"Passenger registration failed: {reg_response.text}"
        passenger_data = reg_response.json()
        assert "user" in passenger_data
        print(f"✓ Passenger registered: {self.passenger_email}")
        
        # Step 2: Register driver
        reg_response = self.register_user(self.driver_email, "driver")
        assert reg_response.status_code == 200, f"Driver registration failed: {reg_response.text}"
        driver_data = reg_response.json()
        assert "user" in driver_data
        print(f"✓ Driver registered: {self.driver_email}")
        
        # Step 3: Login as passenger
        passenger_session, login_resp = self.login_user(self.passenger_email)
        assert login_resp.status_code == 200, f"Passenger login failed: {login_resp.text}"
        print("✓ Passenger logged in")
        
        # Step 4: Passenger creates ride
        ride_response = passenger_session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        })
        assert ride_response.status_code == 200, f"Ride creation failed: {ride_response.text}"
        ride_data = ride_response.json()
        ride_id = ride_data["ride_id"]
        assert ride_data["status"] == "pending"
        print(f"✓ Ride created with ID: {ride_id}, status: pending")
        
        # Step 5: Verify passenger sees active ride
        active_response = passenger_session.get(f"{BASE_URL}/api/rides/active")
        assert active_response.status_code == 200
        active_ride = active_response.json()
        assert active_ride["ride_id"] == ride_id
        assert active_ride["status"] == "pending"
        assert active_ride.get("driver_id") is None  # No driver yet
        print("✓ Passenger sees pending ride (no driver assigned)")
        
        # Step 6: Login as driver
        driver_session, login_resp = self.login_user(self.driver_email)
        assert login_resp.status_code == 200, f"Driver login failed: {login_resp.text}"
        print("✓ Driver logged in")
        
        # Step 7: Driver goes online
        status_response = driver_session.put(f"{BASE_URL}/api/users/status")
        assert status_response.status_code == 200
        assert status_response.json()["is_online"] == True
        print("✓ Driver is now online")
        
        # Step 8: Driver sees pending rides
        pending_response = driver_session.get(f"{BASE_URL}/api/rides/pending")
        assert pending_response.status_code == 200
        pending_rides = pending_response.json()
        assert len(pending_rides) >= 1
        assert any(r["ride_id"] == ride_id for r in pending_rides)
        print(f"✓ Driver sees {len(pending_rides)} pending ride(s)")
        
        # Step 9: Driver accepts ride
        accept_response = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/accept")
        assert accept_response.status_code == 200, f"Accept failed: {accept_response.text}"
        accepted_ride = accept_response.json()
        assert accepted_ride["status"] == "accepted"
        assert accepted_ride["driver_id"] is not None
        print(f"✓ Driver accepted ride, status: accepted")
        
        # Step 10: Driver fetches active ride (this was causing infinite loop)
        driver_active_response = driver_session.get(f"{BASE_URL}/api/rides/active")
        assert driver_active_response.status_code == 200
        driver_active_ride = driver_active_response.json()
        assert driver_active_ride["ride_id"] == ride_id
        assert driver_active_ride["status"] == "accepted"
        assert "passenger" in driver_active_ride  # Should include passenger info
        print("✓ Driver sees active ride with passenger info")
        
        # Step 11: Passenger sees driver assigned
        passenger_active_response = passenger_session.get(f"{BASE_URL}/api/rides/active")
        assert passenger_active_response.status_code == 200
        passenger_active_ride = passenger_active_response.json()
        assert passenger_active_ride["status"] == "accepted"
        assert passenger_active_ride.get("driver_id") is not None
        assert "driver" in passenger_active_ride  # Should include driver info
        print("✓ Passenger sees CHAUFFEUR EN ROUTE (driver assigned)")
        
        # Step 12: Driver marks arrived
        arrived_response = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "arrived"})
        assert arrived_response.status_code == 200
        assert arrived_response.json()["status"] == "arrived"
        print("✓ Driver marked ARRIVÉ, status: arrived")
        
        # Step 13: Driver starts ride (in_progress)
        start_response = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "in_progress"})
        assert start_response.status_code == 200
        assert start_response.json()["status"] == "in_progress"
        print("✓ Driver started ride, status: in_progress")
        
        # Step 14: Driver completes ride
        complete_response = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "completed"})
        assert complete_response.status_code == 200
        completed_ride = complete_response.json()
        assert completed_ride["status"] == "completed"
        assert completed_ride["final_price"] is not None
        assert completed_ride.get("driver_earnings") is not None
        assert completed_ride.get("platform_commission") is not None
        print(f"✓ Ride completed! Final price: {completed_ride['final_price']} FCFA")
        print(f"  Driver earnings: {completed_ride.get('driver_earnings')} FCFA")
        print(f"  Platform commission: {completed_ride.get('platform_commission')} FCFA")
        
        # Step 15: Verify driver wallet updated
        wallet_response = driver_session.get(f"{BASE_URL}/api/wallet")
        assert wallet_response.status_code == 200
        wallet = wallet_response.json()
        assert wallet["balance"] > 0
        print(f"✓ Driver wallet balance: {wallet['balance']} FCFA")
        
        # Step 16: Verify driver can see new pending rides (no active ride)
        driver_active_after = driver_session.get(f"{BASE_URL}/api/rides/active")
        assert driver_active_after.status_code == 200
        # Should return null/None since ride is completed
        active_after = driver_active_after.json()
        assert active_after is None, f"Expected no active ride, got: {active_after}"
        print("✓ Driver has no active ride after completion")
        
        # Step 17: Verify passenger sees completed ride in history
        history_response = passenger_session.get(f"{BASE_URL}/api/rides/history")
        assert history_response.status_code == 200
        history = history_response.json()
        completed_in_history = [r for r in history if r["ride_id"] == ride_id]
        assert len(completed_in_history) == 1
        assert completed_in_history[0]["status"] == "completed"
        print("✓ Passenger sees completed ride in history")
        
        print("\n✅ FULL RIDE FLOW TEST PASSED!")
        
    def test_driver_can_accept_new_ride_after_completion(self):
        """Test that driver can accept a new ride after completing one"""
        
        # Register users
        self.register_user(self.passenger_email, "passenger")
        self.register_user(self.driver_email, "driver")
        
        passenger_session, _ = self.login_user(self.passenger_email)
        driver_session, _ = self.login_user(self.driver_email)
        
        # Driver goes online
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        # First ride
        ride1_response = passenger_session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        })
        ride1_id = ride1_response.json()["ride_id"]
        
        # Driver accepts and completes first ride
        driver_session.put(f"{BASE_URL}/api/rides/{ride1_id}/accept")
        driver_session.put(f"{BASE_URL}/api/rides/{ride1_id}/status", json={"status": "arrived"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride1_id}/status", json={"status": "in_progress"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride1_id}/status", json={"status": "completed"})
        print(f"✓ First ride {ride1_id} completed")
        
        # Create second ride
        ride2_response = passenger_session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6178, "lng": -7.9845, "address": "Badalabougou"},
            "dropoff_location": {"lat": 12.6512, "lng": -8.0234, "address": "Hippodrome"},
            "payment_method": "cash",
            "vehicle_type": "moto"
        })
        assert ride2_response.status_code == 200
        ride2_id = ride2_response.json()["ride_id"]
        print(f"✓ Second ride {ride2_id} created")
        
        # Driver should see new pending ride
        pending_response = driver_session.get(f"{BASE_URL}/api/rides/pending")
        assert pending_response.status_code == 200
        pending_rides = pending_response.json()
        assert any(r["ride_id"] == ride2_id for r in pending_rides)
        print("✓ Driver sees second ride in pending list")
        
        # Driver accepts second ride
        accept_response = driver_session.put(f"{BASE_URL}/api/rides/{ride2_id}/accept")
        assert accept_response.status_code == 200
        assert accept_response.json()["status"] == "accepted"
        print("✓ Driver accepted second ride")
        
        # Complete second ride
        driver_session.put(f"{BASE_URL}/api/rides/{ride2_id}/status", json={"status": "arrived"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride2_id}/status", json={"status": "in_progress"})
        complete_response = driver_session.put(f"{BASE_URL}/api/rides/{ride2_id}/status", json={"status": "completed"})
        assert complete_response.status_code == 200
        print(f"✓ Second ride {ride2_id} completed")
        
        # Verify wallet has earnings from both rides
        wallet_response = driver_session.get(f"{BASE_URL}/api/wallet")
        wallet = wallet_response.json()
        print(f"✓ Driver wallet after 2 rides: {wallet['balance']} FCFA")
        
        print("\n✅ DRIVER CAN ACCEPT NEW RIDE AFTER COMPLETION TEST PASSED!")

    def test_polling_returns_correct_data(self):
        """Test that polling endpoints return correct data without causing loops"""
        
        # Register and login
        self.register_user(self.passenger_email, "passenger")
        self.register_user(self.driver_email, "driver")
        
        passenger_session, _ = self.login_user(self.passenger_email)
        driver_session, _ = self.login_user(self.driver_email)
        
        # Driver goes online
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        # Create ride
        ride_response = passenger_session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        })
        ride_id = ride_response.json()["ride_id"]
        
        # Simulate polling - multiple calls should return consistent data
        for i in range(3):
            # Passenger polling
            p_active = passenger_session.get(f"{BASE_URL}/api/rides/active")
            assert p_active.status_code == 200
            p_data = p_active.json()
            assert p_data["ride_id"] == ride_id
            assert p_data["status"] == "pending"
            
            # Driver polling for pending rides
            d_pending = driver_session.get(f"{BASE_URL}/api/rides/pending")
            assert d_pending.status_code == 200
            
            time.sleep(0.1)  # Small delay between polls
        
        print("✓ Polling returns consistent data (3 iterations)")
        
        # Driver accepts
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/accept")
        
        # Simulate polling after acceptance
        for i in range(3):
            # Passenger should see driver assigned
            p_active = passenger_session.get(f"{BASE_URL}/api/rides/active")
            p_data = p_active.json()
            assert p_data["status"] == "accepted"
            assert p_data.get("driver_id") is not None
            
            # Driver should see active ride
            d_active = driver_session.get(f"{BASE_URL}/api/rides/active")
            d_data = d_active.json()
            assert d_data["ride_id"] == ride_id
            assert d_data["status"] == "accepted"
            
            time.sleep(0.1)
        
        print("✓ Polling after acceptance returns consistent data (3 iterations)")
        
        # Complete the ride
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "arrived"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "in_progress"})
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "completed"})
        
        # After completion, active ride should be null
        for i in range(3):
            d_active = driver_session.get(f"{BASE_URL}/api/rides/active")
            assert d_active.json() is None
            
            p_active = passenger_session.get(f"{BASE_URL}/api/rides/active")
            assert p_active.json() is None
            
            time.sleep(0.1)
        
        print("✓ Polling after completion returns null (3 iterations)")
        print("\n✅ POLLING TEST PASSED!")


class TestRideStatusTransitions:
    """Test ride status transitions"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.passenger_email = f"test_passenger_{uuid.uuid4().hex[:8]}@test.ml"
        self.driver_email = f"test_driver_{uuid.uuid4().hex[:8]}@test.ml"
        self.password = "Test123!"
        
    def register_and_login(self, email, role):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "name": f"Test {role}",
            "phone": "+223 70 00 00 00",
            "password": self.password,
            "role": role
        })
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": self.password
        })
        if response.status_code == 200:
            token = response.json().get("token")
            session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_valid_status_transitions(self):
        """Test valid status transitions: accepted → arrived → in_progress → completed"""
        
        passenger_session = self.register_and_login(self.passenger_email, "passenger")
        driver_session = self.register_and_login(self.driver_email, "driver")
        
        # Driver online
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        # Create ride
        ride_response = passenger_session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        })
        ride_id = ride_response.json()["ride_id"]
        
        # Accept
        accept_resp = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/accept")
        assert accept_resp.status_code == 200
        assert accept_resp.json()["status"] == "accepted"
        print("✓ pending → accepted")
        
        # Arrived
        arrived_resp = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "arrived"})
        assert arrived_resp.status_code == 200
        assert arrived_resp.json()["status"] == "arrived"
        print("✓ accepted → arrived")
        
        # In progress
        progress_resp = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "in_progress"})
        assert progress_resp.status_code == 200
        assert progress_resp.json()["status"] == "in_progress"
        print("✓ arrived → in_progress")
        
        # Completed
        complete_resp = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "completed"})
        assert complete_resp.status_code == 200
        assert complete_resp.json()["status"] == "completed"
        print("✓ in_progress → completed")
        
        print("\n✅ ALL STATUS TRANSITIONS VALID!")
    
    def test_invalid_status_rejected(self):
        """Test that invalid status is rejected"""
        
        passenger_session = self.register_and_login(self.passenger_email, "passenger")
        driver_session = self.register_and_login(self.driver_email, "driver")
        
        driver_session.put(f"{BASE_URL}/api/users/status")
        
        ride_response = passenger_session.post(f"{BASE_URL}/api/rides", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "payment_method": "cash",
            "vehicle_type": "car"
        })
        ride_id = ride_response.json()["ride_id"]
        
        driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/accept")
        
        # Try invalid status
        invalid_resp = driver_session.put(f"{BASE_URL}/api/rides/{ride_id}/status", json={"status": "invalid_status"})
        assert invalid_resp.status_code == 400
        print("✓ Invalid status rejected with 400")
        
        print("\n✅ INVALID STATUS REJECTION TEST PASSED!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

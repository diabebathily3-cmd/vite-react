"""
Test vehicle category filtering for rides
Tests that drivers only see rides matching their vehicle_category (car/moto)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
PASSENGER_EMAIL = f"test_passenger_{uuid.uuid4().hex[:6]}@test.ml"
DRIVER_CAR_EMAIL = f"test_driver_car_{uuid.uuid4().hex[:6]}@test.ml"
DRIVER_MOTO_EMAIL = f"test_driver_moto_{uuid.uuid4().hex[:6]}@test.ml"
TEST_PASSWORD = "Test123!"


class TestVehicleCategoryFilter:
    """Test that /api/rides/pending filters by driver's vehicle_category"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def passenger_token(self, session):
        """Register a test passenger"""
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": PASSENGER_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Passenger",
            "phone": "+22370000001",
            "role": "passenger"
        })
        if response.status_code == 200:
            return response.json().get("token")
        elif response.status_code == 400:
            # User exists, login instead
            response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": PASSENGER_EMAIL,
                "password": TEST_PASSWORD
            })
            return response.json().get("token")
        pytest.skip(f"Failed to create passenger: {response.text}")
    
    @pytest.fixture(scope="class")
    def driver_car_token(self, session):
        """Register a test driver with car vehicle_category"""
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": DRIVER_CAR_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Driver Car",
            "phone": "+22370000002",
            "role": "driver"
        })
        if response.status_code == 200:
            token = response.json().get("token")
        elif response.status_code == 400:
            response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": DRIVER_CAR_EMAIL,
                "password": TEST_PASSWORD
            })
            token = response.json().get("token")
        else:
            pytest.skip(f"Failed to create car driver: {response.text}")
            return None
        
        # Set vehicle info with car category
        session.put(
            f"{BASE_URL}/api/users/vehicle",
            json={
                "make": "Toyota",
                "model": "Corolla",
                "year": "2020",
                "plate": "AB-1234-ML",
                "color": "White",
                "vehicle_category": "car"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        return token
    
    @pytest.fixture(scope="class")
    def driver_moto_token(self, session):
        """Register a test driver with moto vehicle_category"""
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": DRIVER_MOTO_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Driver Moto",
            "phone": "+22370000003",
            "role": "driver"
        })
        if response.status_code == 200:
            token = response.json().get("token")
        elif response.status_code == 400:
            response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": DRIVER_MOTO_EMAIL,
                "password": TEST_PASSWORD
            })
            token = response.json().get("token")
        else:
            pytest.skip(f"Failed to create moto driver: {response.text}")
            return None
        
        # Set vehicle info with moto category
        session.put(
            f"{BASE_URL}/api/users/vehicle",
            json={
                "make": "Honda",
                "model": "CBR",
                "year": "2022",
                "plate": "MOTO-123",
                "color": "Red",
                "vehicle_category": "moto"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        return token
    
    def test_create_car_ride(self, session, passenger_token):
        """Create a ride requesting a car"""
        response = session.post(
            f"{BASE_URL}/api/rides",
            json={
                "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
                "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
                "payment_method": "cash",
                "vehicle_type": "car"
            },
            headers={"Authorization": f"Bearer {passenger_token}"}
        )
        
        # May fail if passenger already has active ride
        if response.status_code == 400 and "course en cours" in response.text.lower():
            print("Passenger already has active ride - skipping car ride creation")
            pytest.skip("Passenger has active ride")
        
        assert response.status_code == 200, f"Failed to create car ride: {response.text}"
        data = response.json()
        assert data["vehicle_type"] == "car"
        assert data["status"] == "pending"
        print(f"Created car ride: {data['ride_id']}")
        return data["ride_id"]
    
    def test_car_driver_sees_car_rides(self, session, driver_car_token):
        """Car driver should see car rides in pending list"""
        # Go online first
        session.put(
            f"{BASE_URL}/api/users/status",
            headers={"Authorization": f"Bearer {driver_car_token}"}
        )
        
        response = session.get(
            f"{BASE_URL}/api/rides/pending",
            headers={"Authorization": f"Bearer {driver_car_token}"}
        )
        
        assert response.status_code == 200
        rides = response.json()
        print(f"Car driver sees {len(rides)} pending rides")
        
        # All rides should be car type
        for ride in rides:
            assert ride["vehicle_type"] == "car", f"Car driver should only see car rides, got {ride['vehicle_type']}"
        
        print("PASS: Car driver only sees car rides")
    
    def test_moto_driver_does_not_see_car_rides(self, session, driver_moto_token):
        """Moto driver should NOT see car rides in pending list"""
        # Go online first
        session.put(
            f"{BASE_URL}/api/users/status",
            headers={"Authorization": f"Bearer {driver_moto_token}"}
        )
        
        response = session.get(
            f"{BASE_URL}/api/rides/pending",
            headers={"Authorization": f"Bearer {driver_moto_token}"}
        )
        
        assert response.status_code == 200
        rides = response.json()
        print(f"Moto driver sees {len(rides)} pending rides")
        
        # All rides should be moto type (not car)
        for ride in rides:
            assert ride["vehicle_type"] == "moto", f"Moto driver should only see moto rides, got {ride['vehicle_type']}"
        
        print("PASS: Moto driver only sees moto rides (no car rides)")


class TestRideEstimate:
    """Test ride estimate for different vehicle types"""
    
    def test_car_estimate(self):
        """Test ride estimate for car"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "car"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "car"
        assert data["estimated_price"] > 0
        assert data["distance_km"] > 0
        assert data["duration_minutes"] > 0
        print(f"Car estimate: {data['estimated_price']} FCFA for {data['distance_km']} km")
    
    def test_moto_estimate(self):
        """Test ride estimate for moto"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "moto"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        assert data["estimated_price"] > 0
        print(f"Moto estimate: {data['estimated_price']} FCFA for {data['distance_km']} km")
    
    def test_moto_cheaper_than_car(self):
        """Moto should be cheaper than car for same distance"""
        car_response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "car"
        })
        
        moto_response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
            "dropoff_location": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
            "vehicle_type": "moto"
        })
        
        car_price = car_response.json()["estimated_price"]
        moto_price = moto_response.json()["estimated_price"]
        
        assert moto_price < car_price, f"Moto ({moto_price}) should be cheaper than car ({car_price})"
        print(f"PASS: Moto ({moto_price} FCFA) is cheaper than car ({car_price} FCFA)")


class TestVehicleInfoUpdate:
    """Test updating vehicle info with vehicle_category"""
    
    def test_update_vehicle_with_category(self):
        """Test updating vehicle info with vehicle_category field"""
        # Register a test driver
        email = f"test_vehicle_{uuid.uuid4().hex[:6]}@test.ml"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": TEST_PASSWORD,
            "name": "Test Vehicle Driver",
            "phone": "+22370000099",
            "role": "driver"
        })
        
        if response.status_code not in [200, 400]:
            pytest.skip(f"Failed to create driver: {response.text}")
        
        token = response.json().get("token")
        if not token:
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": TEST_PASSWORD
            })
            token = response.json().get("token")
        
        # Update vehicle with car category
        response = requests.put(
            f"{BASE_URL}/api/users/vehicle",
            json={
                "make": "Mercedes",
                "model": "C-Class",
                "year": "2021",
                "plate": "ML-5678",
                "color": "Black",
                "vehicle_category": "car"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        print("PASS: Vehicle info updated with car category")
        
        # Update to moto category
        response = requests.put(
            f"{BASE_URL}/api/users/vehicle",
            json={
                "make": "Yamaha",
                "model": "MT-07",
                "year": "2023",
                "plate": "MOTO-999",
                "color": "Blue",
                "vehicle_category": "moto"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        print("PASS: Vehicle info updated with moto category")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

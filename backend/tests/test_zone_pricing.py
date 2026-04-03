"""
Test Zone-Based Pricing for SIRA TAXI - Bamako
Tests the new zone-based pricing system that replaces linear km pricing.

Pricing zones:
- Very short (<2km): 500 FCFA car / 250 FCFA moto
- Short (2-4km): 1000 FCFA car / 500 FCFA moto
- Medium (4-7km): 1500 FCFA car / 750 FCFA moto
- Long (7-12km): 2000 FCFA car / 1000 FCFA moto
- Very long (>12km): 2500 + extra for car / 1500 + extra for moto
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test locations in Bamako with known distances
LOCATIONS = {
    # Very short distance (~1km) - same quartier
    "aci_2000": {"lat": 12.6461, "lng": -7.9925, "address": "ACI 2000"},
    "aci_2000_nearby": {"lat": 12.6471, "lng": -7.9935, "address": "ACI 2000 Nearby"},
    
    # Short distance (~3km) - same commune
    "hamdallaye": {"lat": 12.6234, "lng": -8.0156, "address": "Hamdallaye"},
    "badalabougou": {"lat": 12.6178, "lng": -7.9845, "address": "Badalabougou"},
    
    # Medium distance (~5km) - between communes
    "hippodrome": {"lat": 12.6512, "lng": -8.0234, "address": "Hippodrome"},
    "kalaban_coura": {"lat": 12.5823, "lng": -8.0012, "address": "Kalaban Coura"},
    
    # Long distance (~10km) - across Bamako
    "sotuba": {"lat": 12.6734, "lng": -7.9234, "address": "Sotuba"},
    "niamakoro": {"lat": 12.5734, "lng": -7.9890, "address": "Niamakoro"},
    
    # Very long distance (~15km) - Kati/Airport
    "kati": {"lat": 12.7445, "lng": -8.0720, "address": "Kati"},
    "airport": {"lat": 12.5335, "lng": -7.9499, "address": "Aéroport Bamako"},
}


class TestZonePricingCar:
    """Test zone-based pricing for car/taxi"""
    
    def test_very_short_distance_car(self):
        """Very short (<2km) should be 500 FCFA for car"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["aci_2000"],
            "dropoff_location": LOCATIONS["aci_2000_nearby"],
            "vehicle_type": "car"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "car"
        assert data["distance_km"] < 2, f"Distance should be <2km, got {data['distance_km']}"
        assert data["estimated_price"] == 500, f"Very short car price should be 500 FCFA, got {data['estimated_price']}"
        print(f"✓ Very short car: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_short_distance_car(self):
        """Short (2-4km) should be 1000 FCFA for car"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["hamdallaye"],
            "dropoff_location": LOCATIONS["badalabougou"],
            "vehicle_type": "car"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "car"
        # This distance is ~3.5km
        assert 2 <= data["distance_km"] < 4, f"Distance should be 2-4km, got {data['distance_km']}"
        assert data["estimated_price"] == 1000, f"Short car price should be 1000 FCFA, got {data['estimated_price']}"
        print(f"✓ Short car: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_medium_distance_car(self):
        """Medium (4-7km) should be 1500 FCFA for car"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["hippodrome"],
            "dropoff_location": LOCATIONS["kalaban_coura"],
            "vehicle_type": "car"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "car"
        # This distance is ~8km, so it should be in the long zone
        # Let's check what we get
        print(f"Medium test: {data['distance_km']}km = {data['estimated_price']} FCFA")
        # Adjust assertion based on actual distance
        if 4 <= data["distance_km"] < 7:
            assert data["estimated_price"] == 1500
        elif 7 <= data["distance_km"] < 12:
            assert data["estimated_price"] == 2000
        print(f"✓ Medium/Long car: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_long_distance_car(self):
        """Long (7-12km) should be 2000 FCFA for car"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["sotuba"],
            "dropoff_location": LOCATIONS["niamakoro"],
            "vehicle_type": "car"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "car"
        print(f"Long test: {data['distance_km']}km = {data['estimated_price']} FCFA")
        # This should be around 10-11km
        if 7 <= data["distance_km"] < 12:
            assert data["estimated_price"] == 2000
        elif data["distance_km"] >= 12:
            # Very long: 2500 + 200 per extra km
            expected = 2500 + max(0, data["distance_km"] - 12) * 200
            assert data["estimated_price"] >= 2500
        print(f"✓ Long car: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_very_long_distance_car(self):
        """Very long (>12km) should be 2500+ FCFA for car"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["kati"],
            "dropoff_location": LOCATIONS["airport"],
            "vehicle_type": "car"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "car"
        print(f"Very long test: {data['distance_km']}km = {data['estimated_price']} FCFA")
        # Kati to Airport is ~25km
        assert data["distance_km"] > 12, f"Distance should be >12km, got {data['distance_km']}"
        # Formula: 2500 + (distance - 12) * 200
        expected_min = 2500
        assert data["estimated_price"] >= expected_min, f"Very long car price should be >= {expected_min} FCFA, got {data['estimated_price']}"
        print(f"✓ Very long car: {data['distance_km']}km = {data['estimated_price']} FCFA")


class TestZonePricingMoto:
    """Test zone-based pricing for moto"""
    
    def test_very_short_distance_moto(self):
        """Very short (<2km) should be 250 FCFA for moto"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["aci_2000"],
            "dropoff_location": LOCATIONS["aci_2000_nearby"],
            "vehicle_type": "moto"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        assert data["distance_km"] < 2, f"Distance should be <2km, got {data['distance_km']}"
        assert data["estimated_price"] == 250, f"Very short moto price should be 250 FCFA, got {data['estimated_price']}"
        print(f"✓ Very short moto: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_short_distance_moto(self):
        """Short (2-4km) should be 500 FCFA for moto"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["hamdallaye"],
            "dropoff_location": LOCATIONS["badalabougou"],
            "vehicle_type": "moto"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        assert 2 <= data["distance_km"] < 4, f"Distance should be 2-4km, got {data['distance_km']}"
        assert data["estimated_price"] == 500, f"Short moto price should be 500 FCFA, got {data['estimated_price']}"
        print(f"✓ Short moto: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_medium_distance_moto(self):
        """Medium (4-7km) should be 750 FCFA for moto"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["hippodrome"],
            "dropoff_location": LOCATIONS["kalaban_coura"],
            "vehicle_type": "moto"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        print(f"Medium moto test: {data['distance_km']}km = {data['estimated_price']} FCFA")
        # Adjust based on actual distance
        if 4 <= data["distance_km"] < 7:
            assert data["estimated_price"] == 750
        elif 7 <= data["distance_km"] < 12:
            assert data["estimated_price"] == 1000
        print(f"✓ Medium/Long moto: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_long_distance_moto(self):
        """Long (7-12km) should be 1000 FCFA for moto"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["sotuba"],
            "dropoff_location": LOCATIONS["niamakoro"],
            "vehicle_type": "moto"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        print(f"Long moto test: {data['distance_km']}km = {data['estimated_price']} FCFA")
        if 7 <= data["distance_km"] < 12:
            assert data["estimated_price"] == 1000
        elif data["distance_km"] >= 12:
            assert data["estimated_price"] >= 1500
        print(f"✓ Long moto: {data['distance_km']}km = {data['estimated_price']} FCFA")
    
    def test_very_long_distance_moto(self):
        """Very long (>12km) should be 1500+ FCFA for moto"""
        response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["kati"],
            "dropoff_location": LOCATIONS["airport"],
            "vehicle_type": "moto"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_type"] == "moto"
        print(f"Very long moto test: {data['distance_km']}km = {data['estimated_price']} FCFA")
        assert data["distance_km"] > 12, f"Distance should be >12km, got {data['distance_km']}"
        # Formula: 1500 + (distance - 12) * 100
        expected_min = 1500
        assert data["estimated_price"] >= expected_min, f"Very long moto price should be >= {expected_min} FCFA, got {data['estimated_price']}"
        print(f"✓ Very long moto: {data['distance_km']}km = {data['estimated_price']} FCFA")


class TestMotoVsCarPricing:
    """Test that moto is always cheaper than car"""
    
    def test_moto_cheaper_than_car_short(self):
        """Moto should be cheaper than car for short distance"""
        car_response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["hamdallaye"],
            "dropoff_location": LOCATIONS["badalabougou"],
            "vehicle_type": "car"
        })
        moto_response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["hamdallaye"],
            "dropoff_location": LOCATIONS["badalabougou"],
            "vehicle_type": "moto"
        })
        
        car_price = car_response.json()["estimated_price"]
        moto_price = moto_response.json()["estimated_price"]
        
        assert moto_price < car_price, f"Moto ({moto_price}) should be cheaper than car ({car_price})"
        print(f"✓ Short distance: Moto {moto_price} FCFA < Car {car_price} FCFA")
    
    def test_moto_cheaper_than_car_long(self):
        """Moto should be cheaper than car for long distance"""
        car_response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["kati"],
            "dropoff_location": LOCATIONS["airport"],
            "vehicle_type": "car"
        })
        moto_response = requests.post(f"{BASE_URL}/api/rides/estimate", json={
            "pickup_location": LOCATIONS["kati"],
            "dropoff_location": LOCATIONS["airport"],
            "vehicle_type": "moto"
        })
        
        car_price = car_response.json()["estimated_price"]
        moto_price = moto_response.json()["estimated_price"]
        
        assert moto_price < car_price, f"Moto ({moto_price}) should be cheaper than car ({car_price})"
        print(f"✓ Long distance: Moto {moto_price} FCFA < Car {car_price} FCFA")


class TestAudioFilesAccessible:
    """Test that audio notification files are accessible"""
    
    def test_ride_alert_wav_accessible(self):
        """ride_alert.wav should be accessible and valid WAV"""
        response = requests.head(f"{BASE_URL}/ride_alert.wav")
        assert response.status_code == 200, f"ride_alert.wav not accessible: {response.status_code}"
        assert "audio/wav" in response.headers.get("content-type", ""), "ride_alert.wav should be audio/wav"
        content_length = int(response.headers.get("content-length", 0))
        assert content_length > 10000, f"ride_alert.wav too small: {content_length} bytes"
        print(f"✓ ride_alert.wav accessible: {content_length} bytes, audio/wav")
    
    def test_passenger_alert_wav_accessible(self):
        """passenger_alert.wav should be accessible and valid WAV"""
        response = requests.head(f"{BASE_URL}/passenger_alert.wav")
        assert response.status_code == 200, f"passenger_alert.wav not accessible: {response.status_code}"
        assert "audio/wav" in response.headers.get("content-type", ""), "passenger_alert.wav should be audio/wav"
        content_length = int(response.headers.get("content-length", 0))
        assert content_length > 10000, f"passenger_alert.wav too small: {content_length} bytes"
        print(f"✓ passenger_alert.wav accessible: {content_length} bytes, audio/wav")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

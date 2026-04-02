"""
Test Password Change Feature for SIRA TAXI
Tests PUT /api/users/password endpoint for both passenger and driver roles
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

class TestPasswordChangeBackend:
    """Test password change API endpoint"""
    
    @pytest.fixture
    def session(self):
        """Create a requests session"""
        return requests.Session()
    
    @pytest.fixture
    def passenger_token(self, session):
        """Login as passenger and get token"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": PASSENGER_EMAIL,
            "password": PASSENGER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Passenger login failed: {response.status_code} - {response.text}")
    
    @pytest.fixture
    def driver_token(self, session):
        """Login as driver and get token"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DRIVER_EMAIL,
            "password": DRIVER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Driver login failed: {response.status_code} - {response.text}")
    
    # ==================== PASSENGER TESTS ====================
    
    def test_passenger_wrong_current_password_rejected(self, session, passenger_token):
        """Test that wrong current password is rejected with proper French error message"""
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": "WrongPassword123!",
                "new_password": "NewPassword123!"
            },
            headers={"Authorization": f"Bearer {passenger_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        assert "Mot de passe actuel incorrect" in data["detail"], f"Expected French error message, got: {data['detail']}"
        print(f"✓ Passenger: Wrong password rejected with message: {data['detail']}")
    
    def test_passenger_password_too_short_rejected(self, session, passenger_token):
        """Test that password shorter than 6 chars is rejected"""
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": PASSENGER_PASSWORD,
                "new_password": "12345"  # Only 5 chars
            },
            headers={"Authorization": f"Bearer {passenger_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        assert "6 caractères" in data["detail"], f"Expected French error about 6 chars, got: {data['detail']}"
        print(f"✓ Passenger: Short password rejected with message: {data['detail']}")
    
    def test_passenger_password_change_success(self, session, passenger_token):
        """Test successful password change for passenger"""
        new_password = "NewPass123!"
        
        # Change password
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": PASSENGER_PASSWORD,
                "new_password": new_password
            },
            headers={"Authorization": f"Bearer {passenger_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "success"
        assert "Mot de passe modifié" in data.get("message", "")
        print(f"✓ Passenger: Password changed successfully")
        
        # Verify login with new password works
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": PASSENGER_EMAIL,
            "password": new_password
        })
        assert login_response.status_code == 200, f"Login with new password failed: {login_response.status_code}"
        print(f"✓ Passenger: Login with new password works")
        
        # REVERT: Change password back to original
        new_token = login_response.json().get("token")
        revert_response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": new_password,
                "new_password": PASSENGER_PASSWORD
            },
            headers={"Authorization": f"Bearer {new_token}"}
        )
        assert revert_response.status_code == 200, f"Failed to revert password: {revert_response.status_code}"
        print(f"✓ Passenger: Password reverted to original")
    
    # ==================== DRIVER TESTS ====================
    
    def test_driver_wrong_current_password_rejected(self, session, driver_token):
        """Test that wrong current password is rejected for driver"""
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": "WrongPassword123!",
                "new_password": "NewPassword123!"
            },
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Mot de passe actuel incorrect" in data.get("detail", "")
        print(f"✓ Driver: Wrong password rejected with message: {data['detail']}")
    
    def test_driver_password_too_short_rejected(self, session, driver_token):
        """Test that password shorter than 6 chars is rejected for driver"""
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": DRIVER_PASSWORD,
                "new_password": "abc"  # Only 3 chars
            },
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "6 caractères" in data.get("detail", "")
        print(f"✓ Driver: Short password rejected with message: {data['detail']}")
    
    def test_driver_password_change_success(self, session, driver_token):
        """Test successful password change for driver"""
        new_password = "DriverNew123!"
        
        # Change password
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": DRIVER_PASSWORD,
                "new_password": new_password
            },
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "success"
        print(f"✓ Driver: Password changed successfully")
        
        # Verify login with new password works
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DRIVER_EMAIL,
            "password": new_password
        })
        assert login_response.status_code == 200, f"Login with new password failed: {login_response.status_code}"
        print(f"✓ Driver: Login with new password works")
        
        # REVERT: Change password back to original
        new_token = login_response.json().get("token")
        revert_response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": new_password,
                "new_password": DRIVER_PASSWORD
            },
            headers={"Authorization": f"Bearer {new_token}"}
        )
        assert revert_response.status_code == 200, f"Failed to revert password: {revert_response.status_code}"
        print(f"✓ Driver: Password reverted to original")
    
    # ==================== AUTH TESTS ====================
    
    def test_password_change_requires_auth(self, session):
        """Test that password change requires authentication"""
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": "test",
                "new_password": "newtest123"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Password change requires authentication (401)")
    
    def test_password_change_invalid_token(self, session):
        """Test that invalid token is rejected"""
        response = session.put(
            f"{BASE_URL}/api/users/password",
            json={
                "current_password": "test",
                "new_password": "newtest123"
            },
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Invalid token rejected (401)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

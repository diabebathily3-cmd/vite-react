"""
Test Admin Payment Management Endpoints
- GET /api/admin/drivers/wallets - List driver wallets
- POST /api/admin/drivers/{driver_id}/pay - Pay a driver
- GET /api/admin/payments/history - Payment history
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@sirataxi.ml"
ADMIN_PASSWORD = "Admin123!"
DRIVER_EMAIL = "testdriver@test.com"
DRIVER_PASSWORD = "Test123!"


class TestAdminPaymentEndpoints:
    """Test admin payment management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.admin_token = None
        self.driver_id = None
    
    def get_admin_token(self):
        """Login as admin and get token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.admin_token}"})
            return True
        return False
    
    def test_01_admin_login(self):
        """Test admin can login"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert data.get("user", {}).get("role") == "admin", "User is not admin"
        print(f"✓ Admin login successful")
    
    def test_02_get_driver_wallets(self):
        """Test GET /api/admin/drivers/wallets returns driver list"""
        assert self.get_admin_token(), "Admin login failed"
        
        response = self.session.get(f"{BASE_URL}/api/admin/drivers/wallets")
        assert response.status_code == 200, f"Failed to get driver wallets: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check structure of driver wallet data
        if len(data) > 0:
            driver = data[0]
            assert "user_id" in driver, "Missing user_id"
            assert "name" in driver, "Missing name"
            assert "wallet_balance" in driver, "Missing wallet_balance"
            assert "total_earnings" in driver, "Missing total_earnings"
            assert "total_withdrawn" in driver, "Missing total_withdrawn"
            print(f"✓ Got {len(data)} driver wallets")
            print(f"  Sample driver: {driver.get('name')} - Balance: {driver.get('wallet_balance')} FCFA")
        else:
            print("✓ Driver wallets endpoint works (no drivers yet)")
    
    def test_03_get_driver_wallets_unauthorized(self):
        """Test driver wallets endpoint requires admin auth"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/admin/drivers/wallets")
        assert response.status_code in [401, 403], "Should require authentication"
        print("✓ Driver wallets endpoint requires authentication")
    
    def test_04_get_payment_history(self):
        """Test GET /api/admin/payments/history"""
        assert self.get_admin_token(), "Admin login failed"
        
        response = self.session.get(f"{BASE_URL}/api/admin/payments/history")
        assert response.status_code == 200, f"Failed to get payment history: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            payment = data[0]
            assert "payment_id" in payment, "Missing payment_id"
            assert "driver_id" in payment, "Missing driver_id"
            assert "amount" in payment, "Missing amount"
            assert "created_at" in payment, "Missing created_at"
            print(f"✓ Got {len(data)} payment records")
        else:
            print("✓ Payment history endpoint works (no payments yet)")
    
    def test_05_pay_driver_invalid_amount(self):
        """Test paying driver with invalid amount fails"""
        assert self.get_admin_token(), "Admin login failed"
        
        # Get a driver first
        response = self.session.get(f"{BASE_URL}/api/admin/drivers/wallets")
        assert response.status_code == 200
        drivers = response.json()
        
        if len(drivers) == 0:
            pytest.skip("No drivers to test payment")
        
        driver = drivers[0]
        driver_id = driver["user_id"]
        
        # Try to pay with 0 amount
        response = self.session.post(f"{BASE_URL}/api/admin/drivers/{driver_id}/pay", json={
            "amount": 0
        })
        assert response.status_code == 400, "Should reject 0 amount"
        print("✓ Payment with 0 amount rejected")
        
        # Try to pay with negative amount
        response = self.session.post(f"{BASE_URL}/api/admin/drivers/{driver_id}/pay", json={
            "amount": -100
        })
        assert response.status_code == 400, "Should reject negative amount"
        print("✓ Payment with negative amount rejected")
    
    def test_06_pay_driver_exceeds_balance(self):
        """Test paying more than wallet balance fails"""
        assert self.get_admin_token(), "Admin login failed"
        
        # Get a driver
        response = self.session.get(f"{BASE_URL}/api/admin/drivers/wallets")
        assert response.status_code == 200
        drivers = response.json()
        
        if len(drivers) == 0:
            pytest.skip("No drivers to test payment")
        
        driver = drivers[0]
        driver_id = driver["user_id"]
        balance = driver["wallet_balance"]
        
        # Try to pay more than balance
        response = self.session.post(f"{BASE_URL}/api/admin/drivers/{driver_id}/pay", json={
            "amount": balance + 10000
        })
        assert response.status_code == 400, f"Should reject amount exceeding balance. Got: {response.status_code}"
        print(f"✓ Payment exceeding balance ({balance} + 10000) rejected")
    
    def test_07_pay_driver_success(self):
        """Test successful driver payment"""
        assert self.get_admin_token(), "Admin login failed"
        
        # Get drivers with positive balance
        response = self.session.get(f"{BASE_URL}/api/admin/drivers/wallets")
        assert response.status_code == 200
        drivers = response.json()
        
        # Find a driver with positive balance
        driver_with_balance = None
        for d in drivers:
            if d["wallet_balance"] > 0:
                driver_with_balance = d
                break
        
        if not driver_with_balance:
            pytest.skip("No driver with positive balance to test payment")
        
        driver_id = driver_with_balance["user_id"]
        initial_balance = driver_with_balance["wallet_balance"]
        initial_withdrawn = driver_with_balance["total_withdrawn"]
        pay_amount = min(100, initial_balance)  # Pay 100 or full balance
        
        # Make payment
        response = self.session.post(f"{BASE_URL}/api/admin/drivers/{driver_id}/pay", json={
            "amount": pay_amount
        })
        assert response.status_code == 200, f"Payment failed: {response.text}"
        
        data = response.json()
        assert data.get("status") == "success", "Payment status should be success"
        assert data.get("amount") == pay_amount, "Amount mismatch"
        print(f"✓ Payment of {pay_amount} FCFA successful")
        
        # Verify balance updated
        response = self.session.get(f"{BASE_URL}/api/admin/drivers/wallets")
        drivers = response.json()
        updated_driver = next((d for d in drivers if d["user_id"] == driver_id), None)
        
        if updated_driver:
            expected_balance = initial_balance - pay_amount
            expected_withdrawn = initial_withdrawn + pay_amount
            assert updated_driver["wallet_balance"] == expected_balance, f"Balance not updated correctly. Expected {expected_balance}, got {updated_driver['wallet_balance']}"
            assert updated_driver["total_withdrawn"] == expected_withdrawn, f"Total withdrawn not updated correctly"
            print(f"✓ Driver balance updated: {initial_balance} → {updated_driver['wallet_balance']} FCFA")
            print(f"✓ Total withdrawn updated: {initial_withdrawn} → {updated_driver['total_withdrawn']} FCFA")
        
        # Verify payment appears in history
        response = self.session.get(f"{BASE_URL}/api/admin/payments/history")
        history = response.json()
        recent_payment = next((p for p in history if p["driver_id"] == driver_id and p["amount"] == pay_amount), None)
        assert recent_payment is not None, "Payment not found in history"
        print("✓ Payment recorded in history")
    
    def test_08_pay_nonexistent_driver(self):
        """Test paying non-existent driver fails"""
        assert self.get_admin_token(), "Admin login failed"
        
        fake_driver_id = f"fake_{uuid.uuid4().hex[:8]}"
        response = self.session.post(f"{BASE_URL}/api/admin/drivers/{fake_driver_id}/pay", json={
            "amount": 100
        })
        assert response.status_code == 404, f"Should return 404 for non-existent driver. Got: {response.status_code}"
        print("✓ Payment to non-existent driver rejected with 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

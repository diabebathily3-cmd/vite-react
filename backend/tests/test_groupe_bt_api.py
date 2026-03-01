"""
Test suite for Groupe BT Alimentaire API
Tests products, orders, contacts, dashboard stats, and mobile payments
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mali-market-2.preview.emergentagent.com')

class TestHealth:
    """Test API health and root endpoint"""
    
    def test_api_root(self):
        """Test API root endpoint returns welcome message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Bienvenue" in data["message"]
        print(f"✅ API root: {data}")

class TestProducts:
    """Product CRUD and filtering tests"""
    
    def test_get_all_products(self):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Got {len(data)} products")
        
        # Verify product structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "price_euro" in product
        assert "price_cfa" in product
        assert "category" in product
    
    def test_get_products_by_category(self):
        """Test filtering products by category (riz)"""
        response = requests.get(f"{BASE_URL}/api/products?category=riz")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify all returned products are rice
        for product in data:
            assert product["category"] == "riz"
        print(f"✅ Got {len(data)} products in 'riz' category")
    
    def test_get_promotion_products(self):
        """Test getting only promotion products"""
        response = requests.get(f"{BASE_URL}/api/products?promotion_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned products should be promotions (or empty if none)
        for product in data:
            assert product.get("is_promotion") == True
        print(f"✅ Got {len(data)} promotion products")
    
    def test_get_single_product(self):
        """Test getting a single product by ID"""
        # First get all products
        all_response = requests.get(f"{BASE_URL}/api/products")
        products = all_response.json()
        assert len(products) > 0
        
        # Get single product
        product_id = products[0]["id"]
        response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
        print(f"✅ Got product: {data['name']}")
    
    def test_get_nonexistent_product(self):
        """Test getting non-existent product returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/products/{fake_id}")
        assert response.status_code == 404
        print("✅ Non-existent product returns 404")

class TestOrders:
    """Order CRUD tests"""
    
    @pytest.fixture
    def sample_order(self):
        """Create sample order data"""
        # Get a product for the order
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product = products[0]
        
        return {
            "customer_name": "TEST_Customer",
            "customer_phone": "+223 70 00 00 00",
            "customer_email": "test@example.com",
            "customer_address": "Bamako, Mali",
            "payment_method": "cash",
            "items": [
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "quantity": 2,
                    "price_euro": product["price_euro"],
                    "price_cfa": product["price_cfa"]
                }
            ]
        }
    
    def test_get_all_orders(self):
        """Test getting all orders"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Got {len(data)} orders")
    
    def test_create_order_cash(self, sample_order):
        """Test creating an order with cash payment"""
        response = requests.post(f"{BASE_URL}/api/orders", json=sample_order)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["customer_name"] == sample_order["customer_name"]
        assert data["payment_method"] == "cash"
        assert "total_euro" in data
        assert "total_cfa" in data
        print(f"✅ Created order: {data['id']}, total: {data['total_euro']}€")
        
        # Cleanup: verify created order exists
        get_response = requests.get(f"{BASE_URL}/api/orders/{data['id']}")
        assert get_response.status_code == 200
    
    def test_create_order_orange_money(self, sample_order):
        """Test creating an order with Orange Money payment"""
        sample_order["payment_method"] = "orange_money"
        response = requests.post(f"{BASE_URL}/api/orders", json=sample_order)
        assert response.status_code == 200
        data = response.json()
        assert data["payment_method"] == "orange_money"
        assert data["status"] == "awaiting_payment"  # Should be awaiting payment for mobile
        print(f"✅ Created Orange Money order: {data['id']}")
    
    def test_create_order_wave(self, sample_order):
        """Test creating an order with Wave payment"""
        sample_order["payment_method"] = "wave"
        response = requests.post(f"{BASE_URL}/api/orders", json=sample_order)
        assert response.status_code == 200
        data = response.json()
        assert data["payment_method"] == "wave"
        print(f"✅ Created Wave order: {data['id']}")

class TestMobilePayments:
    """Mobile payment (Orange Money, Wave) tests - MOCKED APIs"""
    
    @pytest.fixture
    def order_id(self):
        """Create an order and return its ID for payment tests"""
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product = products[0]
        
        order_data = {
            "customer_name": "TEST_Payment_User",
            "customer_phone": "+223 70 00 00 00",
            "customer_email": "payment@test.com",
            "customer_address": "Bamako, Mali",
            "payment_method": "orange_money",
            "items": [
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "quantity": 1,
                    "price_euro": product["price_euro"],
                    "price_cfa": product["price_cfa"]
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        return response.json()["id"]
    
    def test_init_orange_money_payment(self, order_id):
        """Test initializing Orange Money payment"""
        payment_data = {
            "order_id": order_id,
            "payment_method": "orange_money",
            "phone_number": "+223 70 00 00 00"
        }
        response = requests.post(f"{BASE_URL}/api/payments/init", json=payment_data)
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "orange_money"
        assert "ussd_code" in data
        assert "instructions" in data
        assert "amount" in data
        print(f"✅ Orange Money payment init: USSD {data['ussd_code']}, amount: {data['amount']} F CFA")
    
    def test_init_wave_payment(self, order_id):
        """Test initializing Wave payment"""
        payment_data = {
            "order_id": order_id,
            "payment_method": "wave",
            "phone_number": "+223 70 00 00 00"
        }
        response = requests.post(f"{BASE_URL}/api/payments/init", json=payment_data)
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "wave"
        assert "instructions" in data
        print(f"✅ Wave payment init: amount {data['amount']} F CFA")
    
    def test_simulate_payment(self, order_id):
        """Test payment simulation (demo mode)"""
        response = requests.post(f"{BASE_URL}/api/payments/simulate/{order_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PAID"
        assert "transaction_id" in data
        print(f"✅ Payment simulated: {data['transaction_id']}")
    
    def test_get_payment_status(self, order_id):
        """Test getting payment status"""
        response = requests.get(f"{BASE_URL}/api/payments/status/{order_id}")
        assert response.status_code == 200
        data = response.json()
        assert "payment_status" in data
        assert "order_id" in data
        print(f"✅ Payment status: {data['payment_status']}")

class TestContacts:
    """Contact form tests"""
    
    def test_create_contact(self):
        """Test creating a contact message"""
        contact_data = {
            "name": "TEST_Contact_User",
            "phone": "+223 70 00 00 00",
            "email": "contact@test.com",
            "subject": "Test Subject",
            "message": "This is a test message from automated tests"
        }
        response = requests.post(f"{BASE_URL}/api/contacts", json=contact_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == contact_data["name"]
        assert data["is_read"] == False
        print(f"✅ Created contact: {data['id']}")
    
    def test_get_all_contacts(self):
        """Test getting all contacts"""
        response = requests.get(f"{BASE_URL}/api/contacts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Got {len(data)} contacts")
    
    def test_get_unread_contacts(self):
        """Test getting only unread contacts"""
        response = requests.get(f"{BASE_URL}/api/contacts?unread_only=true")
        assert response.status_code == 200
        data = response.json()
        for contact in data:
            assert contact["is_read"] == False
        print(f"✅ Got {len(data)} unread contacts")

class TestDashboardStats:
    """Dashboard statistics tests"""
    
    def test_get_dashboard_stats(self):
        """Test getting dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields
        assert "total_products" in data
        assert "total_orders" in data
        assert "pending_orders" in data
        assert "total_revenue_euro" in data
        assert "total_revenue_cfa" in data
        assert "low_stock_count" in data
        assert "unread_contacts" in data
        
        # Verify data types
        assert isinstance(data["total_products"], int)
        assert isinstance(data["total_orders"], int)
        assert isinstance(data["total_revenue_euro"], (int, float))
        
        print(f"✅ Dashboard stats: {data['total_products']} products, {data['total_orders']} orders, {data['total_revenue_euro']}€ revenue")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

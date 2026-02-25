import requests
import sys
import json
from datetime import datetime

class ProgetAlimentationAPITester:
    def __init__(self, base_url="https://dietary-pro.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, passed, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_data": response_data
        }
        self.results.append(result)
        print(f"{status} - {test_name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, expected_keys=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            # Check status code
            status_ok = response.status_code == expected_status
            
            # Try to parse JSON response
            try:
                response_json = response.json()
            except:
                response_json = {"error": "Non-JSON response", "text": response.text[:200]}
            
            # Check for expected keys if provided
            keys_ok = True
            if expected_keys and status_ok:
                if isinstance(response_json, list):
                    # For list responses, check first item
                    if len(response_json) > 0:
                        keys_ok = all(key in response_json[0] for key in expected_keys)
                elif isinstance(response_json, dict):
                    keys_ok = all(key in response_json for key in expected_keys)
            
            success = status_ok and keys_ok
            details = f"Status: {response.status_code} (expected {expected_status})"
            if not keys_ok:
                details += f" | Missing keys: {expected_keys}"
                
            self.log_result(name, success, details, response_json)
            return success, response_json
            
        except requests.exceptions.Timeout:
            self.log_result(name, False, "Request timeout after 10 seconds")
            return False, {}
        except Exception as e:
            self.log_result(name, False, f"Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200,
            expected_keys=["message", "version"]
        )

    def test_get_products(self):
        """Test getting all products"""
        return self.run_test(
            "Get All Products",
            "GET", 
            "products",
            200,
            expected_keys=["id", "name", "category", "price_euro", "price_cfa", "stock_quantity"]
        )

    def test_get_products_by_category(self):
        """Test filtering products by category"""
        return self.run_test(
            "Get Products by Category (rice)",
            "GET",
            "products?category=riz",
            200,
            expected_keys=["id", "name", "category"]
        )

    def test_get_promotions(self):
        """Test getting promotional products"""
        return self.run_test(
            "Get Promotional Products",
            "GET",
            "products?promotion_only=true",
            200,
            expected_keys=["id", "name", "is_promotion"]
        )

    def test_create_contact(self):
        """Test creating a contact message"""
        contact_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "phone": "+22312345678",
            "email": "test@example.com",
            "subject": "Test Contact Message",
            "message": "This is a test contact message from automated testing."
        }
        
        success, response = self.run_test(
            "Create Contact Message",
            "POST",
            "contacts",
            200,
            data=contact_data,
            expected_keys=["id", "name", "phone", "subject", "message", "is_read"]
        )
        return success, response

    def test_get_contacts(self):
        """Test getting contact messages"""
        return self.run_test(
            "Get Contact Messages",
            "GET",
            "contacts",
            200,
            expected_keys=["id", "name", "phone", "subject", "message"]
        )

    def test_create_order(self):
        """Test creating an order"""
        # First get a product to create order with
        success, products_response = self.test_get_products()
        if not success or not products_response or len(products_response) == 0:
            self.log_result("Create Order", False, "No products available for order test")
            return False, {}
        
        product = products_response[0]
        order_data = {
            "customer_name": f"Test Customer {datetime.now().strftime('%H%M%S')}",
            "customer_phone": "+22387654321",
            "customer_email": "customer@example.com",
            "customer_address": "Bamako, Mali - Test Address",
            "items": [{
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": 2,
                "price_euro": product["price_euro"],
                "price_cfa": product["price_cfa"]
            }],
            "notes": "Test order from automated testing",
            "is_wholesale": False
        }
        
        return self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data,
            expected_keys=["id", "customer_name", "customer_phone", "items", "total_euro", "total_cfa", "status"]
        )

    def test_get_orders(self):
        """Test getting orders"""
        return self.run_test(
            "Get All Orders",
            "GET",
            "orders",
            200,
            expected_keys=["id", "customer_name", "items", "total_euro", "status"]
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200,
            expected_keys=["total_products", "total_orders", "pending_orders", "total_revenue_euro", "total_revenue_cfa", "low_stock_count", "unread_contacts"]
        )

    def test_seed_data(self):
        """Test seed data endpoint"""
        return self.run_test(
            "Seed Data",
            "POST",
            "seed",
            200,
            expected_keys=["message"]
        )

    def test_create_order_with_orange_money(self):
        """Test creating an order with Orange Money payment"""
        # First get a product
        success, products_response = self.test_get_products()
        if not success or not products_response or len(products_response) == 0:
            self.log_result("Create Order with Orange Money", False, "No products available")
            return False, {}
        
        product = products_response[0]
        order_data = {
            "customer_name": f"Orange Test {datetime.now().strftime('%H%M%S')}",
            "customer_phone": "+22390123456",
            "customer_email": "orange@test.com", 
            "customer_address": "Bamako, Mali - Orange Money Test",
            "payment_method": "orange_money",
            "items": [{
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": 1,
                "price_euro": product["price_euro"],
                "price_cfa": product["price_cfa"]
            }]
        }
        
        return self.run_test(
            "Create Order with Orange Money",
            "POST",
            "orders",
            200,
            data=order_data,
            expected_keys=["id", "customer_name", "payment_method", "status"]
        )

    def test_create_order_with_wave(self):
        """Test creating an order with Wave payment"""
        # First get a product
        success, products_response = self.test_get_products()
        if not success or not products_response or len(products_response) == 0:
            self.log_result("Create Order with Wave", False, "No products available")
            return False, {}
        
        product = products_response[0]
        order_data = {
            "customer_name": f"Wave Test {datetime.now().strftime('%H%M%S')}",
            "customer_phone": "+22391234567",
            "customer_email": "wave@test.com",
            "customer_address": "Bamako, Mali - Wave Test", 
            "payment_method": "wave",
            "items": [{
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": 1,
                "price_euro": product["price_euro"],
                "price_cfa": product["price_cfa"]
            }]
        }
        
        return self.run_test(
            "Create Order with Wave",
            "POST",
            "orders",
            200,
            data=order_data,
            expected_keys=["id", "customer_name", "payment_method", "status"]
        )

    def test_payment_init_orange_money(self):
        """Test initializing Orange Money payment"""
        # Create order first
        success, order_response = self.test_create_order_with_orange_money()
        if not success or not order_response:
            self.log_result("Payment Init Orange Money", False, "Failed to create test order")
            return False, {}
        
        order_id = order_response["id"]
        payment_data = {
            "order_id": order_id,
            "payment_method": "orange_money",
            "phone_number": "+22390123456"
        }
        
        return self.run_test(
            "Payment Init Orange Money",
            "POST",
            "payments/init",
            200,
            data=payment_data,
            expected_keys=["provider", "merchant_id", "order_id", "amount", "currency", "phone_number", "ussd_code", "instructions"]
        )

    def test_payment_init_wave(self):
        """Test initializing Wave payment"""
        # Create order first
        success, order_response = self.test_create_order_with_wave()
        if not success or not order_response:
            self.log_result("Payment Init Wave", False, "Failed to create test order")
            return False, {}
        
        order_id = order_response["id"]
        payment_data = {
            "order_id": order_id,
            "payment_method": "wave",
            "phone_number": "+22391234567"
        }
        
        return self.run_test(
            "Payment Init Wave",
            "POST", 
            "payments/init",
            200,
            data=payment_data,
            expected_keys=["provider", "merchant_id", "order_id", "amount", "currency", "phone_number", "instructions"]
        )

    def test_payment_simulate(self):
        """Test payment simulation"""
        # Create order with Orange Money first
        success, order_response = self.test_create_order_with_orange_money()
        if not success or not order_response:
            self.log_result("Payment Simulate", False, "Failed to create test order")
            return False, {}
        
        order_id = order_response["id"]
        
        return self.run_test(
            "Payment Simulate",
            "POST",
            f"payments/simulate/{order_id}",
            200,
            expected_keys=["message", "transaction_id", "order_id", "status"]
        )

    def test_payment_status(self):
        """Test payment status check"""
        # Create order and simulate payment first
        success, order_response = self.test_create_order_with_orange_money()
        if not success or not order_response:
            self.log_result("Payment Status", False, "Failed to create test order")
            return False, {}
        
        order_id = order_response["id"]
        
        # Simulate payment first
        simulate_success, _ = self.run_test(
            "Payment Status - Simulate First",
            "POST",
            f"payments/simulate/{order_id}",
            200
        )
        
        if simulate_success:
            return self.run_test(
                "Payment Status Check",
                "GET",
                f"payments/status/{order_id}",
                200,
                expected_keys=["order_id", "payment_method", "payment_status", "amount_cfa", "order_status"]
            )
        else:
            self.log_result("Payment Status", False, "Failed to simulate payment first")
            return False, {}

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("🧪 TESTING PROGET ALIMENTATION API")
        print(f"📡 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test each endpoint
        test_methods = [
            self.test_root_endpoint,
            self.test_seed_data,  # Ensure data exists first
            self.test_get_products,
            self.test_get_products_by_category,
            self.test_get_promotions,
            self.test_dashboard_stats,
            self.test_create_contact,
            self.test_get_contacts,
            self.test_create_order,
            self.test_get_orders,
            # Mobile Payment Tests
            self.test_create_order_with_orange_money,
            self.test_create_order_with_wave,
            self.test_payment_init_orange_money,
            self.test_payment_init_wave,
            self.test_payment_simulate,
            self.test_payment_status,
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                self.log_result(test_method.__name__, False, f"Exception: {str(e)}")
            print("-" * 40)
        
        # Print final results
        print("=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests failed: {self.tests_run - self.tests_passed}/{self.tests_run}")
        print(f"🎯 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.results if "FAILED" in r["status"]]
        if failed_tests:
            print("\n🚨 FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main function"""
    tester = ProgetAlimentationAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"/app/test_reports/backend_api_test_{timestamp}.json"
    
    try:
        with open(results_file, 'w') as f:
            json.dump({
                "timestamp": timestamp,
                "summary": {
                    "total_tests": tester.tests_run,
                    "passed_tests": tester.tests_passed,
                    "failed_tests": tester.tests_run - tester.tests_passed,
                    "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%"
                },
                "detailed_results": tester.results
            }, f, indent=2)
        print(f"\n📋 Detailed results saved to: {results_file}")
    except Exception as e:
        print(f"⚠️  Could not save results file: {e}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
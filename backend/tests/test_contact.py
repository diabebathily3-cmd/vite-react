"""
Test Contact API Endpoint
Tests for POST /api/contact - Contact form submission
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestContactAPI:
    """Contact form API tests"""
    
    def test_health_check(self):
        """Verify API is healthy before running tests"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_contact_submit_success(self):
        """Test successful contact form submission"""
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "name": f"Test User {unique_id}",
            "email": f"test_{unique_id}@example.com",
            "subject": "general",
            "message": "This is a test message from pytest"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "Message reçu" in data["message"]
        print(f"✓ Contact submission successful: {data}")
    
    def test_contact_submit_all_subjects(self):
        """Test contact form with all valid subject types"""
        subjects = ["general", "passenger", "driver", "partnership", "complaint", "other"]
        
        for subject in subjects:
            unique_id = uuid.uuid4().hex[:8]
            payload = {
                "name": f"Test {subject} {unique_id}",
                "email": f"test_{subject}_{unique_id}@example.com",
                "subject": subject,
                "message": f"Test message for subject: {subject}"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/contact",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            assert response.status_code == 200, f"Failed for subject: {subject}"
            data = response.json()
            assert data["status"] == "success"
            print(f"✓ Subject '{subject}' accepted")
    
    def test_contact_missing_name(self):
        """Test contact form with missing name field"""
        payload = {
            "email": "test@example.com",
            "subject": "general",
            "message": "Test message"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Missing name field correctly rejected")
    
    def test_contact_missing_email(self):
        """Test contact form with missing email field"""
        payload = {
            "name": "Test User",
            "subject": "general",
            "message": "Test message"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Missing email field correctly rejected")
    
    def test_contact_invalid_email(self):
        """Test contact form with invalid email format"""
        payload = {
            "name": "Test User",
            "email": "invalid-email",
            "subject": "general",
            "message": "Test message"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Invalid email format correctly rejected")
    
    def test_contact_missing_subject(self):
        """Test contact form with missing subject field"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "Test message"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Missing subject field correctly rejected")
    
    def test_contact_missing_message(self):
        """Test contact form with missing message field"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "general"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Missing message field correctly rejected")
    
    def test_contact_empty_payload(self):
        """Test contact form with empty payload"""
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Empty payload correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

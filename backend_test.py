#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Job Portal Application
Tests all endpoints with proper authentication and user types
"""

import requests
import json
import subprocess
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://workhub-24.preview.emergentagent.com/api"
DB_NAME = "test_database"

class JobPortalTester:
    def __init__(self):
        self.employer_token = None
        self.job_seeker_token = None
        self.employer_id = None
        self.job_seeker_id = None
        self.test_job_id = None
        self.test_application_id = None
        
    def create_test_users(self):
        """Create test users in MongoDB for both employer and job_seeker"""
        print("🔧 Creating test users in MongoDB...")
        
        # Create employer user
        employer_script = f"""
        use('{DB_NAME}');
        var employerId = 'emp_' + Date.now();
        var employerToken = 'emp_session_' + Date.now();
        db.users.insertOne({{
          user_id: employerId,
          email: 'employer.' + Date.now() + '@company.com',
          name: 'Ahmed Al-Rashid',
          picture: 'https://via.placeholder.com/150',
          user_type: 'employer',
          phone: '+966501234567',
          profession: 'HR Manager',
          city: 'الرياض',
          area: 'العليا',
          created_at: new Date()
        }});
        db.user_sessions.insertOne({{
          user_id: employerId,
          session_token: employerToken,
          expires_at: new Date(Date.now() + 7*24*60*60*1000),
          created_at: new Date()
        }});
        print('EMPLOYER_TOKEN:' + employerToken);
        print('EMPLOYER_ID:' + employerId);
        """
        
        # Create job seeker user
        job_seeker_script = f"""
        use('{DB_NAME}');
        var seekerId = 'seeker_' + Date.now();
        var seekerToken = 'seeker_session_' + Date.now();
        db.users.insertOne({{
          user_id: seekerId,
          email: 'jobseeker.' + Date.now() + '@gmail.com',
          name: 'Fatima Al-Zahra',
          picture: 'https://via.placeholder.com/150',
          user_type: 'job_seeker',
          phone: '+966507654321',
          profession: 'Software Developer',
          skills: ['Python', 'JavaScript', 'React'],
          experience_years: 3,
          bio: 'Experienced software developer looking for new opportunities',
          city: 'جدة',
          area: 'الحمراء',
          created_at: new Date()
        }});
        db.user_sessions.insertOne({{
          user_id: seekerId,
          session_token: seekerToken,
          expires_at: new Date(Date.now() + 7*24*60*60*1000),
          created_at: new Date()
        }});
        print('SEEKER_TOKEN:' + seekerToken);
        print('SEEKER_ID:' + seekerId);
        """
        
        try:
            # Execute employer creation
            result = subprocess.run(['mongosh', '--eval', employer_script], 
                                  capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if 'EMPLOYER_TOKEN:' in line:
                        self.employer_token = line.split(':')[1].strip()
                    elif 'EMPLOYER_ID:' in line:
                        self.employer_id = line.split(':')[1].strip()
            
            # Execute job seeker creation
            result = subprocess.run(['mongosh', '--eval', job_seeker_script], 
                                  capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if 'SEEKER_TOKEN:' in line:
                        self.job_seeker_token = line.split(':')[1].strip()
                    elif 'SEEKER_ID:' in line:
                        self.job_seeker_id = line.split(':')[1].strip()
            
            print(f"✅ Created employer: {self.employer_id}")
            print(f"✅ Created job seeker: {self.job_seeker_id}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to create test users: {e}")
            return False
    
    def make_request(self, method: str, endpoint: str, token: str = None, 
                    data: Dict = None, params: Dict = None) -> Dict[str, Any]:
        """Make HTTP request with proper headers"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                return {"success": False, "error": f"Unsupported method: {method}"}
            
            return {
                "success": response.status_code < 400,
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "error": None if response.status_code < 400 else response.text
            }
            
        except Exception as e:
            return {"success": False, "error": str(e), "status_code": 0}
    
    def test_authentication_endpoints(self):
        """Test all authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        results = {}
        
        # Test GET /api/auth/me with employer token
        print("  Testing GET /api/auth/me (employer)...")
        result = self.make_request("GET", "/auth/me", self.employer_token)
        results["auth_me_employer"] = result
        if result["success"]:
            print(f"    ✅ Employer auth successful: {result['data'].get('name')}")
        else:
            print(f"    ❌ Employer auth failed: {result.get('error')}")
        
        # Test GET /api/auth/me with job seeker token
        print("  Testing GET /api/auth/me (job_seeker)...")
        result = self.make_request("GET", "/auth/me", self.job_seeker_token)
        results["auth_me_job_seeker"] = result
        if result["success"]:
            print(f"    ✅ Job seeker auth successful: {result['data'].get('name')}")
        else:
            print(f"    ❌ Job seeker auth failed: {result.get('error')}")
        
        # Test POST /api/auth/logout
        print("  Testing POST /api/auth/logout...")
        result = self.make_request("POST", "/auth/logout", self.employer_token)
        results["auth_logout"] = result
        if result["success"]:
            print("    ✅ Logout successful")
        else:
            print(f"    ❌ Logout failed: {result.get('error')}")
        
        return results
    
    def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n👤 Testing User Endpoints...")
        results = {}
        
        # Test PUT /api/users/profile
        print("  Testing PUT /api/users/profile...")
        profile_data = {
            "phone": "+966501111111",
            "bio": "Updated bio for testing purposes",
            "city": "الدمام",
            "area": "الكورنيش"
        }
        result = self.make_request("PUT", "/users/profile", self.job_seeker_token, profile_data)
        results["update_profile"] = result
        if result["success"]:
            print("    ✅ Profile update successful")
        else:
            print(f"    ❌ Profile update failed: {result.get('error')}")
        
        # Test GET /api/users/{user_id}
        print("  Testing GET /api/users/{user_id}...")
        result = self.make_request("GET", f"/users/{self.employer_id}")
        results["get_user"] = result
        if result["success"]:
            print(f"    ✅ Get user successful: {result['data'].get('name')}")
        else:
            print(f"    ❌ Get user failed: {result.get('error')}")
        
        return results
    
    def test_job_endpoints(self):
        """Test job management endpoints"""
        print("\n💼 Testing Job Endpoints...")
        results = {}
        
        # Test POST /api/jobs (create job)
        print("  Testing POST /api/jobs...")
        job_data = {
            "title": "مطور تطبيقات موبايل",
            "description": "نبحث عن مطور تطبيقات موبايل خبير في React Native و Flutter",
            "job_type": "full_time",
            "salary_type": ["monthly"],
            "salary_min": 8000,
            "salary_max": 12000,
            "salary_negotiable": True,
            "city": "الرياض",
            "area": "العليا",
            "requirements": "خبرة 3+ سنوات في تطوير التطبيقات"
        }
        result = self.make_request("POST", "/jobs", self.employer_token, job_data)
        results["create_job"] = result
        if result["success"]:
            self.test_job_id = result["data"].get("job_id")
            print(f"    ✅ Job created successfully: {self.test_job_id}")
        else:
            print(f"    ❌ Job creation failed: {result.get('error')}")
        
        # Test GET /api/jobs (list all jobs)
        print("  Testing GET /api/jobs...")
        result = self.make_request("GET", "/jobs")
        results["list_jobs"] = result
        if result["success"]:
            print(f"    ✅ Jobs listed successfully: {len(result['data'])} jobs found")
        else:
            print(f"    ❌ Jobs listing failed: {result.get('error')}")
        
        # Test GET /api/jobs with filters
        print("  Testing GET /api/jobs with filters...")
        params = {"job_type": "full_time", "city": "الرياض", "search": "مطور"}
        result = self.make_request("GET", "/jobs", params=params)
        results["list_jobs_filtered"] = result
        if result["success"]:
            print(f"    ✅ Filtered jobs successful: {len(result['data'])} jobs found")
        else:
            print(f"    ❌ Filtered jobs failed: {result.get('error')}")
        
        # Test GET /api/jobs/{job_id}
        if self.test_job_id:
            print("  Testing GET /api/jobs/{job_id}...")
            result = self.make_request("GET", f"/jobs/{self.test_job_id}")
            results["get_job"] = result
            if result["success"]:
                print(f"    ✅ Get job successful: {result['data'].get('title')}")
            else:
                print(f"    ❌ Get job failed: {result.get('error')}")
        
        # Test GET /api/jobs/my/posted
        print("  Testing GET /api/jobs/my/posted...")
        result = self.make_request("GET", "/jobs/my/posted", self.employer_token)
        results["my_posted_jobs"] = result
        if result["success"]:
            print(f"    ✅ My posted jobs successful: {len(result['data'])} jobs")
        else:
            print(f"    ❌ My posted jobs failed: {result.get('error')}")
        
        # Test PUT /api/jobs/{job_id}/status
        if self.test_job_id:
            print("  Testing PUT /api/jobs/{job_id}/status...")
            result = self.make_request("PUT", f"/jobs/{self.test_job_id}/status", 
                                     self.employer_token, {"status": "active"})
            results["update_job_status"] = result
            if result["success"]:
                print("    ✅ Job status update successful")
            else:
                print(f"    ❌ Job status update failed: {result.get('error')}")
        
        return results
    
    def test_application_endpoints(self):
        """Test job application endpoints"""
        print("\n📝 Testing Application Endpoints...")
        results = {}
        
        if not self.test_job_id:
            print("    ⚠️ No test job available, skipping application tests")
            return results
        
        # Test POST /api/applications
        print("  Testing POST /api/applications...")
        app_data = {
            "job_id": self.test_job_id,
            "cover_letter": "أنا مهتم جداً بهذه الوظيفة ولدي الخبرة المطلوبة في تطوير التطبيقات"
        }
        result = self.make_request("POST", "/applications", self.job_seeker_token, app_data)
        results["create_application"] = result
        if result["success"]:
            self.test_application_id = result["data"].get("application_id")
            print(f"    ✅ Application created: {self.test_application_id}")
        else:
            print(f"    ❌ Application creation failed: {result.get('error')}")
        
        # Test GET /api/applications/my/submitted
        print("  Testing GET /api/applications/my/submitted...")
        result = self.make_request("GET", "/applications/my/submitted", self.job_seeker_token)
        results["my_applications"] = result
        if result["success"]:
            print(f"    ✅ My applications successful: {len(result['data'])} applications")
        else:
            print(f"    ❌ My applications failed: {result.get('error')}")
        
        # Test GET /api/applications/job/{job_id}
        print("  Testing GET /api/applications/job/{job_id}...")
        result = self.make_request("GET", f"/applications/job/{self.test_job_id}", self.employer_token)
        results["job_applications"] = result
        if result["success"]:
            print(f"    ✅ Job applications successful: {len(result['data'])} applications")
        else:
            print(f"    ❌ Job applications failed: {result.get('error')}")
        
        # Test PUT /api/applications/{application_id}/status
        if self.test_application_id:
            print("  Testing PUT /api/applications/{application_id}/status...")
            result = self.make_request("PUT", f"/applications/{self.test_application_id}/status", 
                                     self.employer_token, {"status": "accepted"})
            results["update_application_status"] = result
            if result["success"]:
                print("    ✅ Application status update successful")
            else:
                print(f"    ❌ Application status update failed: {result.get('error')}")
        
        return results
    
    def test_message_endpoints(self):
        """Test messaging system endpoints"""
        print("\n💬 Testing Message Endpoints...")
        results = {}
        
        # Test POST /api/messages
        print("  Testing POST /api/messages...")
        msg_data = {
            "receiver_id": self.employer_id,
            "content": "مرحباً، أود الاستفسار عن الوظيفة المعلن عنها"
        }
        result = self.make_request("POST", "/messages", self.job_seeker_token, msg_data)
        results["send_message"] = result
        if result["success"]:
            print("    ✅ Message sent successfully")
        else:
            print(f"    ❌ Message sending failed: {result.get('error')}")
        
        # Test GET /api/messages/conversation/{user_id}
        print("  Testing GET /api/messages/conversation/{user_id}...")
        result = self.make_request("GET", f"/messages/conversation/{self.job_seeker_id}", self.employer_token)
        results["get_conversation"] = result
        if result["success"]:
            print(f"    ✅ Conversation retrieved: {len(result['data'])} messages")
        else:
            print(f"    ❌ Conversation retrieval failed: {result.get('error')}")
        
        # Test GET /api/messages/conversations
        print("  Testing GET /api/messages/conversations...")
        result = self.make_request("GET", "/messages/conversations", self.employer_token)
        results["get_conversations"] = result
        if result["success"]:
            print(f"    ✅ Conversations listed: {len(result['data'])} conversations")
        else:
            print(f"    ❌ Conversations listing failed: {result.get('error')}")
        
        return results
    
    def test_review_endpoints(self):
        """Test review system endpoints"""
        print("\n⭐ Testing Review Endpoints...")
        results = {}
        
        # Test POST /api/reviews
        print("  Testing POST /api/reviews...")
        review_data = {
            "reviewed_id": self.employer_id,
            "rating": 5,
            "comment": "صاحب عمل ممتاز، تعامل محترف وسريع في الرد"
        }
        result = self.make_request("POST", "/reviews", self.job_seeker_token, review_data)
        results["create_review"] = result
        if result["success"]:
            print("    ✅ Review created successfully")
        else:
            print(f"    ❌ Review creation failed: {result.get('error')}")
        
        # Test GET /api/reviews/user/{user_id}
        print("  Testing GET /api/reviews/user/{user_id}...")
        result = self.make_request("GET", f"/reviews/user/{self.employer_id}")
        results["get_user_reviews"] = result
        if result["success"]:
            print(f"    ✅ User reviews retrieved: {len(result['data'])} reviews")
        else:
            print(f"    ❌ User reviews retrieval failed: {result.get('error')}")
        
        # Test GET /api/reviews/stats/{user_id}
        print("  Testing GET /api/reviews/stats/{user_id}...")
        result = self.make_request("GET", f"/reviews/stats/{self.employer_id}")
        results["get_review_stats"] = result
        if result["success"]:
            stats = result['data']
            print(f"    ✅ Review stats: {stats.get('average_rating')}/5 ({stats.get('total_reviews')} reviews)")
        else:
            print(f"    ❌ Review stats retrieval failed: {result.get('error')}")
        
        return results
    
    def test_permissions(self):
        """Test permission restrictions between user types"""
        print("\n🔒 Testing Permission Restrictions...")
        results = {}
        
        # Job seeker trying to post job (should fail)
        print("  Testing job_seeker posting job (should fail)...")
        job_data = {
            "title": "Test Job",
            "description": "Test",
            "job_type": "full_time",
            "salary_type": ["monthly"],
            "city": "Test",
            "area": "Test"
        }
        result = self.make_request("POST", "/jobs", self.job_seeker_token, job_data)
        results["job_seeker_post_job"] = result
        if not result["success"] and result["status_code"] == 403:
            print("    ✅ Permission correctly denied")
        else:
            print(f"    ❌ Permission check failed: {result.get('error')}")
        
        # Employer trying to apply for job (should fail)
        if self.test_job_id:
            print("  Testing employer applying for job (should fail)...")
            app_data = {"job_id": self.test_job_id, "cover_letter": "Test"}
            result = self.make_request("POST", "/applications", self.employer_token, app_data)
            results["employer_apply_job"] = result
            if not result["success"] and result["status_code"] == 403:
                print("    ✅ Permission correctly denied")
            else:
                print(f"    ❌ Permission check failed: {result.get('error')}")
        
        return results
    
    def cleanup_test_data(self):
        """Clean up test data from database"""
        print("\n🧹 Cleaning up test data...")
        
        cleanup_script = f"""
        use('{DB_NAME}');
        db.users.deleteMany({{email: /test\.user\.|employer\.|jobseeker\./}});
        db.user_sessions.deleteMany({{session_token: /test_session|emp_session|seeker_session/}});
        db.jobs.deleteMany({{employer_id: /emp_|seeker_/}});
        db.applications.deleteMany({{job_seeker_id: /emp_|seeker_/}});
        db.messages.deleteMany({{sender_id: /emp_|seeker_/}});
        db.reviews.deleteMany({{reviewer_id: /emp_|seeker_/}});
        print('Cleanup completed');
        """
        
        try:
            subprocess.run(['mongosh', '--eval', cleanup_script], 
                          capture_output=True, text=True, timeout=30)
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Comprehensive Backend API Testing...")
        print(f"Backend URL: {BACKEND_URL}")
        
        # Setup
        if not self.create_test_users():
            print("❌ Failed to create test users. Aborting tests.")
            return
        
        all_results = {}
        
        # Run all test suites
        all_results["authentication"] = self.test_authentication_endpoints()
        all_results["users"] = self.test_user_endpoints()
        all_results["jobs"] = self.test_job_endpoints()
        all_results["applications"] = self.test_application_endpoints()
        all_results["messages"] = self.test_message_endpoints()
        all_results["reviews"] = self.test_review_endpoints()
        all_results["permissions"] = self.test_permissions()
        
        # Generate summary
        self.generate_test_summary(all_results)
        
        # Cleanup
        self.cleanup_test_data()
        
        return all_results
    
    def generate_test_summary(self, results):
        """Generate comprehensive test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = []
        
        for category, tests in results.items():
            print(f"\n{category.upper()}:")
            for test_name, result in tests.items():
                total_tests += 1
                if result.get("success"):
                    passed_tests += 1
                    print(f"  ✅ {test_name}")
                else:
                    failed_tests.append(f"{category}.{test_name}: {result.get('error', 'Unknown error')}")
                    print(f"  ❌ {test_name}: {result.get('error', 'Unknown error')}")
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {len(failed_tests)}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failure in failed_tests:
                print(f"  - {failure}")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": len(failed_tests),
            "success_rate": passed_tests/total_tests*100,
            "failures": failed_tests
        }

if __name__ == "__main__":
    tester = JobPortalTester()
    results = tester.run_all_tests()
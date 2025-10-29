#!/usr/bin/env python3
"""
Backend API Testing for FIn-Box Sarvam AI Integration
Tests all Sarvam AI integrated endpoints for proper functionality
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Base URL for the Next.js application
BASE_URL = "http://localhost:9002"

class FinBoxAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   Message: {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()

    def test_fin_bite_generation(self):
        """Test GET /api/fin-bite endpoint"""
        try:
            print("Testing Fin Bite Generation...")
            response = requests.get(f"{self.base_url}/api/fin-bite", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                # Check if response has expected structure
                if "updates" in data and isinstance(data["updates"], list):
                    if len(data["updates"]) == 3:
                        categories = [update.get("category") for update in data["updates"]]
                        expected_categories = ["MSME Schemes", "Finance & Tax", "Market News"]
                        
                        if all(cat in categories for cat in expected_categories):
                            self.log_result("Fin Bite Generation", True, 
                                          f"Successfully generated 3 financial news updates with correct categories")
                        else:
                            self.log_result("Fin Bite Generation", False, 
                                          f"Missing expected categories. Got: {categories}", data)
                    else:
                        self.log_result("Fin Bite Generation", False, 
                                      f"Expected 3 updates, got {len(data['updates'])}", data)
                else:
                    self.log_result("Fin Bite Generation", False, 
                                  "Response missing 'updates' array", data)
            else:
                error_msg = response.text if response.text else f"HTTP {response.status_code}"
                self.log_result("Fin Bite Generation", False, 
                              f"API request failed: {error_msg}")
                
        except requests.exceptions.Timeout:
            self.log_result("Fin Bite Generation", False, "Request timed out after 30 seconds")
        except Exception as e:
            self.log_result("Fin Bite Generation", False, f"Exception occurred: {str(e)}")

    def test_dashboard_summary(self):
        """Test POST /api/dashboard-summary endpoint"""
        try:
            print("Testing Dashboard Summary Generation...")
            
            # Sample transaction data
            test_data = {
                "transactions": [
                    {"description": "Freelance Income", "amount": "75000", "type": "income", "date": "01/01/2024"},
                    {"description": "Business Revenue", "amount": "125000", "type": "income", "date": "15/01/2024"},
                    {"description": "Office Rent", "amount": "25000", "type": "expense", "date": "01/01/2024"},
                    {"description": "Marketing Expenses", "amount": "15000", "type": "expense", "date": "05/01/2024"},
                    {"description": "Utilities", "amount": "8000", "type": "expense", "date": "10/01/2024"},
                    {"description": "Equipment Purchase", "amount": "35000", "type": "expense", "date": "20/01/2024"}
                ]
            }
            
            response = requests.post(f"{self.base_url}/api/dashboard-summary", 
                                   json=test_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["totalIncome", "totalExpenses", "savingsRate", "suggestion"]
                
                if all(field in data for field in required_fields):
                    # Validate data types and values
                    if (isinstance(data["totalIncome"], (int, float)) and 
                        isinstance(data["totalExpenses"], (int, float)) and
                        isinstance(data["savingsRate"], (int, float)) and
                        isinstance(data["suggestion"], str)):
                        
                        # Check if calculations are reasonable
                        expected_income = 200000  # 75000 + 125000
                        expected_expenses = 83000  # 25000 + 15000 + 8000 + 35000
                        
                        if (abs(data["totalIncome"] - expected_income) < 1000 and 
                            abs(data["totalExpenses"] - expected_expenses) < 1000):
                            self.log_result("Dashboard Summary Generation", True, 
                                          f"Successfully generated dashboard summary with AI suggestion")
                        else:
                            self.log_result("Dashboard Summary Generation", False, 
                                          f"Calculation mismatch. Expected income: {expected_income}, expenses: {expected_expenses}", data)
                    else:
                        self.log_result("Dashboard Summary Generation", False, 
                                      "Invalid data types in response", data)
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_result("Dashboard Summary Generation", False, 
                                  f"Missing required fields: {missing_fields}", data)
            else:
                error_msg = response.text if response.text else f"HTTP {response.status_code}"
                self.log_result("Dashboard Summary Generation", False, 
                              f"API request failed: {error_msg}")
                
        except requests.exceptions.Timeout:
            self.log_result("Dashboard Summary Generation", False, "Request timed out after 30 seconds")
        except Exception as e:
            self.log_result("Dashboard Summary Generation", False, f"Exception occurred: {str(e)}")

    def test_budget_report(self):
        """Test POST /api/budget-report endpoint"""
        try:
            print("Testing Budget Report Generation...")
            
            # Sample transaction data with diverse categories
            test_data = {
                "transactions": [
                    {"description": "Restaurant Dinner", "amount": "2500", "type": "expense", "date": "01/01/2024"},
                    {"description": "Grocery Shopping", "amount": "4500", "type": "expense", "date": "02/01/2024"},
                    {"description": "Uber Ride", "amount": "350", "type": "expense", "date": "03/01/2024"},
                    {"description": "Metro Card Recharge", "amount": "500", "type": "expense", "date": "04/01/2024"},
                    {"description": "Online Shopping", "amount": "8000", "type": "expense", "date": "05/01/2024"},
                    {"description": "Coffee Shop", "amount": "450", "type": "expense", "date": "06/01/2024"},
                    {"description": "Petrol", "amount": "3000", "type": "expense", "date": "07/01/2024"}
                ]
            }
            
            response = requests.post(f"{self.base_url}/api/budget-report", 
                                   json=test_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["summary", "expenseBreakdown"]
                
                if all(field in data for field in required_fields):
                    # Validate structure
                    if (isinstance(data["summary"], str) and 
                        isinstance(data["expenseBreakdown"], list)):
                        
                        # Check if expense breakdown has proper structure
                        if len(data["expenseBreakdown"]) > 0:
                            breakdown_valid = all(
                                isinstance(item, dict) and 
                                "name" in item and "value" in item
                                for item in data["expenseBreakdown"]
                            )
                            
                            if breakdown_valid:
                                self.log_result("Budget Report Generation", True, 
                                              f"Successfully generated budget report with {len(data['expenseBreakdown'])} expense categories")
                            else:
                                self.log_result("Budget Report Generation", False, 
                                              "Invalid expense breakdown structure", data)
                        else:
                            self.log_result("Budget Report Generation", False, 
                                          "Empty expense breakdown", data)
                    else:
                        self.log_result("Budget Report Generation", False, 
                                      "Invalid data types in response", data)
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_result("Budget Report Generation", False, 
                                  f"Missing required fields: {missing_fields}", data)
            else:
                error_msg = response.text if response.text else f"HTTP {response.status_code}"
                self.log_result("Budget Report Generation", False, 
                              f"API request failed: {error_msg}")
                
        except requests.exceptions.Timeout:
            self.log_result("Budget Report Generation", False, "Request timed out after 30 seconds")
        except Exception as e:
            self.log_result("Budget Report Generation", False, f"Exception occurred: {str(e)}")

    def test_investment_idea_analysis(self):
        """Test POST /api/generate-idea-analysis endpoint"""
        try:
            print("Testing Investment Idea Analysis...")
            
            test_data = {
                "idea": "Online grocery delivery service for tier-2 cities in India"
            }
            
            response = requests.post(f"{self.base_url}/api/generate-idea-analysis", 
                                   json=test_data, timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["title", "summary", "investmentStrategy", "targetAudience", "roi", "futureProofing", "relevantSchemes"]
                
                if all(field in data for field in required_fields):
                    # Validate all fields are strings and not empty
                    if all(isinstance(data[field], str) and len(data[field].strip()) > 0 for field in required_fields):
                        self.log_result("Investment Idea Analysis", True, 
                                      "Successfully generated comprehensive investment idea analysis")
                    else:
                        empty_fields = [f for f in required_fields if not isinstance(data[f], str) or len(data[f].strip()) == 0]
                        self.log_result("Investment Idea Analysis", False, 
                                      f"Empty or invalid fields: {empty_fields}", data)
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_result("Investment Idea Analysis", False, 
                                  f"Missing required fields: {missing_fields}", data)
            else:
                error_msg = response.text if response.text else f"HTTP {response.status_code}"
                self.log_result("Investment Idea Analysis", False, 
                              f"API request failed: {error_msg}")
                
        except requests.exceptions.Timeout:
            self.log_result("Investment Idea Analysis", False, "Request timed out after 45 seconds")
        except Exception as e:
            self.log_result("Investment Idea Analysis", False, f"Exception occurred: {str(e)}")

    def test_dpr_elaboration(self):
        """Test POST /api/generate-dpr-elaboration endpoint"""
        try:
            print("Testing Business Idea Elaboration (DPR Stage 1)...")
            
            test_data = {
                "idea": "Eco-friendly packaging manufacturing for e-commerce companies",
                "promoterName": "Rajesh Kumar"
            }
            
            response = requests.post(f"{self.base_url}/api/generate-dpr-elaboration", 
                                   json=test_data, timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["promoterName", "businessName", "businessType", "location", 
                                 "detailedProjectDescription", "targetAudienceAnalysis", 
                                 "competitiveLandscape", "marketingStrategy", "financialSummary", "usp"]
                
                if all(field in data for field in required_fields):
                    # Validate all fields are strings and not empty
                    if all(isinstance(data[field], str) and len(data[field].strip()) > 0 for field in required_fields):
                        # Check if promoter name matches input
                        if data["promoterName"] == test_data["promoterName"]:
                            self.log_result("Business Idea Elaboration (DPR Stage 1)", True, 
                                          "Successfully generated elaborated business profile")
                        else:
                            self.log_result("Business Idea Elaboration (DPR Stage 1)", False, 
                                          f"Promoter name mismatch. Expected: {test_data['promoterName']}, Got: {data['promoterName']}", data)
                    else:
                        empty_fields = [f for f in required_fields if not isinstance(data[f], str) or len(data[f].strip()) == 0]
                        self.log_result("Business Idea Elaboration (DPR Stage 1)", False, 
                                      f"Empty or invalid fields: {empty_fields}", data)
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_result("Business Idea Elaboration (DPR Stage 1)", False, 
                                  f"Missing required fields: {missing_fields}", data)
            else:
                error_msg = response.text if response.text else f"HTTP {response.status_code}"
                self.log_result("Business Idea Elaboration (DPR Stage 1)", False, 
                              f"API request failed: {error_msg}")
                
        except requests.exceptions.Timeout:
            self.log_result("Business Idea Elaboration (DPR Stage 1)", False, "Request timed out after 45 seconds")
        except Exception as e:
            self.log_result("Business Idea Elaboration (DPR Stage 1)", False, f"Exception occurred: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("FIn-Box Sarvam AI Integration Testing")
        print("=" * 60)
        print()
        
        # Test all endpoints
        self.test_fin_bite_generation()
        self.test_dashboard_summary()
        self.test_budget_report()
        self.test_investment_idea_analysis()
        self.test_dpr_elaboration()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print()
        
        if total - passed > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['message']}")
            print()
        
        return passed == total

if __name__ == "__main__":
    tester = FinBoxAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)
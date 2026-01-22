import requests
import json
import time

# Configuration
API_URL = "http://localhost:8002/api/process"

class TestAgent:
    def __init__(self, name, role, expected_intent):
        self.name = name
        self.role = role
        self.expected_intent = expected_intent

    def send_query(self, query):
        print(f"\n--- [Agent: {self.name} ({self.role})] Sending Query: '{query}' ---")
        try:
            start_time = time.time()
            response = requests.post(API_URL, json={"query": query})
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                intent = data.get("intent")
                reply = data.get("response")
                
                print(f"✅ Status: 200 OK ({duration:.2f}s)")
                print(f"   Classified Intent: {intent}")
                print(f"   Response: {reply}")
                
                # Verification
                if intent == self.expected_intent:
                    print(f"   🎉 SUCCESS: Intent matched expected '{self.expected_intent}'")
                else:
                    print(f"   ❌ FAILURE: Expected '{self.expected_intent}', got '{intent}'")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    print("Initializing Test Agents...")
    
    # Agent 1: Grid Operator
    operator = TestAgent("Alice", "Grid Operator", "LOAD_FORECASTING")
    
    # Agent 2: Security Analyst
    security = TestAgent("Bob", "Security Analyst", "THEFT_DETECTION")
    
    # Agent 3: Casual User (Control)
    casual = TestAgent("Charlie", "Casual User", "OTHER")

    # Run Scenarios
    print("\n=== RUNNING SCENARIOS ===")
    
    operator.send_query("What is the forecasted load for the central grid tomorrow?")
    time.sleep(1)
    
    security.send_query("Are there any high risk theft alerts in District 9?")
    time.sleep(1)
    
    casual.send_query("Hello, can you help me?")
    
    print("\n=== TEST COMPLETE ===")

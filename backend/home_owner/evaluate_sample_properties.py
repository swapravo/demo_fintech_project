import sys
import os
import json

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from home_owner.property_evaluation import evaluate_property

def run_evaluations():
    # List of 9 properties in India
    properties = [
        # 3 Popular Cities (Tier 1 Location)
        {"location": "Mumbai, Maharashtra", "rent": 65000, "deposit": 6},
        {"location": "Bangalore, Karnataka", "rent": 55000, "deposit": 5},
        {"location": "Delhi, NCR", "rent": 52000, "deposit": 2},

        # 3 Mid Cities (Tier 2 Location)
        {"location": "Meerut, Uttar Pradesh", "rent": 25000, "deposit": 2},
        {"location": "Indore, Madhya Pradesh", "rent": 35000, "deposit": 2},
        {"location": "Kochi, Kerala", "rent": 22000, "deposit": 3},

        # 3 Villages (Tier 3 Location)
        {"location": "Mawlynnong, Meghalaya", "rent": 8000, "deposit": 1},
        {"location": "Malana, Himachal Pradesh", "rent": 12000, "deposit": 1},
        {"location": "Punsari, Gujarat", "rent": 5000, "deposit": 1},
    ]

    print("Starting Property Evaluations...\n")
    print("-" * 50)

    for prop in properties:
        print(f"Evaluating Property in: {prop['location']}")
        print(f"Rent: ₹{prop['rent']} | Deposit: {prop['deposit']} months")
        
        try:
            result = evaluate_property(
                location=prop["location"], 
                rent=prop["rent"], 
                deposit=prop["deposit"]
            )
            print(f"Result: {json.dumps(result, indent=2)}")
        except SystemExit:
            # Catching SystemExit in case ensure_env fails
            print("  Result: Failed (Missing Environment Variable)")
            break
        except Exception as e:
            print(f"  Result: Failed to evaluate: {e}")
            
        print("-" * 50)

if __name__ == "__main__":
    run_evaluations()

import sys
import json
import os

# Add backend directory to sys.path so we can import modules
sys.path.append(os.path.abspath('backend'))

from home_owner.property_state_evaluation import evaluate_property_condition

def read_file(path):
    with open(path, 'rb') as f:
        return f.read()

def main():
    before_path = 'tests/before.jpg'
    after_path = 'tests/after.png'
    
    print(f"Reading {before_path}...")
    before_bytes = read_file(before_path)
    
    print(f"Reading {after_path}...")
    after_bytes = read_file(after_path)
    
    print("\n" + "="*50)
    print("TEST 1: Baseline Assessment on 'before.jpg' only")
    print("="*50)
    try:
        res1 = evaluate_property_condition(before_image_bytes=before_bytes)
        print(json.dumps(res1, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    print("\n" + "="*50)
    print("TEST 2: Baseline Assessment on 'after.png' only")
    print("="*50)
    try:
        # We pass after_bytes as the "before_image" to get its baseline condition score
        res2 = evaluate_property_condition(before_image_bytes=after_bytes)
        print(json.dumps(res2, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    print("\n" + "="*50)
    print("TEST 3: Comparative Damage Assessment (before.jpg AND after.png)")
    print("="*50)
    try:
        res3 = evaluate_property_condition(before_image_bytes=before_bytes, after_image_bytes=after_bytes)
        print(json.dumps(res3, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

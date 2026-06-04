import os
import sys
import time

# Ensure project root is in path
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from tasks import (
    evaluate_bank_statement_task,
    evaluate_offer_letter_task,
    evaluate_college_task
)

def run_test():
    data_dir = os.path.join(project_root, "data")
    
    # 8 tasks definition
    tasks_to_trigger = [
        # 1. Bank statement task
        {
            "name": "Bank Statement (Priya Sharma)",
            "func": evaluate_bank_statement_task,
            "args": (os.path.join(data_dir, "bank_statement_priya_sharma.pdf"),)
        },
        # 2. Offer Letter task 1
        {
            "name": "Offer Letter (Standard)",
            "func": evaluate_offer_letter_task,
            "args": (os.path.join(data_dir, "offer_letter.pdf"),)
        },
        # 3. Offer Letter task 2
        {
            "name": "Offer Letter (Priya Sharma 3LPA)",
            "func": evaluate_offer_letter_task,
            "args": (os.path.join(data_dir, "offer_letter_priya_sharma_3lpa.pdf"),)
        },
        # 4. Offer Letter task 3
        {
            "name": "Offer Letter (Rahul Verma 7LPA)",
            "func": evaluate_offer_letter_task,
            "args": (os.path.join(data_dir, "offer_letter_rahul_verma_7lpa.pdf"),)
        },
        # 5. Offer Letter task 4
        {
            "name": "Offer Letter (Thomas Cook)",
            "func": evaluate_offer_letter_task,
            "args": (os.path.join(data_dir, "offer_letter_thomas_cook_.pdf"),)
        },
        # 6. College task 1
        {
            "name": "College (Stanford University)",
            "func": evaluate_college_task,
            "args": ("Stanford University",)
        },
        # 7. College task 2
        {
            "name": "College (MIT)",
            "func": evaluate_college_task,
            "args": ("Massachusetts Institute of Technology",)
        },
        # 8. College task 3
        {
            "name": "College (IIT Bombay)",
            "func": evaluate_college_task,
            "args": ("Indian Institute of Technology Bombay",)
        }
    ]

    print("======================================================================")
    print("Triggering 8 Celery tasks simultaneously to test 8-worker concurrency...")
    print("======================================================================")

    # Queue all 8 tasks
    queued_tasks = []
    start_time = time.time()
    for item in tasks_to_trigger:
        print(f"Queuing: {item['name']}...")
        async_result = item["func"].delay(*item["args"])
        queued_tasks.append({
            "name": item["name"],
            "result": async_result
        })

    print("\nAll 8 tasks queued. Monitoring progress...\n")

    # Monitor status
    while True:
        completed = 0
        statuses = []
        for qt in queued_tasks:
            status = qt["result"].status
            statuses.append(f"{qt['name']}: {status}")
            if status in ["SUCCESS", "FAILURE"]:
                completed += 1
        
        # Print status summary
        print(f"[{time.time() - start_time:.1f}s] Completed: {completed}/8")
        print("  | " + " | ".join(statuses))
        
        if completed == 8:
            break
        
        time.sleep(2)

    total_time = time.time() - start_time
    print("\n======================================================================")
    print(f"All tasks completed in {total_time:.2f} seconds.")
    print("======================================================================")
    
    # Print results
    for qt in queued_tasks:
        res = qt["result"].result
        print(f"\nResults for {qt['name']}:")
        if isinstance(res, dict) and res.get("status") == "success":
            print(f"  Status: SUCCESS")
            print(f"  Data: {res.get('data')}")
        else:
            print(f"  Status: FAILED or unexpected format")
            print(f"  Response: {res}")

if __name__ == "__main__":
    run_test()

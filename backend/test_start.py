import traceback
import sys

try:
    import main
    print("SUCCESS")
except Exception as e:
    with open('start_error.txt', 'w', encoding='utf-8') as f:
        traceback.print_exc(file=f)
    print("FAILED")

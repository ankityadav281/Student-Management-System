import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from accounts.mongo import get_users_collection, _load_fallback_data, _save_fallback_data

users = get_users_collection()
if users is not None:
    users.update_one({'email': 'admin@campus.edu'}, {'$set': {'role': 'Academic Coordinator'}})
    users.update_one({'email': 'ankityadav2310@lpu.in'}, {'$set': {'role': 'Academic Coordinator'}})
    users.update_many({'role': {'$nin': ['Academic Coordinator', 'Teacher']}}, {'$set': {'role': 'Teacher'}})
    print("Updated Mongo users:")
    for u in users.find():
        print(f" - {u.get('full_name')} ({u.get('email')}): {u.get('role')}")

fb = _load_fallback_data()
for u in fb.get('users', []):
    if u.get('role') not in ['Academic Coordinator', 'Teacher']:
        if u.get('email') in ['admin@campus.edu', 'ankityadav2310@lpu.in']:
            u['role'] = 'Academic Coordinator'
        else:
            u['role'] = 'Teacher'
_save_fallback_data(fb)
print("Fallback data synchronized successfully.")

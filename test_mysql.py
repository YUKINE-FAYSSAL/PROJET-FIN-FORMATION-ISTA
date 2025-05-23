import pymysql

try:
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="FFaa2002@@",
        database="library_db"
    )
    print("✅ Connected!")
except Exception as e:
    print("❌ Error:", e)

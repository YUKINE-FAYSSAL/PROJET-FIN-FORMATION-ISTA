from urllib.parse import quote_plus

MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'FFaa2002@@'  # Password contains special characters
MYSQL_DB = 'db_library'

# URL-encode the password
encoded_password = quote_plus(MYSQL_PASSWORD)

SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}/{MYSQL_DB}"
SQLALCHEMY_TRACK_MODIFICATIONS = False
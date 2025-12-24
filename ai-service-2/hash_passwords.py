from passlib.context import CryptContext

pwd = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

admin_hash = pwd.hash("admin123")
emp_hash = pwd.hash("emp123")

print("ADMIN HASH:", admin_hash)
print("EMP HASH:", emp_hash)


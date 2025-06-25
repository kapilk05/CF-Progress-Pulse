# backend/update_schema.py
from model import db  # Adjust this import if your db is elsewhere
from api import app   # Import Flask app object to use app context

def add_columns():
    with app.app_context():  # You need app context for DB operations
        with db.engine.connect() as conn:
            conn.execute("ALTER TABLE user ADD COLUMN avatar_url VARCHAR(300);")
            conn.execute("ALTER TABLE user ADD COLUMN branch VARCHAR(100);")
            conn.commit()
        print("Columns added successfully.")

if __name__ == "__main__":
    add_columns()

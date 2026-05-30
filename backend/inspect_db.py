from sqlalchemy import create_engine, inspect
import os

db_url = os.environ["DATABASE_URL"]
engine = create_engine(db_url)
inspector = inspect(engine)
print("tables:", inspector.get_table_names())
if "users" in inspector.get_table_names():
    cols = inspector.get_columns("users")
    print("users cols:", [(c["name"], type(c["type"]).__name__) for c in cols])
if "inventories" in inspector.get_table_names():
    cols = inspector.get_columns("inventories")
    print("inventories cols:", [(c["name"], type(c["type"]).__name__) for c in cols])

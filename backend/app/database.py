import logging
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL")

SQLITE_URL = "sqlite:///./sql_app.db"


def _is_table_empty(engine, table_name: str) -> bool:
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT 1 FROM {table_name} LIMIT 1"))
        return result.first() is None


def _add_hashed_password_column(engine) -> None:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))


def _postgres_compatible(engine) -> bool:
    try:
        inspector = inspect(engine)
        if not inspector.has_table("users"):
            logger.info("PostgreSQL database does not have users table; it will be created.")
            return True

        columns = {col["name"]: col for col in inspector.get_columns("users")}
        if "hashed_password" not in columns:
            logger.warning("PostgreSQL users table is missing the hashed_password column.")
            try:
                _add_hashed_password_column(engine)
                logger.info("Added missing hashed_password column to users table.")
                return True
            except Exception as add_error:
                logger.error(
                    "Could not add hashed_password column to users table: %s",
                    add_error,
                    exc_info=True,
                )
                return False

        user_id_type = columns["id"]["type"]
        if not isinstance(user_id_type, String):
            logger.warning(
                "PostgreSQL users.id column type is not compatible with the app's string-based user IDs."
            )
            return False

        return True
    except Exception as e:
        logger.warning("Could not validate PostgreSQL schema compatibility: %s", e, exc_info=True)
        return False


def _create_engine():
    if DATABASE_URL:
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            if not _postgres_compatible(engine):
                raise RuntimeError(
                    "PostgreSQL database schema is incompatible with this app."
                )

            logger.info("Connected to PostgreSQL database.")
            return engine
        except Exception as e:
            logger.error("Could not use PostgreSQL: %s", e, exc_info=True)
            if ENVIRONMENT == "production":
                raise
            logger.warning("Falling back to SQLite at ./sql_app.db")
            return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

    if ENVIRONMENT == "production":
        raise RuntimeError("DATABASE_URL environment variable must be set in production.")

    logger.warning("DATABASE_URL not set. Using SQLite at ./sql_app.db")
    return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})


engine = _create_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

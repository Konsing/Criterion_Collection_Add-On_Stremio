import os
from dotenv import load_dotenv

# Load environment variables from .env file (if present)
load_dotenv()

def get_env_variable(name, required=True):
    value = os.getenv(name)
    if required and value is None:
        raise EnvironmentError(f"Missing required environment variable: {name}")
    # print(f"{name}:", value)
    return value

SQLALCHEMY_DATABASE_URL = get_env_variable("SQLALCHEMY_DATABASE_URL")
OMDB_API_KEY = get_env_variable("OMDB_API_KEY")
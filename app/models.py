from sqlalchemy import Column, Integer, String
from .config.database import Base

class Movie(Base):
    __tablename__ = "movies"

    # Internal database ID
    id = Column(Integer, primary_key=True, index=True)

    # Fields from scraping/OMDb
    imdb_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    poster = Column(String, nullable=False)
    year = Column(String, index=True, nullable=False)
    director = Column(String, nullable=False)
    country = Column(String, nullable=False)

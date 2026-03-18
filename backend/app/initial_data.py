import logging

from sqlmodel import Session

from app.core.db import engine, init_db
from app.seed_worklogs import seed_worklogs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    with Session(engine) as session:
        init_db(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")
    logger.info("Seeding worklogs")
    seed_worklogs()
    logger.info("Worklogs seeded")


if __name__ == "__main__":
    main()

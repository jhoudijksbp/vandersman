from dotenv import load_dotenv
load_dotenv()

pytest_plugins = [
    "tests.fixtures.aws.services",
    "tests.fixtures.common.common",
    "tests.fixtures.rompslomp.rompslomp",
]

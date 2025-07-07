import pytest
from moto import mock_dynamodb
from lambda_code.models.werkbon import WerkbonModel, Product, Service
import os

# Zorg dat .env variabelen beschikbaar zijn
os.environ.setdefault("DYNAMODB_TABLE", "vandersman-werkbon")
os.environ.setdefault("AWS_REGION", "us-west-1")


@pytest.fixture(scope="function")
def dynamodb_werkbon_table():
    with mock_dynamodb():
        if not WerkbonModel.exists():
            WerkbonModel.create_table(
                read_capacity_units=1,
                write_capacity_units=1,
                wait=True
            )
        yield  # Binnen deze context draait je test


@pytest.fixture
def werkbon_records():
    return [
        {
            "id": "1751831091342",
            "datum": "2025-07-06T19:44:51.342Z",
            "datumOpdracht": "2025-07-06",
            "dummy": "werkbon",
            "klant_id": "633688920",
            "klant_naam": "Parels aan het groen bouwnr 5",
            "medewerker": "Jeffrey Houdijk",
            "products": [
                {
                    "id": "1316003580",
                    "description": "",
                    "name": "Diversen",
                    "price": 1074.48,
                    "quantity": 1
                }
            ],
            "services": [
                {
                    "description": "",
                    "hours": 8,
                    "name": "Jeffrey Houdijk"
                }
            ]
        },
        {
            "id": "175183109133",
            "datum": "2025-07-06T19:44:51.342Z",
            "datumOpdracht": "2025-07-06",
            "dummy": "werkbon",
            "klant_id": "633688920",
            "klant_naam": "Parels aan het groen bouwnr 5",
            "medewerker": "Jeffrey Houdijk",
            "products": [
                {
                    "id": "1316003580",
                    "description": "",
                    "name": "Diversen",
                    "price": 1074.48,
                    "quantity": 1
                }
            ],
            "services": [
                {
                    "description": "",
                    "hours": 8,
                    "name": "Jeffrey Houdijk"
                }
            ]
        },
    ]


@pytest.fixture
def populate_werkbon_data(dynamodb_werkbon_table, werkbon_records):
    for record in werkbon_records:
        WerkbonModel(
            id=record["id"],
            datum=record["datum"],
            datumOpdracht=record.get("datumOpdracht"),
            dummy=record.get("dummy"),
            klant_id=record.get("klant_id"),
            klant_naam=record.get("klant_naam"),
            medewerker=record.get("medewerker"),
            products=[Product(**p) for p in record.get("products", [])],
            services=[Service(**s) for s in record.get("services", [])],
        ).save()

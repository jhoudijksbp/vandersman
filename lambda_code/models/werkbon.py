from pynamodb.exceptions import PynamoDBException
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    NumberAttribute,
    ListAttribute,
    MapAttribute,
)
from typing import List
from aws_lambda_powertools import Logger
import os

logger = Logger()


class Product(MapAttribute):
    id = UnicodeAttribute()
    name = UnicodeAttribute()
    description = UnicodeAttribute(null=True)
    price = NumberAttribute()
    quantity = NumberAttribute()


class Service(MapAttribute):
    name = UnicodeAttribute()
    description = UnicodeAttribute(null=True)
    hours = NumberAttribute()


class WerkbonModel(Model):
    class Meta:
        table_name = os.environ.get("DYNAMODB_TABLE", "vandersman-werkbon")
        region = "us-west-1"

    id = UnicodeAttribute(hash_key=True)
    datum = UnicodeAttribute(range_key=True)
    datumOpdracht = UnicodeAttribute(null=True)
    dummy = UnicodeAttribute(null=True)
    klant_id = UnicodeAttribute(null=True)
    klant_naam = UnicodeAttribute(null=True)
    medewerker = UnicodeAttribute(null=True)

    products = ListAttribute(of=Product, null=True)
    services = ListAttribute(of=Service, null=True)

    @classmethod
    def get_by_ids(cls, id_datum_pairs: list[tuple[str, str]]) -> list[dict]:
        werkbonnen = []
        for werkbon_id, datum in id_datum_pairs:
            try:
                item = cls.get(werkbon_id, datum)
                werkbonnen.append(item.attribute_values)
            except cls.DoesNotExist:
                logger.warning(f"Werkbon met ID {werkbon_id} op datum {datum} bestaat niet")
            except PynamoDBException as e:
                logger.exception(f"PynamoDB fout bij ophalen werkbon {werkbon_id}: {str(e)}")
                raise RuntimeError(f"Fout bij ophalen werkbon {werkbon_id}: {e}")
            except Exception as e:
                logger.exception(f"Onverwachte fout bij ophalen werkbon {werkbon_id}")
                raise RuntimeError(f"Onverwachte fout bij ophalen werkbon {werkbon_id}: {e}")
        return werkbonnen
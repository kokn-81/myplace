import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from pydantic import ValidationError


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from api_schemas import MAX_CHAT_CANDIDATES, MAX_CHAT_MESSAGE_LENGTH, PeticionChat
from nia_search import (
    SEARCH_ALGORITHM_VERSION,
    SearchFilters,
    efficient_property_search,
    offer_matches,
    parse_search_filters,
)


class ChatRequestLimitsTests(unittest.TestCase):
    def test_accepts_boundary_values_and_strips_message(self):
        request = PeticionChat(
            mensaje=f"  {'x' * (MAX_CHAT_MESSAGE_LENGTH - 4)}  ",
            candidate_ids=list(range(1, MAX_CHAT_CANDIDATES + 1)),
        )

        self.assertEqual(len(request.mensaje), MAX_CHAT_MESSAGE_LENGTH - 4)
        self.assertEqual(len(request.candidate_ids or []), MAX_CHAT_CANDIDATES)

    def test_rejects_empty_or_oversized_message(self):
        for message in ("   ", "x" * (MAX_CHAT_MESSAGE_LENGTH + 1)):
            with self.subTest(length=len(message)):
                with self.assertRaises(ValidationError):
                    PeticionChat(mensaje=message)

    def test_rejects_too_many_or_invalid_candidate_ids(self):
        with self.assertRaises(ValidationError):
            PeticionChat(
                mensaje="departamento",
                candidate_ids=list(range(1, MAX_CHAT_CANDIDATES + 2)),
            )
        for invalid_id in (0, -1, True, "1"):
            with self.subTest(candidate_id=invalid_id):
                with self.assertRaises(ValidationError):
                    PeticionChat(mensaje="departamento", candidate_ids=[invalid_id])


class OperationCharacterizationTests(unittest.TestCase):
    INTENT_CASES = (
        ("quiero alquilar", "Alquiler"),
        ("quiero arrendar", "Alquiler"),
        ("quiero comprar", "Venta"),
        ("quiero vender", "Venta"),
        ("quiero alquilar o comprar", "Alquiler y Venta"),
        ("arrendar o comprar", "Alquiler y Venta"),
        ("alquilar, comprar", "Alquiler y Venta"),
        ("quiero vender o arrendar", "Alquiler y Venta"),
        ("quiero adquirir o alquilar", "Alquiler y Venta"),
        ("  QUIERO   ALQUILAR... O, COMPRAR  ", "Alquiler y Venta"),
    )

    def test_parses_shared_intent_matrix(self):
        for query, expected in self.INTENT_CASES:
            with self.subTest(query=query):
                self.assertEqual(parse_search_filters(query).operation, expected)

    def test_does_not_match_operation_terms_inside_other_words(self):
        for query in ("compraventa", "realquilar", "arrendamiento"):
            with self.subTest(query=query):
                self.assertIsNone(parse_search_filters(query).operation)

    def test_both_matches_rent_only_and_sale_only_offers(self):
        filters = SearchFilters(operation="Alquiler y Venta")

        for operation in ("Alquiler", "Venta"):
            with self.subTest(operation=operation):
                property_with_offer = SimpleNamespace(
                    ofertas=[SimpleNamespace(estado="Publicado", operacion=operation, precio=100, moneda="$ (USD)")],
                    operacion=operation,
                    precio_usd=100,
                    moneda="$ (USD)",
                )
                self.assertTrue(offer_matches(property_with_offer, filters))


class LlmCostCharacterizationTests(unittest.TestCase):
    @patch("nia_search.log_search")
    @patch("nia_search.save_cache")
    @patch("nia_search.run_embedding_layer", return_value=([], False))
    @patch("nia_search.run_sql_layer", return_value=[1])
    @patch("nia_search.get_cached_result", return_value=None)
    def test_v3_cache_entries_are_not_reused(
        self,
        cached_result,
        _sql_layer,
        _embedding_layer,
        _save_cache,
        _log_search,
    ):
        db = object()

        efficient_property_search(db=db, message="quiero comprar", candidate_ids=None)

        self.assertEqual(SEARCH_ALGORITHM_VERSION, "nia-hybrid-v4")
        cached_result.assert_called_once_with(db, "quiero comprar", "nia-hybrid-v4:all")

    @patch("nia_search.log_search")
    @patch("nia_search.save_cache")
    @patch("nia_search.run_embedding_layer", return_value=([], False))
    @patch("nia_search.run_sql_layer", return_value=[1])
    @patch("nia_search.get_cached_result", return_value=None)
    def test_existing_results_do_not_generate_unused_explanation(
        self,
        _cached_result,
        _sql_layer,
        _embedding_layer,
        _save_cache,
        _log_search,
    ):
        models = SimpleNamespace(generate_content=lambda **_kwargs: self.fail("No debe llamarse al LLM."))
        result = efficient_property_search(
            db=object(),
            message="recomienda un departamento",
            candidate_ids=None,
            llm_client=SimpleNamespace(models=models),
            llm_model="test-model",
        )

        self.assertEqual(result["ids"], [1])
        self.assertEqual(result["explanation"], "")
        self.assertFalse(result["llm_used"])

    @patch("nia_search.log_search")
    @patch("nia_search.save_cache")
    @patch("nia_search.call_llm_for_ids", return_value=([9], 10, 5))
    @patch("nia_search.run_sql_layer", return_value=[])
    @patch("nia_search.get_cached_result", return_value=None)
    def test_minimal_llm_fallback_remains_available_when_no_results_exist(
        self,
        _cached_result,
        _sql_layer,
        llm_fallback,
        _save_cache,
        _log_search,
    ):
        result = efficient_property_search(
            db=object(),
            message="recomienda un departamento",
            candidate_ids=None,
            llm_client=object(),
            llm_model="test-model",
        )

        llm_fallback.assert_called_once()
        self.assertEqual(result["ids"], [9])
        self.assertEqual(result["layer"], "C_LLM_MINIMAL")
        self.assertEqual(result["explanation"], "")
        self.assertTrue(result["llm_used"])


class FirestoreRulesRegressionTests(unittest.TestCase):
    def test_owner_profile_update_cannot_change_role(self):
        rules = (PROJECT_ROOT / "frontend" / "firestore.rules").read_text(encoding="utf-8")
        owner_update = next(line.strip() for line in rules.splitlines() if "allow update: if isOwner(userId)" in line)

        self.assertIn("'name'", owner_update)
        self.assertIn("'favorites'", owner_update)
        self.assertNotIn("'role'", owner_update)


if __name__ == "__main__":
    unittest.main()

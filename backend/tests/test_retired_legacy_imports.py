import sys
import unittest
from pathlib import Path
from unittest.mock import patch

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import database
import import_c21_catalog
import import_remax_catalog


class RetiredLegacyCatalogTests(unittest.TestCase):
    def test_server_start_does_not_restore_the_retired_catalog(self):
        with patch.object(database, "LEGACY_PROPERTY_IMPORTS_ENABLED", False), patch.object(database, "SessionLocal") as session:
            database.seed_remax_catalog()
        session.assert_not_called()

    def test_remax_import_stops_before_opening_the_database(self):
        with patch.object(import_remax_catalog, "LEGACY_PROPERTY_IMPORTS_ENABLED", False), patch.object(import_remax_catalog, "SessionLocal") as session:
            with self.assertRaisesRegex(RuntimeError, "desactivada"):
                import_remax_catalog.run_batch_import([{"titulo": "Departamento"}])
        session.assert_not_called()

    def test_c21_import_stops_before_fetching_or_opening_the_database(self):
        with patch.object(import_c21_catalog, "LEGACY_PROPERTY_IMPORTS_ENABLED", False), patch.object(import_c21_catalog, "SessionLocal") as session, patch.object(import_c21_catalog, "fetch_c21_page") as fetch:
            with self.assertRaisesRegex(RuntimeError, "desactivada"):
                import_c21_catalog.run_c21_ingestion(["venta", "renta"])
        session.assert_not_called()
        fetch.assert_not_called()

    def test_legacy_export_cannot_replace_the_project_snapshot(self):
        with patch.object(import_c21_catalog, "LEGACY_PROPERTY_IMPORTS_ENABLED", False):
            with self.assertRaisesRegex(RuntimeError, "desactivada"):
                import_c21_catalog.export_catalog_snapshot(None)

    def test_sync_endpoint_stays_disabled_for_an_administrator(self):
        import main
        from fastapi import HTTPException
        with patch.object(main, "LEGACY_PROPERTY_IMPORTS_ENABLED", False):
            with self.assertRaises(HTTPException) as error:
                main.sincronizar_catalogo_remax(db=None, current_profile={"role": "admin"})
        self.assertEqual(error.exception.status_code, 409)


if __name__ == "__main__":
    unittest.main()

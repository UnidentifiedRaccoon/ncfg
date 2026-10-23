import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import contextlib
import io
import types
import urllib.error

spec = importlib.util.spec_from_file_location("verify_export", Path(__file__).with_name("verify-export.py"))
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)


def load_tool(name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(name + ".py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ExportSafetyTest(unittest.TestCase):
    def test_expected_row_count_sql_matches_exporter(self):
        exporter = load_tool("export-postgres")
        verifier = load_tool("verify-postgres")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "row-counts.sql"
            path.write_text(exporter.ROW_COUNTS_SQL + ";\n")
            self.assertEqual(verifier.verified_row_counts_sql(path), exporter.ROW_COUNTS_SQL)

    def test_archive_sql_cannot_append_commands(self):
        verifier = load_tool("verify-postgres")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "row-counts.sql"
            path.write_text(verifier.ROW_COUNTS_SQL + "; SELECT pg_read_file('/etc/passwd');")
            with self.assertRaisesRegex(ValueError, "refusing to execute"):
                verifier.verified_row_counts_sql(path)

    def test_database_export_preserves_existing_sidecars_before_secrets(self):
        exporter = load_tool("export-postgres")
        for filename in ("source-row-counts.json", "row-counts.sql"):
            with self.subTest(filename=filename), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / filename
                path.write_text("previous export")
                responses = [
                    json.dumps({"name": "ncfg-db-rescue-test", "status": "RUNNING", "config": {"version": "16"}}).encode(),
                    json.dumps([{"name": "test.mdb.yandexcloud.net"}]).encode(),
                    b"pg_dump 16.0", b"pg_restore 16.0", b"psql 16.0",
                ]
                with patch("sys.argv", ["export-postgres.py", "test-clone", str(Path(directory) / "new.dump")]), \
                     patch.object(exporter, "command", side_effect=responses) as command, \
                     patch.object(exporter.socket, "create_connection") as connection, \
                     patch.object(exporter.urllib.request, "urlopen") as request:
                    connection.return_value.__enter__.return_value.recv.return_value = b"S"
                    with self.assertRaises(FileExistsError):
                        exporter.main()
                    request.assert_not_called()
                    self.assertEqual(command.call_count, 5)
                self.assertEqual(path.read_text(), "previous export")

    def test_failed_page_downloads_exit_nonzero_and_keep_report(self):
        pages = load_tool("export-pages")
        with tempfile.TemporaryDirectory() as directory:
            with patch("sys.argv", ["export-pages.py", directory]), \
                 patch.object(pages.subprocess, "run", return_value=types.SimpleNamespace(returncode=0, stdout="test-token")), \
                 patch.object(pages.urllib.request, "build_opener") as opener, \
                 contextlib.redirect_stdout(io.StringIO()):
                opener.return_value.open.side_effect = urllib.error.HTTPError(pages.ROOT, 403, "Forbidden", {}, None)
                with self.assertRaises(SystemExit) as error:
                    pages.main()
            self.assertEqual(error.exception.code, 1)
            report = json.loads((Path(directory) / "manifest.json").read_text())
            self.assertFalse(report["complete"])
            self.assertEqual(report["saved"], 0)


class VerifyExportTest(unittest.TestCase):
    def fixture(self, root):
        blobs = root / "blobs" / "sha256"
        blobs.mkdir(parents=True)
        def put(content, media_type):
            body = json.dumps(content).encode() if isinstance(content, dict) else content
            digest = hashlib.sha256(body).hexdigest()
            (blobs / digest).write_bytes(body)
            return {"digest": "sha256:" + digest, "size": len(body), "mediaType": media_type}
        config = put({}, "application/vnd.oci.image.config.v1+json")
        layer = put(b"example layer", "application/vnd.oci.image.layer.v1.tar")
        manifest_type = "application/vnd.oci.image.manifest.v1+json"
        manifest = put({"schemaVersion": 2, "mediaType": manifest_type, "config": config, "layers": [layer]}, manifest_type)
        index_type = "application/vnd.oci.image.index.v1+json"
        index = put({"schemaVersion": 2, "mediaType": index_type, "manifests": [manifest]}, index_type)
        (root / "oci-layout").write_text('{"imageLayoutVersion":"1.0.0"}')
        (root / "index.json").write_text(json.dumps({"schemaVersion": 2, "manifests": [index, manifest]}))
        return blobs / layer["digest"][7:]

    def test_valid_nested_graph_and_shared_layer(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.fixture(root)
            self.assertEqual(verify.verify_oci(root)["unique_objects"], 4)

    def test_same_size_corruption_is_detected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            layer = self.fixture(root)
            layer.write_bytes(b"tampered data")
            with self.assertRaisesRegex(ValueError, "Corrupt OCI"):
                verify.verify_oci(root)

    def test_missing_descendant_is_detected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.fixture(root).unlink()
            with self.assertRaisesRegex(ValueError, "Missing"):
                verify.verify_oci(root)

    def test_media_path_cannot_escape_archive(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "manifest.json").write_text(json.dumps({"complete": True, "objects": [{"path": "../outside", "key": "file"}]}))
            with self.assertRaisesRegex(ValueError, "Invalid object mapping"):
                verify.verify_media(root)


if __name__ == "__main__":
    unittest.main()

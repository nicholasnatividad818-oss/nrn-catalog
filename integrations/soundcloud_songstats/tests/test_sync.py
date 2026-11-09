import importlib.util
from pathlib import Path
import unittest

PATH = Path(__file__).resolve().parents[1] / "sync.py"
spec = importlib.util.spec_from_file_location("soundcloud_sync", PATH)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

class MatchingTests(unittest.TestCase):
    def setUp(self):
        self.catalog = [
            {"songstats_track_id": "a", "title": "KAIMEHRA v6", "isrcs": ["USAAA0000001"]},
            {"songstats_track_id": "b", "title": "Angels Oń My Shoulder", "isrcs": []},
            {"songstats_track_id": "c", "title": "Duplicated", "isrcs": []},
            {"songstats_track_id": "d", "title": "Duplicated", "isrcs": []},
        ]

    def test_isrc_precedes_title(self):
        rows = sync.match_tracks(
            [{"id": 1, "title": "Different", "isrc": "USAAA0000001"}], self.catalog)
        self.assertEqual(rows[0]["songstats_track_id"], "a")
        self.assertEqual(rows[0]["match_method"], "isrc")

    def test_unicode_normalization(self):
        rows = sync.match_tracks([{"id": 2, "title": "Angels On My Shoulder"}], self.catalog)
        self.assertEqual(rows[0]["songstats_track_id"], "b")

    def test_unmatched_and_ambiguous(self):
        rows = sync.match_tracks([
            {"id": 3, "title": "Duplicated"},
            {"id": 4, "title": "Unreleased track"},
        ], self.catalog)
        statuses = {r["title"]: r["status"] for r in rows}
        self.assertEqual(statuses["Duplicated"], "review_ambiguous")
        self.assertEqual(statuses["Unreleased track"], "missing_songstats")

    def test_duplicate_soundcloud_id(self):
        rows = sync.match_tracks([{"id": 1, "title": "One"}, {"id": 1, "title": "One"}], [])
        self.assertEqual(len(rows), 1)

if __name__ == "__main__":
    unittest.main()

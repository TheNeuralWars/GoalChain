#!/usr/bin/env python3
"""Contracts for the goalworld.fun publish guard (issue #881). Run:
    python3 scripts/pages/test_guard_published_tree.py
"""
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
STAGE = os.path.join(HERE, "stage_public_tree.py")
GUARD = os.path.join(HERE, "guard_published_tree.py")


def make_docs(root):
    def w(rel, text="# t\n"):
        path = os.path.join(root, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(text)

    w(".assetsignore", "intake/\nproposals/\n*INTERNAL*\n")
    w("index.html", "<html>public</html>")
    w("public.md", "# public page\n")
    w("intake/README.md", "# GoalChain intake queue\n")
    w("intake/2026-09-02-internal-brief.md", "internal\n")
    w("intake/2026-09-02-internal-brief.md.done", "")
    w("proposals/hermes/issue-1-proposal.md", "internal\n")


def run(script, *args):
    return subprocess.run([sys.executable, script, *args], capture_output=True, text=True)


class PublishGuardTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="guard-881-")
        self.docs = os.path.join(self.tmp, "docs")
        self.site = os.path.join(self.tmp, "_site")
        make_docs(self.docs)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_stage_keeps_internal_docs_out_of_the_published_tree(self):
        """Contract: nothing from docs/intake or docs/proposals reaches the artifact."""
        res = run(STAGE, "--src", self.docs, "--dst", self.site)
        self.assertEqual(res.returncode, 0, res.stderr)
        self.assertTrue(os.path.isfile(os.path.join(self.site, "public.md")))
        self.assertFalse(os.path.exists(os.path.join(self.site, "intake")))
        self.assertFalse(os.path.exists(os.path.join(self.site, "proposals")))

    def test_stage_drops_directory_indexes(self):
        """Contract: README.md is not uploaded, so Jekyll cannot list a directory."""
        run(STAGE, "--src", self.docs, "--dst", self.site)
        self.assertFalse(os.path.exists(os.path.join(self.site, "intake", "README.md")))

    def test_guard_rejects_internal_doc_that_reached_the_published_tree(self):
        """Contract: a staging miss fails the deploy instead of publishing."""
        run(STAGE, "--src", self.docs, "--dst", self.site)
        leak = os.path.join(self.site, "intake", "extra-brief.md")
        os.makedirs(os.path.dirname(leak), exist_ok=True)
        with open(leak, "w", encoding="utf-8") as fh:
            fh.write("leak\n")
        res = run(GUARD, "--root", self.site, "--patterns", self.docs)
        self.assertEqual(res.returncode, 1, res.stdout)
        self.assertIn("intake/extra-brief.md", res.stdout)

    def test_guard_passes_a_cleanly_staged_tree(self):
        """Contract: no false positive on the legitimate public tree."""
        run(STAGE, "--src", self.docs, "--dst", self.site)
        res = run(GUARD, "--root", self.site, "--patterns", self.docs)
        self.assertEqual(res.returncode, 0, res.stdout)

    def test_guard_advisory_mode_documents_repo_state_without_blocking(self):
        """Contract: pre-existing repo docs are reported, exit 0 while the purge is pending."""
        res = run(GUARD, "--root", self.docs, "--patterns", self.docs, "--repo", "--advisory")
        self.assertEqual(res.returncode, 0, res.stdout)
        self.assertIn("intake/", res.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)

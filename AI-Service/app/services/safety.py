"""Compatibility helpers for immediate-safety checks.

The authoritative phrase lists and risk ordering live in ``risk.py``.
Keep this function for existing callers while delegating classification to
that single source of truth.
"""

from app.services.risk import detect_risk


def detect_immediate_risk(text: str) -> bool:
    """Return True when the rule-based classifier marks input as high risk.

    This is a deterministic keyword/rule check, not a clinical assessment.
    """

    return detect_risk(text) == "high"
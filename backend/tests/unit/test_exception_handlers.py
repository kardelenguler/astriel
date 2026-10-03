"""exception_handlers.py yardımcı fonksiyonlarının birim testleri."""

import pytest

from app.api.exception_handlers import format_field_path, translate_message


@pytest.mark.parametrize(
    ("location", "expected"),
    [
        (("body", "latitude"), "latitude"),
        (("query", "limit"), "limit"),
        (("path", "chart_id"), "chart_id"),
        (("body", "items", 0, "name"), "items.0.name"),
    ],
)
def test_format_field_path(location, expected):
    assert format_field_path(location) == expected


@pytest.mark.parametrize(
    ("error", "expected"),
    [
        (
            {"type": "less_than_equal", "msg": "Input should be <= 90", "ctx": {"le": 90}},
            "En fazla 90 olabilir.",
        ),
        (
            {"type": "less_than_equal", "msg": "Input should be <= 90", "ctx": {"le": 90.0}},
            "En fazla 90 olabilir.",
        ),
        ({"type": "missing", "msg": "Field required"}, "Bu alan zorunludur."),
        (
            {"type": "value_error", "msg": "Value error, Doğum yılı hatalı.", "ctx": {}},
            "Doğum yılı hatalı.",
        ),
        ({"type": "bilinmeyen_tur", "msg": "Original message"}, "Original message"),
    ],
)
def test_translate_message(error, expected):
    assert translate_message(error) == expected 
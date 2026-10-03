"""logging_config.py birim testleri."""

import logging
from logging.handlers import RotatingFileHandler


def test_file_logging_disabled_in_tests():
    # conftest.py ENVIRONMENT=test yaptığı için log dosyasına yazılmamalı
    handlers = logging.getLogger().handlers
    assert not any(isinstance(h, RotatingFileHandler) for h in handlers) 
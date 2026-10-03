"""Loglama ayarları.

Uygulama başlarken setup_logging() BİR KEZ çağrılır (main.py içinde).
Diğer dosyalar log yazmak için sadece şunu yapar:

    import logging
    logger = logging.getLogger(__name__)
    logger.info("...")
"""

import logging
from logging.handlers import RotatingFileHandler

from app.core.config import BASE_DIR, settings

LOG_DIR = BASE_DIR / "logs"
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"


def setup_logging() -> None:
    formatter = logging.Formatter(LOG_FORMAT)

    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level)
    root_logger.handlers.clear()  # iki kez çağrılırsa her log çift yazılmasın

    # 1) Terminale yaz (production'da sunucu panelleri logları buradan toplar)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # 2) Dosyaya SADECE geliştirme ortamında yaz: 5 MB dolunca yeni dosyaya geçer,
    #    en fazla 3 eski dosya tutar.
    #    - Testlerde yazılmaz: gerçek log dosyası test kayıtlarıyla dolmasın.
    #    - Production'da yazılmaz: sunucunun diski her yeniden başlatmada silinir.
    if settings.environment == "development":
        LOG_DIR.mkdir(exist_ok=True)
        file_handler = RotatingFileHandler(
            LOG_DIR / "astriel.log",
            maxBytes=5 * 1024 * 1024,
            backupCount=3,
            encoding="utf-8",  # Türkçe karakterler bozulmasın
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler) 
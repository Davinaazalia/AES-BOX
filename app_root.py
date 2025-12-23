import os
import sys

BASE_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app  # noqa: E402


if __name__ == "__main__":
    # Production: use gunicorn
    # Development: use debug mode
    is_production = os.getenv('FLASK_ENV') == 'production' or os.getenv('RENDER') == 'true'
    app.run(debug=not is_production, port=int(os.getenv('PORT', 5000)))

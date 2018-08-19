"""Helper functions for web application"""

from flask import redirect, session
from functools import wraps

def login_required(f):
    """Decorates routes to require login"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function
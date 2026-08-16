"""OmniRoute model provider plugin.

Loads credentials dynamically from config.yaml and registers the omniroute provider.
"""

import os
from hermes_cli.config import load_config
from providers import register_provider
from providers.base import ProviderProfile

# 1. Dynamically read credentials from config.yaml providers block and inject them to env
try:
    config = load_config()
    entry = config.get("providers", {}).get("omniroute", {})
    if isinstance(entry, dict):
        api_key = entry.get("api_key") or ""
        base_url = entry.get("base_url") or entry.get("url") or entry.get("api") or ""
        if api_key and not os.getenv("OMNIROUTE_API_KEY"):
            os.environ["OMNIROUTE_API_KEY"] = api_key
        if base_url and not os.getenv("OMNIROUTE_BASE_URL"):
            os.environ["OMNIROUTE_BASE_URL"] = base_url
except Exception:
    pass

# 2. Register the omniroute provider profile
omniroute_profile = ProviderProfile(
    name="omniroute",
    aliases=("omniroute",),
    display_name="OmniRoute",
    description="OmniRoute Model Router",
    env_vars=("OMNIROUTE_API_KEY", "OMNIROUTE_BASE_URL"),
    base_url="http://127.0.0.1:20128/v1",  # default fallback base URL
    fallback_models=(
        "context-1m",
        "coding",
        "parameters",
        "writing",
        "small",
        "infalible",
        "tooling",
    ),
)

register_provider(omniroute_profile)

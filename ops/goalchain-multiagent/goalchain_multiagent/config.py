import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _env_files() -> tuple[str, ...]:
    paths: list[str] = []
    ma_env = os.environ.get("GOALCHAIN_MA_ENV")
    if ma_env:
        paths.append(ma_env)
    else:
        default = Path.home() / ".config" / "goalchain-multiagent.env"
        if default.is_file():
            paths.append(str(default))
    local = Path(".env")
    if local.is_file():
        paths.append(str(local))
    return tuple(paths)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    goalchain_multiagent_enabled: bool = False
    goalchain_ma_host: str = "127.0.0.1"
    goalchain_ma_port: int = 8790
    goalchain_ma_token: str = ""
    goalchain_ma_mock_llm: bool = True
    # auto | openrouter | anthropic | openai — auto uses FCC OpenRouter when enabled
    goalchain_ma_provider: str = "auto"
    goalchain_ma_use_fcc_keys: bool = True
    goalchain_ma_model: str = "claude-sonnet-4-20250514"
    goalchain_ma_openai_model: str = "gpt-4o-mini"
    goalchain_ma_openrouter_model: str = "openai/gpt-4o-mini"
    goalchain_ma_openrouter_base_url: str = "https://openrouter.ai/api/v1"
    goalchain_ma_max_hops: int = 6
    goalchain_ma_ops_live: bool = True
    github_repo: str = "TheNeuralWars/GoalChain"
    hermes_home: str = "/home/goalchain/hermes"

    anthropic_api_key: str = ""
    openai_api_key: str = ""
    openrouter_api_key: str = ""


def get_settings() -> Settings:
    return Settings()

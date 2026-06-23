"""Video pipeline orchestration (issue #831).

Submodules:
- grok_narrative: Grok API call -> English 6-10s narrative.
- english_check: English-only guard delegating to social_multiplexer.
- buffer_publisher: submits a rendered video to Buffer (multi-channel).
- buffer_config: env-backed channel resolver.
- compose_916: CLI orchestrator that wires all the above and renders 9:16.
"""

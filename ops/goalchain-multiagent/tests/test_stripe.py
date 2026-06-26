import pytest
from goalchain_multiagent.stripe_ops import get_stripe_balance, create_stripe_checkout, provision_saas_service
from goalchain_multiagent.config import Settings

def test_stripe_balance_mock():
    s = Settings(stripe_api_key="")
    balance = get_stripe_balance(s)
    assert balance["mock"] is True
    assert balance["available"][0]["amount"] == 425000

def test_stripe_checkout_mock():
    s = Settings(stripe_api_key="")
    checkout = create_stripe_checkout(
        item_name="Manager Elite Subscription",
        amount_cents=1900,
        success_url="https://goalchain.fun/success",
        cancel_url="https://goalchain.fun/cancel",
        settings=s
    )
    assert checkout["mock"] is True
    assert "cs_test_mock" in checkout["id"]
    assert "stripe.com" in checkout["url"]

def test_stripe_provision_saas_mock():
    s = Settings(stripe_api_key="")
    res = provision_saas_service(
        service_name="Helius RPC Premium Plan",
        plan_cost_cents=4900,
        settings=s
    )
    assert res["status"] == "success"
    assert res["amount_paid"] == 49.0
    assert "Helius RPC" in res["service"]

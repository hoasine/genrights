"""
Direct-mode tests for GenRights — mocks web + LLM (no Studio required).

Run: pytest tests/direct/test_genrights.py -v
"""

import json

import pytest

CONTRACT = "contracts/genrights.py"

REGISTER_MOCK = json.dumps(
    {
        "valid": True,
        "work_type_match": True,
        "fingerprint_summary": "Tech blog about GenLayer and AI contracts.",
        "reject_reason": None,
        "confidence_percent": 90,
    },
    sort_keys=True,
)

INFRINGEMENT_MOCK = json.dumps(
    {
        "decision": "INFRINGEMENT_CONFIRMED",
        "infringement_types": ["verbatim_copy"],
        "similarity_score": 0.91,
        "fair_use_likely": False,
        "confidence_percent": 88,
        "evidence_summary": "Opening 3 paragraphs are nearly identical.",
        "recommended_action": "PAY_BOUNTY",
    },
    sort_keys=True,
)

NOT_INFRINGEMENT_MOCK = json.dumps(
    {
        "decision": "NOT_INFRINGEMENT",
        "infringement_types": [],
        "similarity_score": 0.12,
        "fair_use_likely": False,
        "confidence_percent": 85,
        "evidence_summary": "Different topic and structure.",
        "recommended_action": "NONE",
    },
    sort_keys=True,
)


@pytest.fixture
def contract(direct_vm, direct_deploy, direct_alice):
    direct_vm.mock_web(r".*", "Sample article content about blockchain and AI.")
    direct_vm.mock_llm(r".*copyright registrar.*", REGISTER_MOCK)
    direct_vm.mock_llm(r".*IP jury.*", INFRINGEMENT_MOCK)
    direct_vm.sender = direct_alice
    return direct_deploy(CONTRACT)


class TestRegisterWork:
    def test_register_returns_work_id(self, contract):
        urls = json.dumps(["https://example.com/original-post"])
        work_id = contract.register_work(
            "My Article",
            "article",
            urls,
            "All rights reserved. No commercial reuse without license.",
            75,
        )
        assert work_id.startswith("work_")
        work = contract.get_work(work_id)
        assert work["title"] == "My Article"
        assert work["status"] == "ACTIVE"
        assert "GenLayer" in work["fingerprint_summary"] or len(
            work["fingerprint_summary"]
        ) > 10

    def test_list_work_ids(self, contract):
        urls = json.dumps(["https://example.com/a"])
        contract.register_work("A", "article", urls, "terms")
        ids = contract.list_work_ids()
        assert len(ids) >= 1


class TestBountyAndReport:
    def test_fund_bounty(self, contract, direct_vm, direct_alice):
        urls = json.dumps(["https://example.com/original"])
        work_id = contract.register_work("Title", "article", urls, "license terms")
        direct_vm.value = 10**18
        contract.fund_bounty(work_id)
        work = contract.get_work(work_id)
        assert work["bounty_pool"] == 10**18

    def test_report_infringement_confirmed(self, contract, direct_vm, direct_alice):
        urls = json.dumps(["https://example.com/original"])
        work_id = contract.register_work("Title", "article", urls, "license")
        direct_vm.value = 10 * 10**18
        contract.fund_bounty(work_id)
        report_id = contract.report_infringement(
            work_id, "https://example.com/copy-site"
        )
        report = contract.get_report(report_id)
        assert report["status"] == "CONFIRMED"
        assert report["decision"] == "INFRINGEMENT_CONFIRMED"
        work = contract.get_work(work_id)
        assert work["bounty_pool"] < 10 * 10**18

    def test_report_rejected(self, contract, direct_vm, direct_alice):
        direct_vm.clear_mocks()
        direct_vm.mock_web(r".*", "Unrelated content.")
        direct_vm.mock_llm(r".*copyright registrar.*", REGISTER_MOCK)
        direct_vm.mock_llm(r".*IP jury.*", NOT_INFRINGEMENT_MOCK)
        urls = json.dumps(["https://example.com/original"])
        work_id = contract.register_work("Title", "article", urls, "license")
        direct_vm.value = 5 * 10**18
        contract.fund_bounty(work_id)
        report_id = contract.report_infringement(work_id, "https://other.com/page")
        report = contract.get_report(report_id)
        assert report["status"] == "REJECTED"

    def test_duplicate_url_reverts(self, contract, direct_vm, direct_alice):
        urls = json.dumps(["https://example.com/original"])
        work_id = contract.register_work("Title", "article", urls, "license")
        direct_vm.value = 10**18
        contract.fund_bounty(work_id)
        contract.report_infringement(work_id, "https://dup.com/page")
        from gltest.direct import ContractRollback

        with pytest.raises((ContractRollback, Exception)):
            contract.report_infringement(work_id, "https://dup.com/page")

    def test_empty_bounty_reverts(self, contract):
        urls = json.dumps(["https://example.com/original"])
        work_id = contract.register_work("Title", "article", urls, "license")
        from gltest.direct import ContractRollback

        with pytest.raises((ContractRollback, Exception)):
            contract.report_infringement(work_id, "https://suspect.com/x")

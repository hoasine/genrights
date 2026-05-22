# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
GenRights — On-chain content registry, AI infringement jury, and bounty payouts.

Uses gl.nondet.web.render + gl.nondet.exec_prompt inside equivalence-principle blocks.
"""

import json
from dataclasses import dataclass
from genlayer import *
import genlayer.gl.vm as glvm


def _parse_llm_json(raw) -> dict:
    if isinstance(raw, dict):
        return raw
    s = str(raw).strip().replace("```json", "").replace("```", "").strip()
    start, end = s.find("{"), s.rfind("}") + 1
    if start >= 0 and end > start:
        s = s[start:end]
    return json.loads(s)


def _stable_json(data: dict) -> str:
    return json.dumps(data, sort_keys=True)


def _truncate(text: str, limit: int = 8000) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n...[truncated]"


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


@allow_storage
@dataclass
class Work:
    id: str
    rights_holder: str
    title: str
    work_type: str
    canonical_urls_json: str
    license_terms: str
    fingerprint_summary: str
    bounty_pool: u256
    min_confidence_percent: u256
    status: str
    created_at: str


@allow_storage
@dataclass
class Report:
    id: str
    work_id: str
    suspect_url: str
    reporter: str
    status: str
    decision: str
    similarity_score: u256
    confidence_percent: u256
    evidence_summary: str
    resolved_at: str


class GenRights(gl.Contract):
    works: TreeMap[str, Work]
    reports: TreeMap[str, Report]
    work_reports_index: TreeMap[str, str]
    url_dedupe: TreeMap[str, str]
    work_counter: u256
    report_counter: u256
    default_min_confidence: u256
    bounty_reward_percent: u256

    def __init__(self):
        # TreeMap/DynArray are zero-initialized on deploy — do NOT assign TreeMap() here.
        # See: https://docs.genlayer.com/developers/intelligent-contracts/storage
        self.default_min_confidence = u256(75)
        self.bounty_reward_percent = u256(20)

    def _next_work_id(self) -> str:
        n = int(self.work_counter) + 1
        self.work_counter = u256(n)
        holder = gl.message.sender_address
        return f"work_{n}_{holder.as_hex[:10]}"

    def _next_report_id(self) -> str:
        n = int(self.report_counter) + 1
        self.report_counter = u256(n)
        return f"report_{n}"

    def _dedupe_key(self, work_id: str, suspect_url: str) -> str:
        return f"{work_id}::{suspect_url.strip().lower()}"

    def _fetch_urls_text(self, urls_json: str) -> str:
        urls = json.loads(urls_json)
        blob = ""
        for url in urls:
            try:
                blob += f"\n--- URL: {url} ---\n"
                blob += gl.nondet.web.render(url, mode="text")
            except Exception as e:
                blob += f"\n[fetch error: {e}]\n"
        return _truncate(blob)

    def _ai_register_fingerprint(
        self, title: str, work_type: str, canonical_blob: str, license_terms: str
    ) -> dict:
        def leader_fn() -> str:
            task = f"""
You are an on-chain copyright registrar. Analyze the source content.

Title: {title}
Work type: {work_type}
License terms (summary): {license_terms[:2000]}

Crawled content:
{canonical_blob[:10000]}

Respond ONLY with JSON:
{{
  "valid": true,
  "work_type_match": true,
  "fingerprint_summary": "500 word max summary of themes, style, key phrases, structure",
  "reject_reason": null,
  "confidence_percent": 85
}}
If spam/404/empty, set valid=false and reject_reason.
"""
            result = gl.nondet.exec_prompt(task, response_format="json")
            return _stable_json(_parse_llm_json(result))

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, glvm.Return):
                return False
            own = json.loads(leader_fn())
            leader = leader_result.calldata
            if not isinstance(leader, str):
                return False
            leader_d = json.loads(leader)
            return (
                leader_d.get("valid") == own.get("valid")
                and bool(leader_d.get("fingerprint_summary"))
                == bool(own.get("fingerprint_summary"))
            )

        raw = glvm.run_nondet_unsafe(leader_fn, validator_fn)
        return json.loads(raw)

    def _ai_infringement_jury(
        self,
        fingerprint_summary: str,
        license_terms: str,
        canonical_blob: str,
        suspect_url: str,
        suspect_blob: str,
        min_confidence_percent: int,
    ) -> dict:
        def leader_fn() -> str:
            task = f"""
You are an on-chain IP jury (contract rubric, not a court of law).

ORIGINAL FINGERPRINT:
{fingerprint_summary[:3000]}

LICENSE TERMS:
{license_terms[:2000]}

ORIGINAL CONTENT (excerpt):
{canonical_blob[:6000]}

SUSPECT URL: {suspect_url}

SUSPECT CONTENT (excerpt):
{suspect_blob[:6000]}

Rubric:
- INFRINGEMENT_CONFIRMED if substantial similarity OR unlicensed commercial use
- NOT_INFRINGEMENT if clearly different or fair_use_likely
- INCONCLUSIVE if insufficient data

Respond ONLY with JSON:
{{
  "decision": "INFRINGEMENT_CONFIRMED",
  "infringement_types": ["verbatim_copy"],
  "similarity_score": 0.87,
  "fair_use_likely": false,
  "confidence_percent": 84,
  "evidence_summary": "specific quotes or structural matches",
  "recommended_action": "PAY_BOUNTY"
}}

decision must be one of: INFRINGEMENT_CONFIRMED, NOT_INFRINGEMENT, INCONCLUSIVE
confidence_percent: integer 0-100
similarity_score: float 0.0-1.0
"""
            result = gl.nondet.exec_prompt(task, response_format="json")
            return _stable_json(_parse_llm_json(result))

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, glvm.Return):
                return False
            own = json.loads(leader_fn())
            if not isinstance(leader_result.calldata, str):
                return False
            leader = json.loads(leader_result.calldata)
            return leader.get("decision") == own.get("decision") and abs(
                float(leader.get("similarity_score", 0))
                - float(own.get("similarity_score", 0))
            ) <= 0.15

        raw = glvm.run_nondet_unsafe(leader_fn, validator_fn)
        return json.loads(raw)

    def _append_report_index(self, work_id: str, report_id: str) -> None:
        existing = json.loads(self.work_reports_index.get(work_id) or "[]")
        existing.append(report_id)
        self.work_reports_index[work_id] = json.dumps(existing)

    def _transfer_to(self, recipient: str, amount: u256) -> None:
        if amount == u256(0):
            return
        _Recipient(Address(recipient)).emit_transfer(value=amount, on="finalized")

    @gl.public.write
    def register_work(
        self,
        title: str,
        work_type: str,
        canonical_urls_json: str,
        license_terms: str,
        min_confidence_percent: u256 = u256(0),
    ) -> str:
        if not title.strip():
            raise gl.vm.UserError("title is required")
        urls = json.loads(canonical_urls_json)
        if not urls:
            raise gl.vm.UserError("at least one canonical URL required")

        canonical_blob = ""
        for url in urls:

            def fetch_one(u=url):
                return gl.nondet.web.render(u, mode="text")

            canonical_blob += f"\n--- {url} ---\n" + gl.eq_principle.strict_eq(fetch_one)

        verdict = self._ai_register_fingerprint(
            title, work_type, canonical_blob, license_terms
        )
        if not verdict.get("valid"):
            raise gl.vm.UserError(
                verdict.get("reject_reason") or "registration rejected by AI"
            )

        min_conf = int(min_confidence_percent)
        if min_conf <= 0:
            min_conf = int(self.default_min_confidence)

        work_id = self._next_work_id()
        self.works[work_id] = Work(
            id=work_id,
            rights_holder=str(gl.message.sender_address),
            title=title,
            work_type=work_type,
            canonical_urls_json=canonical_urls_json,
            license_terms=license_terms,
            fingerprint_summary=str(verdict.get("fingerprint_summary", "")),
            bounty_pool=u256(0),
            min_confidence_percent=u256(min_conf),
            status="ACTIVE",
            created_at=str(int(self.work_counter)),
        )
        self.work_reports_index[work_id] = "[]"
        return work_id

    @gl.public.write.payable
    def fund_bounty(self, work_id: str) -> None:
        if work_id not in self.works:
            raise gl.vm.UserError("work not found")
        work = self.works[work_id]
        if str(gl.message.sender_address) != work.rights_holder:
            raise gl.vm.UserError("only rights holder can fund bounty")
        v = gl.message.value
        if v == u256(0):
            raise gl.vm.UserError("send GEN to fund bounty pool")
        work.bounty_pool = work.bounty_pool + v

    @gl.public.write
    def report_infringement(self, work_id: str, suspect_url: str) -> str:
        if work_id not in self.works:
            raise gl.vm.UserError("work not found")
        work = self.works[work_id]
        if work.status != "ACTIVE":
            raise gl.vm.UserError("work is not active")

        dedupe = self._dedupe_key(work_id, suspect_url)
        if dedupe in self.url_dedupe:
            raise gl.vm.UserError("this URL was already reported for this work")

        if work.bounty_pool == u256(0):
            raise gl.vm.UserError("bounty pool is empty — fund bounty first")

        def fetch_suspect():
            return gl.nondet.web.render(suspect_url, mode="text")

        suspect_blob = gl.eq_principle.strict_eq(fetch_suspect)

        canonical_blob = ""
        for url in json.loads(work.canonical_urls_json):

            def fetch_canonical(u=url):
                return gl.nondet.web.render(u, mode="text")

            canonical_blob += gl.eq_principle.strict_eq(fetch_canonical) + "\n"

        verdict = self._ai_infringement_jury(
            work.fingerprint_summary,
            work.license_terms,
            _truncate(canonical_blob),
            suspect_url,
            _truncate(suspect_blob),
            int(work.min_confidence_percent),
        )

        report_id = self._next_report_id()
        decision = str(verdict.get("decision", "INCONCLUSIVE"))
        confidence = int(verdict.get("confidence_percent", 0))
        similarity = int(float(verdict.get("similarity_score", 0)) * 100)

        status = "INCONCLUSIVE"
        if decision == "INFRINGEMENT_CONFIRMED" and confidence >= int(
            work.min_confidence_percent
        ):
            status = "CONFIRMED"
        elif decision == "NOT_INFRINGEMENT":
            status = "REJECTED"

        report = Report(
            id=report_id,
            work_id=work_id,
            suspect_url=suspect_url,
            reporter=str(gl.message.sender_address),
            status=status,
            decision=decision,
            similarity_score=u256(similarity),
            confidence_percent=u256(confidence),
            evidence_summary=str(verdict.get("evidence_summary", ""))[:2000],
            resolved_at=str(int(self.report_counter)),
        )
        self.reports[report_id] = report
        self.url_dedupe[dedupe] = report_id
        self._append_report_index(work_id, report_id)

        if status == "CONFIRMED":
            payout = (work.bounty_pool * self.bounty_reward_percent) // u256(100)
            if payout > u256(0) and payout <= work.bounty_pool:
                work.bounty_pool = work.bounty_pool - payout
                self._transfer_to(report.reporter, payout)

        return report_id

    @gl.public.view
    def get_work(self, work_id: str) -> dict:
        if work_id not in self.works:
            raise gl.vm.UserError("work not found")
        w = self.works[work_id]
        return {
            "id": w.id,
            "rights_holder": w.rights_holder,
            "title": w.title,
            "work_type": w.work_type,
            "canonical_urls_json": w.canonical_urls_json,
            "license_terms": w.license_terms,
            "fingerprint_summary": w.fingerprint_summary,
            "bounty_pool": int(w.bounty_pool),
            "min_confidence_percent": int(w.min_confidence_percent),
            "status": w.status,
        }

    @gl.public.view
    def get_report(self, report_id: str) -> dict:
        if report_id not in self.reports:
            raise gl.vm.UserError("report not found")
        r = self.reports[report_id]
        return {
            "id": r.id,
            "work_id": r.work_id,
            "suspect_url": r.suspect_url,
            "reporter": r.reporter,
            "status": r.status,
            "decision": r.decision,
            "similarity_score": int(r.similarity_score),
            "confidence_percent": int(r.confidence_percent),
            "evidence_summary": r.evidence_summary,
        }

    @gl.public.view
    def get_work_report_ids(self, work_id: str) -> list:
        return json.loads(self.work_reports_index.get(work_id) or "[]")

    @gl.public.view
    def list_work_ids(self) -> list:
        return list(self.works.keys())

    @gl.public.view
    def get_config(self) -> dict:
        return {
            "default_min_confidence": int(self.default_min_confidence),
            "bounty_reward_percent": int(self.bounty_reward_percent),
            "work_count": int(self.work_counter),
            "report_count": int(self.report_counter),
        }

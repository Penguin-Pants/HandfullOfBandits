# Data Dictionary

All files are UTF-8 CSV. IDs follow the Claude input scheme. Merged rows carry Sol IDs in `sol_ids` and the Sol status in `sol_verification_status`. The full ID map is [../audit/id-crosswalk.csv](../audit/id-crosswalk.csv).

## Confidence scale

| Value | Meaning |
|---|---|
| High | Official or court document, or two independent good sources |
| Moderate | One good source |
| Low | Weak, tertiary or single partisan source |
| Unverified | No source passage seen |

## Files

### historical-events.csv

Prefix `E-`. Rows: 310. Historical events, background rows and period observations. `record_type` separates them. `checked_core` = yes when the Sol audit inspected the date and central fact. `orig_ids` NEW: marks final-consolidation research; SOL: marks Sol-only rows.

Columns: `event_id`, `date`, `date_precision`, `location_ids`, `event_name`, `description`, `actor_ids`, `org_ids`, `participants`, `context`, `immediate_causes`, `consequences`, `strategic_significance`, `source_ids`, `confidence`, `contested_claim_ids`, `game_relevance`, `provenance`, `orig_ids`, `notes`, `sol_ids`, `sol_verification_status`, `record_type`, `checked_core`.

### actors.csv

Prefix `A-`. Rows: 55. Individuals. Some IDs are vacant (A-002 to A-009, A-019); nothing cites them.

Columns: `actor_id`, `name`, `type`, `dates_active`, `org_ids`, `role`, `source_ids`, `confidence`, `orig_ids`, `notes`, `sol_ids`, `sol_verification_status`.

### organizations.csv

Prefix `O-`. Rows: 73. Organizations, institutions and states. O-085 is TSK (Kurdistan); O-091 is the Turkish Armed Forces.

Columns: `org_id`, `name`, `acronym`, `type`, `founded`, `dissolved`, `parent_or_successor`, `source_ids`, `orig_ids`, `notes`, `sol_ids`, `sol_verification_status`.

### relationships.csv

Prefix `R-`. Rows: 51. Relations between organizations. R-052 and R-053 were merged into R-037 and R-036.

Columns: `relationship_id`, `org_a`, `org_b`, `type`, `start`, `end`, `description`, `source_ids`, `confidence`, `orig_ids`, `sol_ids`, `sol_verification_status`.

### locations.csv

Prefix `L-`. Rows: 121. Places with Turkish and Kurdish names where sourced.

Columns: `location_id`, `name_tr`, `name_ku`, `type`, `province_1990s`, `country`, `lat`, `lon`, `notes`, `source_ids`, `orig_ids`, `sol_ids`, `sol_verification_status`.

### political-developments.csv

Prefix `P-`. Rows: 67. Laws, decrees, closures, elections and similar developments.

Columns: `dev_id`, `date`, `type`, `description`, `org_ids`, `event_ids`, `source_ids`, `confidence`, `sol_ids`, `sol_verification_status`.

### action-matrix.csv

Prefix `X-`. Rows: 27. Strategic actions available to actors, with costs and effects.

Columns: `action_id`, `action`, `eligible_actors`, `period`, `prerequisites`, `costs`, `intended_effects`, `observed_effects`, `civilian_consequences`, `opponent_responses`, `long_term`, `source_ids`, `confidence`, `orig_ids`, `sol_ids`, `sol_verification_status`.

### quantitative-claims.csv

Prefix `Q-`. Rows: 463. Numbers with source, method and confidence. `fit_for_game_scale` is yes, range only or no. No figure sets a game threshold (M-028).

Columns: `claim_id`, `measure`, `value`, `unit`, `period`, `geography`, `source_ids`, `method_note`, `confidence`, `fit_for_game_scale`, `orig_ids`, `sol_ids`, `sol_verification_status`.

### findings.csv

Prefix `F-`. Rows: 61. Historical findings and interpretations. `sol_ids`, `consolidation_relation` and `consolidation_note` record the comparison with Sol.

Columns: `finding_id`, `statement`, `kind`, `chapter`, `event_ids`, `source_ids`, `confidence`, `notes`, `sol_ids`, `consolidation_relation`, `consolidation_note`.

### event-card-candidates.csv

Prefix `K-`. Rows: 157. All card candidates. `scenarios` holds the Campaign tag C1 to C5. `deck_eligibility` applies DD-13.

Columns: `card_id`, `title`, `date`, `event_ids`, `historical_basis_note`, `actors`, `unshaded_hint`, `shaded_hint`, `proposed_effect_hypothesis`, `tracks_spaces`, `scenarios`, `uncertainty`, `source_ids`, `orig_ids`, `status`, `symbols`, `unshaded_owner`, `shaded_owner`, `always_effect`, `content_tier`, `event_confidence`, `dispute_flag`, `evidence_flag`, `sol_ids`, `sol_verification_status`, `deck_eligibility`, `historical_support_status`.

### prototype-deck.csv

Prefix `DK-`. Rows: 99. The prototype deck: Event, Pivotal, Propaganda, Capability and Momentum cards with draft text for both sides. Every effect is an untested hypothesis.

Columns: `deck_id`, `card_id`, `campaign`, `title`, `date`, `event_ids`, `source_ids`, `card_type`, `faction_order`, `unshaded`, `shaded`, `unshaded_owner`, `shaded_owner`, `duration`, `content_tier`, `dispute_flag`, `event_confidence`, `deck_eligible`, `design_note`.

### mechanic-evidence-links.csv

Prefix `M-`. Rows: 46. Final mechanic register. `status` is Hypothesis, Design rule, Optional module or Rejected. `input_ids` maps Claude and Sol mechanics.

Columns: `mechanic_id`, `proposed_mechanic`, `historical_problem`, `finding_ids`, `event_ids`, `source_ids`, `claude_proposal`, `sol_proposal`, `final_recommendation`, `rules_location`, `expected_effect`, `simplification`, `uncertainties`, `testing_requirements`, `status`, `input_ids`.

### faction-comparison.csv

Prefix `MOD-`. Rows: 7. Faction architecture scores from the Claude input, with the Sol assessment and the final decision.

Columns: `model_id`, `factions`, `fidelity`, `agency`, `objectives`, `decisions`, `interaction`, `asymmetry`, `balance`, `replay`, `complexity`, `ethics`, `flexibility`, `weighted_total_of_5`, `rank_base`, `rank_history_heavy`, `rank_playability_heavy`, `rank_ethics_heavy`, `rank_equal`, `uncertainty_and_notes`, `sol_assessment`, `final_decision`.

### ../sources/source-registry.csv

Prefix `S-`. Rows: 527. `verification_status` is the stronger of the two input statuses; `verification_basis` names who inspected the content (claude, sol, claude+sol or final). See [../audit/source-verification.md](../audit/source-verification.md).

Columns: `source_id`, `short_title`, `author_or_org`, `pub_date`, `source_type`, `language`, `url`, `reliability`, `bias_or_limits`, `verification_status`, `access_detail`, `provenance`, `orig_ids`, `independence_group`, `claims_supported`, `notes`, `sol_ids`, `sol_verification_status`, `checked_content`, `source_family`, `verification_basis`.

Validate with `python -I tools/validate.py` from the package root.

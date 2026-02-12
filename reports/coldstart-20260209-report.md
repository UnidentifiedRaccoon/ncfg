# Cold Start Measurement Report

Date (UTC): 2026-02-09
Workspace: /Users/yura-posledov/cursor/ncfg
Script: scripts/measure-serverless-coldstart.sh
Raw CSV: reports/coldstart-20260209.csv

## Test Setup

Targets:
- web: https://bban3i4dgt9p00m87f90.containers.yandexcloud.net/api/health
- cms: https://bbaousfesom46c65itc1.containers.yandexcloud.net/_health

Plan:
- warm baseline: 5 requests, 1s interval
- idle windows: 30s, 90s, 180s
- after each idle: first request + immediate follow-up

Environment observation:
- web active revision has `provision_policy.min_instances=1`
- cms active revision has `provision_policy.min_instances=1`

## Raw Outcome

All probes succeeded:
- web: 11/11 responses with HTTP 200
- cms: 11/11 responses with HTTP 204

## Latency Summary (time_total)

web warm baseline (s): 0.027428, 0.069471, 0.077868, 0.078763, 0.179556
- median: 0.077868s

web after idle first-hit:
- 30s: 0.120567s
- 90s: 0.078539s
- 180s: 0.097586s

web after idle follow-up:
- 30s: 0.066844s
- 90s: 0.068658s
- 180s: 0.035864s

cms warm baseline (s): 0.046740, 0.099205, 0.103915, 0.108562, 0.117875
- median: 0.103915s

cms after idle first-hit:
- 30s: 0.075066s
- 90s: 0.071441s
- 180s: 0.103779s

cms after idle follow-up:
- 30s: 0.082235s
- 90s: 0.080925s
- 180s: 0.088757s

## Conclusion

Within 30/90/180s idle windows, no cold-start spike was observed (no 1s+ responses, no errors).
This is expected with `min_instances=1`: a warm instance is kept ready, so first-hit latency remains close to warm baseline.

## How to Measure Real Cold Start

To observe actual cold start values, rerun the same script after setting `min_instances=0` for target revision(s), and include longer idle windows (for example: 300s, 600s, 900s).

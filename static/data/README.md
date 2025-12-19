# Leaderboard Data Conversion

This directory contains scripts to convert aggregated model scores to the leaderboard JSON format used by the website.

## Files

- `convert_scores_to_leaderboard.py` - Main conversion script
- `update_all_leaderboards.sh` - Convenience script to update all three difficulty levels at once
- `scores_easy/`, `scores_medium/`, `scores_hard/` - Input score data directories
- `leaderboard_data_abb_*.json` - Output leaderboard JSON files

## Usage

### Convert a single difficulty level

```bash
python convert_scores_to_leaderboard.py scores_easy leaderboard_data_abb_easy.json
```

### Update all leaderboards

```bash
bash update_all_leaderboards.sh
```

## Input Format

The script reads from `agg_scores_thinking.json` and `agg_scores_nonthinking.json` files in the scores directory. These files contain model metrics in the format:

```json
{
  "model='gpt-4o' pass@1": 0.397,
  "model='gpt-4o' sec_pass@1": 0.092,
  "model='gpt-4o' insec": 76.65
}
```

## Output Format

The script outputs a JSON array of model entries sorted by `sec_pass_1` (descending):

```json
[
  {
    "model": "GPT-4o",
    "pass_1": 0.397,
    "sec_pass_1": 0.092,
    "insec_pass": 76.65
  }
]
```

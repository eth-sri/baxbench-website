#!/bin/bash
# Update all AutoBaxBench leaderboard JSON files

echo "Updating all AutoBaxBench leaderboards..."

python convert_scores_to_leaderboard.py scores_easy leaderboard_data_abb_easy.json
python convert_scores_to_leaderboard.py scores_medium leaderboard_data_abb_medium.json
python convert_scores_to_leaderboard.py scores_hard leaderboard_data_abb_hard.json

echo "All leaderboards updated successfully!"

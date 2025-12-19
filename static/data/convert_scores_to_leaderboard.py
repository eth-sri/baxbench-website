#!/usr/bin/env python3
"""
Convert aggregated scores to leaderboard JSON format.

Usage:
    python convert_scores_to_leaderboard.py scores_easy leaderboard_data_abb_easy.json
    python convert_scores_to_leaderboard.py scores_medium leaderboard_data_abb_medium.json
    python convert_scores_to_leaderboard.py scores_hard leaderboard_data_abb_hard.json
"""

import json
import sys
from pathlib import Path
from typing import Dict, List


def parse_model_name(key: str) -> str:
    """Extract model name from key like "model='gpt-4o' pass@1"."""
    if "model='" in key:
        start = key.index("model='") + len("model='")
        end = key.index("'", start)
        return key[start:end]
    return ""


def convert_scores_to_leaderboard(scores_dir: str, output_file: str) -> None:
    """
    Convert aggregated scores from thinking and non-thinking files to leaderboard format.
    
    Args:
        scores_dir: Directory containing agg_scores_thinking.json and agg_scores_nonthinking.json
        output_file: Output JSON file path
    """
    scores_path = Path(scores_dir)
    
    # Read both thinking and non-thinking scores
    thinking_file = scores_path / "agg_scores_thinking.json"
    nonthinking_file = scores_path / "agg_scores_nonthinking.json"
    
    all_data = {}
    
    # Load thinking scores if exists
    if thinking_file.exists():
        with open(thinking_file, 'r') as f:
            thinking_scores = json.load(f)
            all_data.update(thinking_scores)
    
    # Load non-thinking scores if exists
    if nonthinking_file.exists():
        with open(nonthinking_file, 'r') as f:
            nonthinking_scores = json.load(f)
            all_data.update(nonthinking_scores)
    
    # Parse the data and group by model
    models: Dict[str, dict] = {}
    
    for key, value in all_data.items():
        model_name = parse_model_name(key)
        if not model_name:
            continue
        
        if model_name not in models:
            models[model_name] = {}
        
        # Extract metric type
        if "pass@1" in key and "sec_pass@1" not in key:
            models[model_name]["pass_1"] = value
        elif "sec_pass@1" in key:
            models[model_name]["sec_pass_1"] = value
        elif "insec" in key:
            models[model_name]["insec_pass"] = value
    
    # Convert to leaderboard format (list of dicts with model field)
    leaderboard_data: List[dict] = []
    
    for model_name, metrics in models.items():
        entry = {
            "model": format_model_name(model_name),
            "pass_1": metrics.get("pass_1", 0.0),
            "sec_pass_1": metrics.get("sec_pass_1", 0.0)
        }
        # Only include insec_pass if it exists
        if "insec_pass" in metrics:
            entry["insec_pass"] = metrics["insec_pass"]
        
        leaderboard_data.append(entry)
    
    # Sort by sec_pass_1 in descending order (best models first)
    leaderboard_data.sort(key=lambda x: x["sec_pass_1"], reverse=True)
    
    # Write to output file
    output_path = Path(output_file)
    with open(output_path, 'w') as f:
        json.dump(leaderboard_data, f, indent=2)
    
    print(f"Converted {len(leaderboard_data)} models from {scores_dir} to {output_file}")


def format_model_name(model_name: str) -> str:
    """
    Format model name for display in leaderboard.
    
    Models used during AutoBaxBuilder pipeline are marked with a star (*).
    
    Examples:
        'gpt-4o' -> 'GPT-4o'
        'claude-3-7-sonnet-20250219' -> 'Claude 3.7 Sonnet'
        'google-gemini-2.5-pro-preview-03-25' -> 'Gemini 2.5 Pro'
        'gpt-5-2025-08-07' -> 'GPT-5*' (used in pipeline)
    """
    # Common model name mappings
    formatted_name = None
    
    if 'gpt-4o' in model_name.lower():
        formatted_name = 'GPT-4o'
    elif 'gpt-5' in model_name.lower():
        formatted_name = 'GPT-5*'  # Used in AutoBaxBuilder pipeline
    elif 'claude-sonnet-4-5' in model_name.lower():
        formatted_name = 'Claude Sonnet 4.5'
    elif 'claude-sonnet-4-20250514' in model_name.lower():
        formatted_name = 'Claude Sonnet 4*'  # Used in AutoBaxBuilder pipeline
    elif 'claude-3-7-sonnet' in model_name.lower():
        formatted_name = 'Claude 3.7 Sonnet'
    elif 'gemini-2.5-pro' in model_name.lower():
        formatted_name = 'Gemini 2.5 Pro'
    elif 'codestral' in model_name.lower():
        formatted_name = 'Codestral 2501'
    elif 'qwen2.5-72b' in model_name.lower():
        formatted_name = 'Qwen 2.5 72B'
    elif 'qwen2.5-7b' in model_name.lower():
        formatted_name = 'Qwen 2.5 7B'
    elif 'qwen3-coder-480b' in model_name.lower() or 'qwen/qwen3-coder' in model_name.lower():
        formatted_name = 'Qwen3 Coder*'  # Used in AutoBaxBuilder pipeline
    elif 'deepseek-r1' in model_name.lower() or 'deepseek-ai/deepseek-r1' in model_name.lower():
        formatted_name = 'DeepSeek R1*'  # Used in AutoBaxBuilder pipeline
    elif 'grok-4' in model_name.lower():
        formatted_name = 'Grok 4'
    else:
        # Fallback: capitalize first letter
        formatted_name = model_name.replace('-', ' ').title()
    
    return formatted_name


def main():
    if len(sys.argv) != 3:
        print("Usage: python convert_scores_to_leaderboard.py <scores_dir> <output_file>")
        print("\nExamples:")
        print("  python convert_scores_to_leaderboard.py scores_easy leaderboard_data_abb_easy.json")
        print("  python convert_scores_to_leaderboard.py scores_medium leaderboard_data_abb_medium.json")
        print("  python convert_scores_to_leaderboard.py scores_hard leaderboard_data_abb_hard.json")
        sys.exit(1)
    
    scores_dir = sys.argv[1]
    output_file = sys.argv[2]
    
    convert_scores_to_leaderboard(scores_dir, output_file)


if __name__ == "__main__":
    main()

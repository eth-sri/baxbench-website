import json
import argparse
from pathlib import Path


EASY_PATH = Path("leaderboard_data_abb_easy.json")
MEDIUM_PATH = Path("leaderboard_data_abb_medium.json")
HARD_PATH = Path("leaderboard_data_abb_hard.json")



def main(args):
    path = args.path
    difficulty = args.difficulty

    with open(path, "r") as f:
        source_data = json.load(f)


    path = {
        "easy": EASY_PATH,
        "medium": MEDIUM_PATH,
        "hard": HARD_PATH
    }    

    with open(path[difficulty], "r") as f:
        data = json.load(f)
    data += source_data
    with open(path[difficulty], "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path",
        type=str,
    )
    parser.add_argument(
        "--difficulty",
        type=str,
        choices=["easy", "medium", "hard"]
    )
    args = parser.parse_args()
    main(args)


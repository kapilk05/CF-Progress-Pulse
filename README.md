# Codeforces College Tracker

This Python script tracks and analyzes the performance of college students in Codeforces contests. It specifically focuses on identifying students from a particular college who have achieved rating changes or color upgrades.

## Features

- Fetches contest standings from Codeforces API
- Filters users based on their college/organization
- Identifies users who have changed their rating tier (color)
- Highlights first-time participants and those who have upgraded their color

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Python 3.7+
- `requests` library

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/codeforces-college-tracker.git
   ```

2. Navigate to the project directory:
   ```
   cd codeforces-college-tracker
   ```

3. Install the required Python packages:
   ```
   pip install requests
   ```

## Usage

1. Run the script:
   ```
   python codeforces_college_tracker.py
   ```

2. When prompted, enter the Codeforces contest ID you want to analyze.

3. The script will output:
   - Users from your college who participated in the contest
   - Users who achieved a rating change
   - First-time participants
   - Users who upgraded their color tier

## Configuration

To track a different college or organization, modify the following line in the script:

```python
usersFromOrg = getUsersFromOrg(checkOrgList, "Dwarkadas J. Sanghvi College of Engineering")
```

Replace "Dwarkadas J. Sanghvi College of Engineering" with your desired organization name.

## Contributing

Contributions to this project are welcome. Please feel free to fork the repository and submit pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

If you have any questions or feedback, please contact Kapil Kashyap at kapilkashyap3105@example.com.

## Acknowledgements

- [Codeforces](https://codeforces.com) for providing the API and hosting the contests
- All contributors who have helped to improve this project

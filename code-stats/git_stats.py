from collections import defaultdict
from git import Repo
import re
import matplotlib.pyplot as plt
import matplotlib.dates as md
import datetime as dt

repo = Repo("../")

commits = list(repo.iter_commits('main'))[::-1]
log = repo.git.log('--numstat').split("\n")

def fetch_file_changes(filter):
    current_time = None
    date_added = defaultdict(int)
    date_removed = defaultdict(int)

    commits_seen = {

    }

    for i in (log):
        commit = re.match("commit (\w+)", i)
        if commit is not None:
            commit_id = commit.group(1)
            if commit_id in commits_seen:
                raise Exception("Something is wrong")
            current_time = (repo.commit(commit_id).committed_date)
            commits_seen[commit_id] = True

            stats = repo.commit(commit_id).stats
            #print(current_time, stats.files)
            for file, stat in stats.files.items():
                if filter(file):
                    date_added[current_time] += stat['insertions']
                    date_removed[current_time] += stat['deletions']

    return (date_added, date_removed)

def sort_key_value_plot(key_value):
    timestamp_diffs = list(map(lambda x: list(x), sorted(key_value.items(), key=lambda x: x[0])))
    for i in range(1, len(timestamp_diffs)):
        timestamp_diffs[i][1] += timestamp_diffs[i - 1][1]

    dates=[dt.datetime.fromtimestamp(ts) for (ts, _value) in timestamp_diffs]
    values=[value for (_ts, value) in timestamp_diffs]

    return (dates, values)

def changes_over_time_data_extractor(filter):
    changes_over_time = defaultdict(int)
    added, removed = fetch_file_changes(filter)

    for i in added:
        changes_over_time[i] += added[i]

    for i in removed:
        changes_over_time[i] -= removed[i]

    dates, values = sort_key_value_plot(changes_over_time)
    return (dates, values)

def get_diff_over_time(file_name, data_extractor, legends=None, title=None, save=True):
    dates, values = data_extractor#()

    plt.subplots_adjust(bottom=0.2)
    plt.xticks( rotation=25 )

    ax = plt.gca()
    date_format = md.DateFormatter('%Y-%m-%d')
    ax.xaxis.set_major_formatter(date_format)

    plt.ylabel('Total lines of code')
    plt.plot(dates,values, label=legends)
    plt.title(title)
    plt.legend(loc="upper left")
    if save:
        plt.savefig(file_name)

def changes_over_time(type):
    changes_over_time = defaultdict(int)
    added, removed = fetch_file_changes(lambda x: '.ts' in x)

    if type == "added":
        for i in added:
            changes_over_time[i] += added[i]
    elif type == "removed":
        for i in removed:
            changes_over_time[i] -= removed[i]
    else:
        raise Exception("unknown")
        
    dates, values = sort_key_value_plot(changes_over_time)
    return (dates, values)


if __name__ == '__main__':
    get_diff_over_time('diff_over_time.png', changes_over_time_data_extractor(filter=lambda x: ".unit.test.ts" in x), legends="Tests", save=False)
    get_diff_over_time('diff_over_time.png', changes_over_time_data_extractor(filter=lambda x: '.ts' in x and not ".unit.test.ts" in x), legends="Logic", title="Project size (lines of code) over time", save=True)

    plt.clf()

    get_diff_over_time('added_removed_over_time.png', changes_over_time('added'), legends="Lines added (accumulated)", save=False)
    get_diff_over_time('added_removed_over_time.png', changes_over_time('removed'), legends="Lines removed (accumulated)", title="Accumulated lines added / removed over time", save=True)

import { writeFileSync } from 'fs';
import path from 'path';

class IssueReporter {
  private issueCounts: { [key: string]: number } = {};

  reportIssue(issue: string) {
    if (!this.issueCounts[issue]) {
      this.issueCounts[issue] = 1;
    } else {
      this.issueCounts[issue]++;
    }
  }

  dumpIssueStatistics(workingDir: string) {
    const sortedKeys: string[] = Object.keys(this.issueCounts).sort((a, b) => this.issueCounts[b] - this.issueCounts[a]);
    const sortedObj: { [key: string]: number } = {};
    for (const key of sortedKeys) {
      sortedObj[key] = this.issueCounts[key];
    }
    writeFileSync(path.join(workingDir, 'issues.json'), JSON.stringify(sortedObj, null, 2));
  }
}

export const issueReporter = new IssueReporter();

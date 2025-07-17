import { Octokit } from '@octokit/rest';

class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Optional: for higher rate limits
    });
  }

  // Extract owner and repo from GitHub URL
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, '') // Remove .git suffix if present
    };
  }

  // Get repository information
  async getRepoInfo(githubUrl: string) {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub URL');
      }

      const { data: repo } = await this.octokit.rest.repos.get({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      const { data: contributors } = await this.octokit.rest.repos.listContributors({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      return {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
        lastUpdated: new Date(repo.updated_at),
        contributors: contributors.length,
        description: repo.description,
        topics: repo.topics || [],
        defaultBranch: repo.default_branch,
        size: repo.size,
        openIssues: repo.open_issues_count,
        license: repo.license?.name,
        homepage: repo.homepage,
      };
    } catch (error) {
      console.error('Error fetching GitHub repo info:', error);
      throw error;
    }
  }

  // Get repository README
  async getRepoReadme(githubUrl: string) {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub URL');
      }

      const { data } = await this.octokit.rest.repos.getReadme({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      // Decode base64 content
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      return {
        content,
        downloadUrl: data.download_url,
        htmlUrl: data.html_url,
      };
    } catch (error) {
      console.error('Error fetching README:', error);
      return null;
    }
  }

  // Get repository contributors
  async getRepoContributors(githubUrl: string) {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub URL');
      }

      const { data } = await this.octokit.rest.repos.listContributors({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      return data.map(contributor => ({
        id: contributor.id,
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
        contributions: contributor.contributions,
        type: contributor.type,
      }));
    } catch (error) {
      console.error('Error fetching contributors:', error);
      return [];
    }
  }

  // Get repository languages
  async getRepoLanguages(githubUrl: string) {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        throw new Error('Invalid GitHub URL');
      }

      const { data } = await this.octokit.rest.repos.listLanguages({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      return data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return {};
    }
  }

  // Validate if GitHub URL is accessible
  async validateGitHubUrl(githubUrl: string): Promise<boolean> {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) return false;

      await this.octokit.rest.repos.get({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new GitHubService();

import { supabase } from '../lib/supabase';

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  public_repos: number;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubUser | null> {
  try {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers: HeadersInit = token ? { Authorization: `token ${token}` } : {};

    const response = await fetch(`https://api.github.com/users/${username}`, { headers });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    return null;
  }
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers: HeadersInit = token ? { Authorization: `token ${token}` } : {};

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers }
    );

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

export async function fetchGitHubLanguages(username: string, repoName: string): Promise<string[]> {
  try {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers: HeadersInit = token ? { Authorization: `token ${token}` } : {};

    const response = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/languages`,
      { headers }
    );

    if (!response.ok) return [];

    const languages = await response.json();
    return Object.keys(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
}

export async function syncGitHubData(userId: string, username: string) {
  try {
    const repos = await fetchGitHubRepos(username);

    const skillsMap = new Map<string, { count: number; projects: string[] }>();

    for (const repo of repos) {
      await supabase.from('projects').upsert({
        user_id: userId,
        name: repo.name,
        description: repo.description,
        github_url: repo.html_url,
        languages: repo.language ? [repo.language] : [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics || [],
        last_updated: repo.updated_at,
      });

      const languages = await fetchGitHubLanguages(username, repo.name);
      languages.forEach(lang => {
        if (!skillsMap.has(lang)) {
          skillsMap.set(lang, { count: 0, projects: [] });
        }
        const skill = skillsMap.get(lang)!;
        skill.count++;
        skill.projects.push(repo.name);
      });

      repo.topics?.forEach(topic => {
        if (!skillsMap.has(topic)) {
          skillsMap.set(topic, { count: 0, projects: [] });
        }
        const skill = skillsMap.get(topic)!;
        skill.count++;
        skill.projects.push(repo.name);
      });
    }

    for (const [skillName, data] of skillsMap) {
      const proficiency = Math.min(5, Math.ceil(data.count / 2));

      await supabase.from('skills').upsert({
        user_id: userId,
        name: skillName,
        category: isLanguage(skillName) ? 'programming' : 'framework',
        proficiency_level: proficiency,
        source: 'github',
        evidence: data.projects,
      });
    }

    return { success: true, reposCount: repos.length, skillsCount: skillsMap.size };
  } catch (error) {
    console.error('Error syncing GitHub data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function isLanguage(name: string): boolean {
  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go',
    'Rust', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'HTML', 'CSS'
  ];
  return languages.includes(name);
}

"use client";

import { useState } from "react";

export default function Dashboard() {
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [githubData, setGithubData] = useState<any>(null);
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSkills, setShowSkills] = useState(false);  // Add this line

  const fetchGithubData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/github/${githubUsername}`);
      const data = await res.json();
      setGithubData(data);
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
    }
  };

  const fetchLeetcodeData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/leetcode/${leetcodeUsername}`);
      const data = await res.json();
      setLeetcodeData(data);
    } catch (error) {
      console.error("Error fetching LeetCode data:", error);
    }
  };

  const fetchAiSummary = async () => {
    if (!githubUsername || !leetcodeUsername) {
      alert("Please enter both GitHub and LeetCode usernames.");
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/ai_summary/${githubUsername}/${leetcodeUsername}`
      );
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setAiSummary("Error generating summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 space-y-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-white">Profile Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Quick view of your GitHub and LeetCode profiles in a sleek dark theme.
        </p>
      </header>

      <div className="grid gap-10">
        {/* GitHub Dashboard Card */}
        <div className="max-w-md mx-auto border border-gray-700 bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center space-x-3">
            {githubData && githubData.profile ? (
              <>
                <img
                  src={githubData.profile.avatar_url}
                  alt="GitHub Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-bold text-lg text-white">
                    {githubData.profile.name || githubData.profile.login}
                  </div>
                  <span className="text-xs text-gray-400">GitHub</span>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="border border-gray-700 rounded p-2 flex-1 bg-gray-700 text-white"
                />
                <button
                  onClick={fetchGithubData}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Load
                </button>
              </>
            )}
          </div>

          {githubData && githubData.profile && (
            <>
              <div className="mt-4 space-y-2 text-white font-bold text-sm">
                <div>Followers: {githubData.profile.followers}</div>
                <div>Repos: {githubData.profile.public_repos}</div>
                {githubData.profile.company && <div>Company: {githubData.profile.company}</div>}
                {githubData.profile.location && <div>Location: {githubData.profile.location}</div>}
                {githubData.profile.blog && (
                  <div>
                    Blog:{" "}
                    <a
                      href={githubData.profile.blog}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-white"
                    >
                      {githubData.profile.blog}
                    </a>
                  </div>
                )}
                {githubData.profile.bio && <div>Bio: {githubData.profile.bio}</div>}
                {githubData.profile.twitter_username && (
                  <div>Twitter: @{githubData.profile.twitter_username}</div>
                )}
                <div>Gists: {githubData.profile.public_gists}</div>
                <div>
                  Created: {new Date(githubData.profile.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 text-white">Repositories</h3>
                <div className="flex flex-wrap gap-2">
                  {githubData.repos.slice(0, 5).map((repo: any) => (
                    <div
                      key={repo.id}
                      className="bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-300"
                    >
                      {repo.name}
                    </div>
                  ))}
                  {githubData.repos.length > 5 && (
                    <div className="bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-300">
                      +{githubData.repos.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* LeetCode Dashboard Card */}
        <div className="max-w-md mx-auto border border-gray-700 bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center space-x-3">
            {leetcodeData && leetcodeData.data && leetcodeData.data.matchedUser ? (
              <>
                <img
                  src={leetcodeData.data.matchedUser.profile.userAvatar}
                  alt="LeetCode Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-bold text-lg text-white">
                    {leetcodeData.data.matchedUser.username}
                  </div>
                  <span className="text-xs text-gray-400">LeetCode</span>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="LeetCode username"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  className="border border-gray-700 rounded p-2 flex-1 bg-gray-700 text-white"
                />
                <button
                  onClick={fetchLeetcodeData}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Load
                </button>
              </>
            )}
          </div>

          {leetcodeData &&
            leetcodeData.data &&
            leetcodeData.data.matchedUser && (
              <>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-white font-bold">
                  <div>Rank: {leetcodeData.data.matchedUser.profile.ranking}</div>
                  <div>Reputation: {leetcodeData.data.matchedUser.profile.reputation}</div>
                  <div>Solutions: {leetcodeData.data.matchedUser.profile.solutionCount}</div>
                  <div>Country: {leetcodeData.data.matchedUser.profile.countryName}</div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2 text-white">Submission Stats</h3>
                  <div className="flex flex-wrap gap-2">
                    {leetcodeData.data.matchedUser.submitStats.acSubmissionNum.map(
                      (entry: any) => (
                        <div
                          key={entry.difficulty}
                          className="bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-300"
                        >
                          {entry.difficulty}: {entry.count}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowSkills(!showSkills)}
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm font-bold"
                  >
                    {showSkills ? "Hide Skills & Topics" : "Show Skills & Topics"}
                  </button>
                  {showSkills && leetcodeData.data.matchedUser.tagProblemCounts && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2 text-white">Skills & Topics</h3>
                      {Object.entries(leetcodeData.data.matchedUser.tagProblemCounts).map(
                        ([level, tags]: [string, any]) => (
                          <div key={level} className="mb-2">
                            <div className="font-bold text-white capitalize">{level}</div>
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag: any) => (
                                <div
                                  key={tag.tagSlug}
                                  className="bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-300 font-bold"
                                >
                                  {tag.tagName}: {tag.problemsSolved}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Separate Summary Section */}
      <div className="max-w-2xl mx-auto p-6 text-center">
        <button
          onClick={fetchAiSummary}
          className="bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-600 transition text-lg font-bold"
        >
          {loadingSummary ? "Generating Summary..." : "Generate AI Summary"}
        </button>
        {aiSummary && (
          <div className="mt-6 p-4 bg-gray-700 rounded text-white text-2xl font-bold">
            {aiSummary}
          </div>
        )}
      </div>
    </div>
  );
}

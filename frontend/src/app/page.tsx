"use client";

import { useState } from "react";

export default function Dashboard() {
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [githubData, setGithubData] = useState<any>(null);
  const [leetcodeData, setLeetcodeData] = useState<any>(null);

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
          {/* Card Header */}
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

          {/* Additional GitHub Info */}
          {githubData && githubData.profile && (
            <div className="mt-4 flex space-x-4 text-white">
              <div><b>Followers:</b> {githubData.profile.followers}</div>
              <div><b>Repos:</b> {githubData.profile.public_repos}</div>
            </div>
          )}

          {/* Repositories */}
          {githubData && githubData.profile && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 text-white"><b>Repositories</b></h3>
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
          )}
        </div>

        {/* LeetCode Dashboard Card */}
        <div className="max-w-md mx-auto border border-gray-700 bg-gray-800 rounded-xl shadow p-6">
          {/* Card Header */}
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

          {/* Additional LeetCode Info */}
          {leetcodeData &&
            leetcodeData.data &&
            leetcodeData.data.matchedUser && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-white">
                <div><b>Rank:</b> {leetcodeData.data.matchedUser.profile.ranking}</div>
                <div><b>Reputation:</b> {leetcodeData.data.matchedUser.profile.reputation}</div>
                <div><b>Solutions:</b> {leetcodeData.data.matchedUser.profile.solutionCount}</div>
                <div><b>Country:</b> {leetcodeData.data.matchedUser.profile.countryName}</div>
              </div>
            )}

          {/* Submission Stats */}
          {leetcodeData &&
            leetcodeData.data &&
            leetcodeData.data.matchedUser && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 text-white"><b>Submission Stats</b></h3>
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
            )}
        </div>
      </div>
    </div>
  );
}

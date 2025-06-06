import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../components/ThemeContext';
import { AuthContext } from '../components/AuthContext'; // Add AuthContext import
import axios from 'axios';
import Switch from '../Switch';
import Navbar from '../components/Navbar';

const Home = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // Get user from AuthContext

  const [contestId, setContestId] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [reminderIndex, setReminderIndex] = useState(null);
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState({});
  const [reminderSuccess, setReminderSuccess] = useState(null);

  // For profile stats
  const [profileStats, setProfileStats] = useState({
    codechef: null,
    codeforces: null,
    leetcode: null,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Fetch contest user stats by contest ID
  const fetchUserStats = async () => {
    if (!/^\d+$/.test(contestId)) {
      setEmailErrors({ input: 'Please enter a valid contest ID (numbers only).' });
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/get_users_by_contest', {
        contest_id: contestId,
      });
      setUserStats(res.data);
      setEmailErrors({});
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Fetch upcoming contests from Codeforces API
  const fetchUpcomingContests = async () => {
    try {
      const res = await axios.get('https://codeforces.com/api/contest.list');
      const filtered = res.data.result
        .filter((contest) => contest.phase === 'BEFORE')
        .slice(0, 5);
      setUpcomingContests(filtered);
    } catch (err) {
      console.error('Error fetching contests:', err);
    }
  };

  // Set reminder for contest
  const handleReminder = async (contest) => {
    if (!email || !email.includes('@')) {
      setEmailErrors({ reminder: 'Enter a valid email.' });
      return;
    }
    try {
      await axios.post('http://localhost:5000/set_reminder', {
        email,
        contestId: contest.id,
        contestName: contest.name,
        startTime: contest.startTimeSeconds,
      });
      setReminderSuccess('Reminder set successfully!');
      setEmail('');
      setReminderIndex(null);
      setEmailErrors({});
      setTimeout(() => setReminderSuccess(null), 3000);
    } catch (err) {
      setEmailErrors({ reminder: 'Failed to set reminder.' });
      setReminderSuccess(null);
    }
  };

  // Fetch profile stats based on user handles from profile
  const fetchProfileStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    setStatsError(null);

    try {
      const { codechefHandle, codeforcesHandle, leetcodeHandle } = user;

      // We'll fetch separately for each platform if handle exists
      const results = {};

      if (codechefHandle) {
        try {
          // Example: Fetch codechef stats (replace with your backend/api)
          // For demo, we simulate API call:
          const res = await axios.get(`https://competitive-coding-api.herokuapp.com/api/codechef/${codechefHandle}`);
          results.codechef = res.data;
        } catch {
          results.codechef = null;
        }
      }

      if (codeforcesHandle) {
        try {
          const res = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
          results.codeforces = res.data.result ? res.data.result[0] : null;
        } catch {
          results.codeforces = null;
        }
      }

      if (leetcodeHandle) {
        try {
          // No official public API, so you may need your own backend or a third-party API
          // Here just simulate success/failure
          // You can replace this with your API call to get LeetCode stats
          const res = await axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcodeHandle}`);
          results.leetcode = res.data;
        } catch {
          results.leetcode = null;
        }
      }

      setProfileStats(results);
    } catch (err) {
      setStatsError('Failed to fetch profile stats.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUpcomingContests();
      fetchProfileStats();
    }
  }, [user]);

  if (!user) {
    // User not logged in → Show About Us
    return (
      <Wrapper>
        <AboutUsContainer isDark={isDark}>
          <h1>Welcome to CF Progress Pulse</h1>
          <p>
            CF Progress Pulse is your go-to platform to track your Codeforces contest progress,
            get upcoming contest reminders, and analyze contest statistics with ease.
          </p>
          <p>
            Please <a href="/login">log in</a> or <a href="/register">register</a> to access personalized features.
          </p>
        </AboutUsContainer>
      </Wrapper>
    );
  }

  // User is logged in → Show main dashboard layout
  return (
    <>
      <Wrapper>
        <MainContent>
          <LeftPane isDark={isDark}>
            <h2>User Stats by Contest</h2>
            <Input
              placeholder="Enter Contest ID"
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              type="number"
            />
            {emailErrors.input && <ErrorText>{emailErrors.input}</ErrorText>}
            <FetchButton onClick={fetchUserStats}>Get Contest Stats</FetchButton>

            {userStats && (
              <StatsList>
                {userStats.map((user, idx) => (
                  <li key={idx}>
                    {user.handle} — Rank: {user.rank} — ΔRating: {user.ratingChange}
                  </li>
                ))}
              </StatsList>
            )}
          </LeftPane>

          {/* New profile stats div below the left pane */}
          <ProfileStatsPane isDark={isDark}>
            <h2>Your Coding Profiles</h2>
            {loadingStats && <p>Loading your profile stats...</p>}
            {statsError && <ErrorText>{statsError}</ErrorText>}

            {!loadingStats && !statsError && (
              <>
                {/* Check if user has added any handles */}
                {!user.codechefHandle && !user.codeforcesHandle && !user.leetcodeHandle && (
                  <AddHandlesPrompt>
                    Please add your CodeChef, Codeforces, and LeetCode handles in your{' '}
                    <a href="/profile">profile</a> to see your stats here.
                  </AddHandlesPrompt>
                )}

                {/* Show CodeChef stats */}
                {user.codechefHandle && (
                  <ProfileCard>
                    <h3>CodeChef - {user.codechefHandle}</h3>
                    {profileStats.codechef ? (
                      <>
                        <p>Rating: {profileStats.codechef.rating}</p>
                        <p>Rank: {profileStats.codechef.rank}</p>
                        <p>Stars: {profileStats.codechef.stars}</p>
                      </>
                    ) : (
                      <p>Stats not available or failed to fetch.</p>
                    )}
                  </ProfileCard>
                )}

                {/* Show Codeforces stats */}
                {user.codeforcesHandle && (
                  <ProfileCard>
                    <h3>Codeforces - {user.codeforcesHandle}</h3>
                    {profileStats.codeforces ? (
                      <>
                        <p>Rating: {profileStats.codeforces.rating}</p>
                        <p>Max Rating: {profileStats.codeforces.maxRating}</p>
                        <p>Rank: {profileStats.codeforces.rank}</p>
                        <p>Max Rank: {profileStats.codeforces.maxRank}</p>
                      </>
                    ) : (
                      <p>Stats not available or failed to fetch.</p>
                    )}
                  </ProfileCard>
                )}

                {/* Show LeetCode stats */}
                {user.leetcodeHandle && (
                  <ProfileCard>
                    <h3>LeetCode - {user.leetcodeHandle}</h3>
                    {profileStats.leetcode ? (
                      <>
                        <p>Easy Solved: {profileStats.leetcode.easySolved}</p>
                        <p>Medium Solved: {profileStats.leetcode.mediumSolved}</p>
                        <p>Hard Solved: {profileStats.leetcode.hardSolved}</p>
                        <p>Total Solved: {profileStats.leetcode.totalSolved}</p>
                        <p>Ranking: {profileStats.leetcode.ranking}</p>
                      </>
                    ) : (
                      <p>Stats not available or failed to fetch.</p>
                    )}
                  </ProfileCard>
                )}
              </>
            )}
          </ProfileStatsPane>

          <RightPane isDark={isDark}>
            <h2>Upcoming Contests</h2>
            <ScrollContainer>
              <ScrollingList>
                {upcomingContests.map((contest, idx) => (
                  <ContestCard
                    key={contest.id}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      transform: hoveredIndex === idx ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.3s ease',
                    }}
                    onClick={() =>
                      window.open(`https://codeforces.com/contest/${contest.id}`, '_blank')
                    }
                  >
                    <strong>{contest.name}</strong>
                    <div>
                      Starts at:{' '}
                      {new Date(contest.startTimeSeconds * 1000).toLocaleString()}
                    </div>
                    <div>
                      Duration: {Math.floor(contest.durationSeconds / 3600)}h{' '}
                      {Math.floor((contest.durationSeconds % 3600) / 60)}m
                    </div>
                    <ReminderButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setReminderIndex(idx === reminderIndex ? null : idx);
                        setEmailErrors({});
                        setReminderSuccess(null);
                        setEmail('');
                      }}
                    >
                      Set Reminder
                    </ReminderButton>

                    {reminderIndex === idx && (
                      <ReminderForm onClick={(e) => e.stopPropagation()}>
                        <ReminderInput
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <ReminderButton
                          type="button"
                          onClick={() => handleReminder(contest)}
                        >
                          Set Reminder
                        </ReminderButton>
                        {emailErrors.reminder && <ErrorText>{emailErrors.reminder}</ErrorText>}
                        {reminderSuccess && <SuccessText>{reminderSuccess}</SuccessText>}
                      </ReminderForm>
                    )}
                  </ContestCard>
                ))}
              </ScrollingList>
            </ScrollContainer>
          </RightPane>
        </MainContent>
      </Wrapper>
    </>
  );
};

export default Home;

// ---------------- Styled Components ----------------

const Wrapper = styled.div`
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  min-height: 100vh;
  transition: all 0.3s ease;
  position: relative;
  padding: 40px;
`;

const AboutUsContainer = styled.div`
  max-width: 700px;
  margin: 80px auto;
  background: ${({ isDark }) => (isDark ? '#f9f9f9' : '#ffffff')};
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  color: ${({ isDark }) => (isDark ? 'black' : 'black')};
  text-align: center;

  a {
    color: #007bff;
    text-decoration: underline;
  }

  a:hover {
    opacity: 0.8;
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: 40px;
`;

const LeftPane = styled.div`
  flex: 7;
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  max-height: 280px;  /* reduce height to make room for below */

  /* Headings black in dark mode */
  h2 {
    color: ${({ isDark }) => (isDark ? 'black' : '#000')};
  }
`;

const ProfileStatsPane = styled.div`
  flex: 7;
  background: #ffffff;
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  max-height: 320px;
  overflow-y: auto;

  /* Headings black in dark mode */
  h2 {
    color: ${({ isDark }) => (isDark ? 'black' : '#000')};
    margin-bottom: 12px;
  }
`;

const RightPane = styled.div`
  flex: 3;
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  overflow: hidden;
  height: 640px;

  /* Headings black in dark mode */
  h2 {
    color: ${({ isDark }) => (isDark ? 'black' : '#000')};
  }
`;

const Input = styled.input`
  padding: 10px;
  width: 60%;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const FetchButton = styled.button`
  margin-left: 10px;
  padding: 10px 16px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const StatsList = styled.ul`
  margin-top: 15px;
  padding-left: 20px;
  font-size: 14px;
`;

const ScrollContainer = styled.div`
  height: 320px;
  overflow: hidden;
  position: relative;
`;

const ScrollingList = styled.div`
  display: flex;
  flex-direction: column;
  animation: scrollUp 10s linear infinite;

  &:hover {
    animation-play-state: paused;
  }

  @keyframes scrollUp {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50%);
    }
  }
`;

const ContestCard = styled.div`
  background: #f5f5f5;
  color: black;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  width: 100%;
`;

const ReminderButton = styled.button`
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
`;

const ReminderForm = styled.div`
  margin-top: 10px;
`;

const ReminderInput = styled.input`
  padding: 8px;
  width: 80%;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ErrorText = styled.div`
  color: red;
  margin-top: 4px;
  font-size: 12px;
`;

const SuccessText = styled.div`
  color: green;
  margin-top: 4px;
  font-size: 12px;
`;

const ProfileCard = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;

  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #333;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
  }
`;

const AddHandlesPrompt = styled.p`
  font-size: 14px;
  color: #555;

  a {
    color: #007bff;
    text-decoration: underline;
  }

  a:hover {
    opacity: 0.8;
  }
`;

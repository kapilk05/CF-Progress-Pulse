import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../components/ThemeContext';
import { AuthContext } from '../components/AuthContext';
import axios from 'axios';

const Home = () => {
  const { isDark } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [contestId, setContestId] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [reminderIndex, setReminderIndex] = useState(null);
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState({});
  const [reminderSuccess, setReminderSuccess] = useState(null);

  const [profileStats, setProfileStats] = useState({
    codechef: null,
    codeforces: null,
    leetcode: null,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const fetchUserStats = async () => {
    if (!/^\d+$/.test(contestId)) {
      setEmailErrors({ input: 'Please enter a valid contest ID (numbers only).' });
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/pulse', {
        contestId: parseInt(contestId),
      });
      setUserStats(res.data.data || []);
      setEmailErrors({});
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setUserStats([]);
    }
  };

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

  const fetchProfileStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    setStatsError(null);
    try {
      const { codechefHandle, codeforcesHandle, leetcodeHandle } = user;
      const results = {};

      if (codechefHandle) {
        try {
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

  return (
    <Wrapper>
      <MainContent>
        <LeftPaneWrapper>
          <ProfileStatsPane isDark={isDark}>
            <h2>Your Coding Profiles</h2>
            {loadingStats && <p>Loading your profile stats...</p>}
            {statsError && <ErrorText>{statsError}</ErrorText>}
            {!loadingStats && !statsError && (
              <>
                {!user.codechefHandle && !user.codeforcesHandle && !user.leetcodeHandle && (
                  <AddHandlesPrompt>
                    Please add your CodeChef, Codeforces, and LeetCode handles in your{' '}
                    <a href="/profile">profile</a> to see your stats here.
                  </AddHandlesPrompt>
                )}
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

          <ContestStatsPane isDark={isDark}>
            <h2>User Stats by Contest</h2>
            <Input
              placeholder="Enter Contest ID"
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              type="number"
            />
            {emailErrors.input && <ErrorText>{emailErrors.input}</ErrorText>}
            <FetchButton onClick={fetchUserStats}>Get Contest Stats</FetchButton>
            {userStats && userStats.length > 0 ? (
              <StatsList>
                {userStats.map((user, idx) => (
                  <ContestUserCard key={idx}>
                    <Handle>{user.handle}</Handle>
                    <Ratings>
                      <span>Old: <Rating>{user.oldRating}</Rating></span>
                      <span>New: <Rating>{user.newRating}</Rating></span>
                    </Ratings>
                    <ChangeTag>{user.colorChange}</ChangeTag>
                  </ContestUserCard>
                ))}
              </StatsList>
            ) : userStats ? (
              <p>No users from your college upgraded ranks in this contest.</p>
            ) : null}
          </ContestStatsPane>
        </LeftPaneWrapper>

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
                    Starts at: {new Date(contest.startTimeSeconds * 1000).toLocaleString()}
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
                      <ReminderButton type="button" onClick={() => handleReminder(contest)}>
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
  );
};

export default Home;

// ---------- Styled Components (ADD NEW ONES BELOW) ----------

const Wrapper = styled.div`
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  min-height: 100vh;
  padding: 40px;
`;

const AboutUsContainer = styled.div`
  max-width: 700px;
  margin: 80px auto;
  background: ${({ isDark }) => (isDark ? '#f9f9f9' : '#ffffff')};
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  color: black;
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

const LeftPaneWrapper = styled.div`
  flex: 6;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProfileStatsPane = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  flex: 1;
  max-height: 340px;
  overflow-y: auto;

  h2 {
    color: ${({ isDark }) => (isDark ? 'black' : '#000')};
    margin-bottom: 12px;
  }
`;

const ContestStatsPane = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  flex: 1;
  max-height: 360px;
  overflow-y: auto;

  h2 {
    color: ${({ isDark }) => (isDark ? 'black' : '#000')};
  }
`;

const RightPane = styled.div`
  flex: 4;
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  height: 640px;
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

const StatsList = styled.div`
  margin-top: 15px;
  font-size: 14px;
`;

const ContestUserCard = styled.div`
  background: #f1f1f1;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Handle = styled.h4`
  margin: 0 0 4px 0;
  color: #333;
`;

const Ratings = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
`;

const Rating = styled.span`
  font-weight: bold;
  color: #007bff;
`;

const ChangeTag = styled.div`
  display: inline-block;
  background-color: #28a745;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
`;

const ScrollContainer = styled.div`
  height: 600px;
  overflow: hidden;
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

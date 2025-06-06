import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const BRANCH_OPTIONS = [
  'Computer Engineering',
  'Electronics Engineering',
  'Mechanical Engineering',
  'Information Technology',
  'Civil Engineering',
  'Chemical Engineering',
  'Electrical Engineering',
  // add more branches as needed
];

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Editable fields state
  const [avatar, setAvatar] = useState(user?.avatarUrl || 'https://i.pravatar.cc/150');
  const [branch, setBranch] = useState(user?.branch || '');
  const [leetcode, setLeetcode] = useState(user?.handles?.leetcode || '');
  const [codechef, setCodechef] = useState(user?.handles?.codechef || '');
  const [codeforces, setCodeforces] = useState(user?.handles?.codeforces || '');

  // Track if changes were made
  const [changed, setChanged] = useState(false);

  // Detect changes by comparing with original user data
  useEffect(() => {
    if (
      avatar !== (user?.avatarUrl || 'https://i.pravatar.cc/150') ||
      branch !== (user?.branch || '') ||
      leetcode !== (user?.handles?.leetcode || '') ||
      codechef !== (user?.handles?.codechef || '') ||
      codeforces !== (user?.handles?.codeforces || '')
    ) {
      setChanged(true);
    } else {
      setChanged(false);
    }
  }, [avatar, branch, leetcode, codechef, codeforces, user]);

  // Avatar change handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes handler
  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      avatarUrl: avatar,
      branch,
      handles: {
        leetcode,
        codechef,
        codeforces,
      },
    }));

    alert('Profile updated!');
    setChanged(false);
    navigate('/');
  };

  return (
    <PageWrapper>
      <Card>
        <Title>My Profile</Title>

        <Form>
          <Section>
            <Label>Profile Picture</Label>
            <AvatarWrapper>
              <Avatar src={avatar} alt="Profile" />
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                id="avatarUpload"
              />
              <UploadLabel htmlFor="avatarUpload">Change</UploadLabel>
            </AvatarWrapper>
          </Section>

          <Section>
            <Label>Name</Label>
            <Input type="text" value={user?.name || ''} disabled />
          </Section>

          <Section>
            <Label>Email</Label>
            <Input type="email" value={user?.email || ''} disabled />
          </Section>

          <Section>
            <Label>College</Label>
            <Input
              type="text"
              value="Dwarkadas Jivanlal Sanghvi College of Engineering"
              disabled
            />
          </Section>

          <Section>
            <Label>Branch</Label>
            <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="" disabled>
                Select your branch
              </option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Section>

          <Section>
            <Label>LeetCode Handle</Label>
            <Input
              type="text"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              placeholder="LeetCode username"
            />
          </Section>

          <Section>
            <Label>CodeChef Handle</Label>
            <Input
              type="text"
              value={codechef}
              onChange={(e) => setCodechef(e.target.value)}
              placeholder="CodeChef username"
            />
          </Section>

          <Section>
            <Label>Codeforces Handle</Label>
            <Input
              type="text"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              placeholder="Codeforces username"
            />
          </Section>

          <SaveButton onClick={handleSave} disabled={!changed}>
            Save Changes
          </SaveButton>
        </Form>
      </Card>
    </PageWrapper>
  );
};

export default Profile;

// Styled Components

const PageWrapper = styled.div`
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
`;

const Card = styled.div`
  background: ${({ theme }) => theme.background === '#fff' ? '#fff' : '#2a2a2a'};
  padding: 36px 40px;
  border-radius: 20px;
  box-shadow:
    0 0 12px 4px rgba(77, 166, 255, 0.3),
    0 8px 16px rgba(77, 166, 255, 0.25);
  width: 100%;
  max-width: 500px;
  color: ${({ theme }) => theme.color};
  user-select: none;
`;

const Title = styled.h1`
  margin-bottom: 30px;
  font-weight: 700;
  text-align: center;
  color: ${({ theme }) => theme.color};
  letter-spacing: 1.2px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.color};
  user-select: text;
`;

const Input = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #ccc;
  font-size: 15px;
  background-color: ${({ disabled, theme }) =>
    disabled ? '#e9ecef' : theme.background};
  color: ${({ theme }) => theme.color};
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4da6ff;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #ccc;
  font-size: 15px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4da6ff;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 6px;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4da6ff;
  box-shadow: 0 0 12px 2px rgba(77, 166, 255, 0.6);
`;

const FileInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: #4da6ff;
  color: white;
  padding: 6px 14px;
  font-size: 14px;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 0 8px rgba(77, 166, 255, 0.7);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #357ab8;
  }
`;

const SaveButton = styled.button`
  align-self: flex-start;
  padding: 10px 18px;
  font-size: 15px;
  border: none;
  border-radius: 12px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.6);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover:enabled {
    background-color: #218838;
    box-shadow: 0 6px 14px rgba(33, 136, 56, 0.8);
  }

  &:disabled {
    background-color: #94d3a2;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

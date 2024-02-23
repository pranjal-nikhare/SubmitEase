'use client'
// components/StudentLogin.tsx
import { useState } from 'react';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    // You can implement the login logic here
    // For now, let's assume the login is successful
    const fakeToken = 'fakeToken123'; // Replace with actual token received from the server
    localStorage.setItem('token', fakeToken);
    alert('Login successful!');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin(); // Call handleLogin function on form submission
  };

  return (
    <div className="max-w-md mx-auto mt-4 p-4 bg-gray-100 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600">
          Login
        </button>
        <h1>dont have a account <a href="/studentsignup"> signup</a></h1>
      </form>
    </div>
  );
};

export default StudentLogin;

'use client'

import { useState } from 'react';
import { useRouter } from 'next/router';

const TeacherSignup = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        role:'',
        password: '',
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Your form submission logic here
    try {
        const response = await fetch('http://127.0.0.1:3000/user/signup/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          alert('Signup successful'); // Alert if signup is successful
          window.location.href = '/teacherlogin';
        } else {
          alert('Signup failed'); // Alert if signup fails
        }
      } catch (error: any) {
        console.error('Error signing up:', error.message);
        alert('An error occurred'); // Alert if an error occurs during signup
      }
    };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-4 p-4 bg-gray-100 rounded-lg shadow-lg">
        <input
          type="text"
          placeholder="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        /><br />
        <input
          type="text"
          placeholder="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        /><br />
        <input
          type="text"
          placeholder="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        /><br />
        <input
          type="text"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        /><br />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border border-gray-300"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600">
          Sign Up
        </button>
        <h1>Already have a account <a href="/teacherlogin">Login</a></h1>
      </form>
    </>
  );
};

export default TeacherSignup;

'use client'
import { useState, useEffect } from 'react';

const Createclass = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { firstname } = JSON.parse(userData);
            setFirstName(firstname);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = "/teacherlogin";
        }
    }, []);

    const handleChange = (e:any) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://127.0.0.1:3000/courses/createcourse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include token in the header
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Class created successfully');
                // Clear form data after successful submission
                setFormData({
                    title: '',
                    description: ''
                });
            } else {
                alert('Failed to create class');
            }
        } catch (error:any) {
            console.error('Error creating class:', error.message);
            alert('An error occurred');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-4 p-4 bg-gray-100 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Welcome, {firstName}</h1>
                <div>
                    <h2 className="text-lg font-semibold">{formData.title}</h2>
                    <p>{formData.description}</p>
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 rounded border border-gray-300"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 rounded border border-gray-300"
                    ></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600">
                    Create Class
                </button>
            </form>
        </div>
    );
};

export default Createclass;

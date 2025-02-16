import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InputField = ({ type, placeholder, value, onChange, name }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    name={name}
    className="border p-2 mb-2"
  />
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      await axios.post("https://frontend-take-home-service.fetch.com/auth/login",
        { ...formData },
        { withCredentials: true, });
      navigate("/search");
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <InputField
        type="text"
        placeholder="Enter Name"
        value={formData.name}
        onChange={handleChange}
        name="name"
      />
      <InputField
        type="email"
        placeholder="Enter Email"
        value={formData.email}
        onChange={handleChange}
        name="email"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
    </div>
  );
};

export default LoginPage;

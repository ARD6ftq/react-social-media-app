import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../app/globals.css';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>
            {user.firstname} {user.lastname} ({user.username})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;

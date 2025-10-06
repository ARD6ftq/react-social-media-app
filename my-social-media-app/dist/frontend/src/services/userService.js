import pool from '../../../backend/src/config/db';
export const getUsers = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    }
    catch (err) {
        console.error('Error querying the database:', err);
        throw err;
    }
};

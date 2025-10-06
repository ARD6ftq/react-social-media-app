import { error } from 'console';
import pool from '../../backend/src/config/db';

const testConnection = async () => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Database connected successfully:', rows); 
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

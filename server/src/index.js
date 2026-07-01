import express from 'express';
import mysql from 'mysql2/promise.js'

const app = express();
const PORT = 3000;

app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'treasure',
    password: 'admin',
    database: 'nomad',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/', (req, res) => {
    res.json({ 'message': 'Server is up and healthy'})
})

app.get('/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/tasks', async (req, res) => {
    const { id, domainType, primaryLabel, secondaryLabel, lat, lng } = req.body;
    
    try {
        const query = `
            INSERT INTO tasks (id, domainType, primaryLabel, secondaryLabel, lat, lng) 
            VALUES (?, ?, ?, ?, ?, ?) 
        `;
        await pool.query(query, [id, domainType, primaryLabel, secondaryLabel, lat, lng]);
        res.status(201).json({ message: 'Task created successfully', id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { domainType, primaryLabel, secondaryLabel, lat, lng } = req.body;

    try {
        const query = `
            UPDATE tasks 
            SET domainType = ?, primaryLabel = ?, secondaryLabel = ?, lat = ?, lng = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [domainType, primaryLabel, secondaryLabel, lat, lng, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
const { pool } = require('../config/db');

class UserRepository {
  async createUser(username, email, passwordHash) {
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role, created_at;
    `;
    const values = [username, email, passwordHash];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1;';
    const { rows } = await pool.query(query, [username]);
    return rows[0];
  }

  async findById(id) {
    const query = 'SELECT id, username, email, role, bio, github_url, website_url, created_at FROM users WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async updateProfile(id, username, email, bio, githubUrl, websiteUrl) {
    const query = `
      UPDATE users
      SET username = $2, email = $3, bio = $4, github_url = $5, website_url = $6
      WHERE id = $1
      RETURNING id, username, email, role, bio, github_url, website_url;
    `;
    const { rows } = await pool.query(query, [id, username, email, bio, githubUrl, websiteUrl]);
    return rows[0];
  }

  async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = new UserRepository();

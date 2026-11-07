require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zakir_payroll_db',
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY employee_id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/employees', async (req, res) => {
  const { name, designation, phone, email, joining_date } = req.body;
  if (!name || !designation) return res.status(400).json({ error: 'Name and designation are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO employees (name, designation, phone, email, joining_date) VALUES (?, ?, ?, ?, ?)',
      [name, designation, phone || null, email || null, joining_date || null]
    );
    res.status(201).json({ employee_id: result.insertId, message: 'Employee added.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/employees/:id', async (req, res) => {
  const { name, designation, phone, email, joining_date } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE employees SET name=?, designation=?, phone=?, email=?, joining_date=? WHERE employee_id=?',
      [name, designation, phone || null, email || null, joining_date || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM employees WHERE employee_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/salaries', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT s.*, e.name, e.designation FROM salary_details s
      JOIN employees e ON e.employee_id=s.employee_id ORDER BY s.salary_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/salaries', async (req, res) => {
  const { employee_id, basic_salary, allowance, deduction } = req.body;
  const basic = Number(basic_salary), add = Number(allowance || 0), minus = Number(deduction || 0);
  if (!employee_id || !Number.isFinite(basic) || basic < 0 || add < 0 || minus < 0)
    return res.status(400).json({ error: 'Enter a valid employee and non-negative salary values.' });
  const net = basic + add - minus;
  if (net < 0) return res.status(400).json({ error: 'Deduction cannot exceed basic salary plus allowance.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO salary_details (employee_id, basic_salary, allowance, deduction, net_salary) VALUES (?, ?, ?, ?, ?)',
      [employee_id, basic, add, minus, net]
    );
    res.status(201).json({ salary_id: result.insertId, net_salary: net, message: 'Salary details saved.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/salaries/:id', async (req, res) => {
  const { employee_id, basic_salary, allowance, deduction } = req.body;
  const basic = Number(basic_salary), add = Number(allowance || 0), minus = Number(deduction || 0), net = basic + add - minus;
  if (!employee_id || basic < 0 || add < 0 || minus < 0 || net < 0)
    return res.status(400).json({ error: 'Check employee and salary values.' });
  try {
    const [result] = await pool.execute(
      'UPDATE salary_details SET employee_id=?, basic_salary=?, allowance=?, deduction=?, net_salary=? WHERE salary_id=?',
      [employee_id, basic, add, minus, net, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Salary record not found.' });
    res.json({ message: 'Salary updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/salaries/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM salary_details WHERE salary_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Salary record not found.' });
    res.json({ message: 'Salary deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/payroll', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT p.*, e.name, e.designation, s.net_salary FROM payroll p
      JOIN employees e ON e.employee_id=p.employee_id
      JOIN salary_details s ON s.salary_id=p.salary_id ORDER BY p.year DESC, p.month DESC, p.payroll_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payroll', async (req, res) => {
  const { employee_id, salary_id, month, year, payment_date, payment_status } = req.body;
  if (!employee_id || !salary_id || !Number.isInteger(Number(month)) || Number(month)<1 || Number(month)>12 ||
      !Number.isInteger(Number(year)) || Number(year)<2000 || Number(year)>2100)
    return res.status(400).json({ error: 'Choose employee, salary, valid month (1-12), and year.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO payroll (employee_id, salary_id, `month`, `year`, payment_date, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, salary_id, Number(month), Number(year), payment_date || null, payment_status || 'Pending']
    );
    res.status(201).json({ payroll_id: result.insertId, message: 'Payroll entry created.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/payroll/:id', async (req, res) => {
  const { employee_id, salary_id, month, year, payment_date, payment_status } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE payroll SET employee_id=?, salary_id=?, `month`=?, `year`=?, payment_date=?, payment_status=? WHERE payroll_id=?',
      [employee_id, salary_id, month, year, payment_date || null, payment_status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Payroll entry not found.' });
    res.json({ message: 'Payroll updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/payroll/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM payroll WHERE payroll_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Payroll entry not found.' });
    res.json({ message: 'Payroll entry deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reports', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT p.payroll_id, e.employee_id, e.name, e.designation,
      p.month, p.year, s.basic_salary, s.allowance, s.deduction, s.net_salary, p.payment_date, p.payment_status
      FROM payroll p JOIN employees e ON e.employee_id=p.employee_id
      JOIN salary_details s ON s.salary_id=p.salary_id ORDER BY p.year DESC, p.month DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const [[employees]] = await pool.query('SELECT COUNT(*) AS total FROM employees');
    const [[payroll]] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(net_salary),0) AS amount FROM payroll p JOIN salary_details s ON s.salary_id=p.salary_id');
    const [[pending]] = await pool.query("SELECT COUNT(*) AS total FROM payroll WHERE payment_status='Pending'");
    res.json({ employees: employees.total, payrollEntries: payroll.total, payrollAmount: payroll.amount, pending: pending.total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zakir Employee Payroll Management System running at http://localhost:${PORT}`));

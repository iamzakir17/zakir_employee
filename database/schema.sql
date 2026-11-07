CREATE DATABASE IF NOT EXISTS zakir_payroll_db;
USE zakir_payroll_db;

CREATE TABLE IF NOT EXISTS employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(100),
  joining_date DATE
);

CREATE TABLE IF NOT EXISTS salary_details (
  salary_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance DECIMAL(10,2) NOT NULL DEFAULT 0,
  deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_salary_employee FOREIGN KEY (employee_id)
    REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll (
  payroll_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  salary_id INT NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  payment_date DATE,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id)
    REFERENCES employees(employee_id) ON DELETE CASCADE,
  CONSTRAINT fk_payroll_salary FOREIGN KEY (salary_id)
    REFERENCES salary_details(salary_id) ON DELETE CASCADE,
  CONSTRAINT uq_employee_period UNIQUE (employee_id, `month`, `year`)
);

-- Optional sample employee; run manually if you want a starter row:
-- INSERT INTO employees (name, designation, phone, email, joining_date)
-- VALUES ('Ayesha Khan', 'Accountant', '9876543210', 'ayesha@example.com', '2025-01-10');

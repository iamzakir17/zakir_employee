# Zakir Employee Payroll Management System

College project built with HTML, CSS, JavaScript, Express.js and MySQL.

## Included
- Employee records CRUD
- Salary details CRUD with automatic net salary calculation
- Monthly payroll CRUD and payment status
- Dashboard totals
- Salary report table with Print / Save PDF
- MySQL schema using the three specified tables: `employees`, `salary_details`, `payroll`

## Step-by-step setup (Windows / VS Code)

### 1. Install prerequisites
Install Node.js LTS and MySQL Server / MySQL Workbench. Start the MySQL server service.

### 2. Create database and tables in Workbench
1. Open MySQL Workbench and connect to your local MySQL instance.
2. Open `database/schema.sql` from this project (File > Open SQL Script).
3. Click the lightning bolt Execute button.
4. In the SCHEMAS panel, click Refresh. You should see `zakir_payroll_db`.
5. Expand `zakir_payroll_db` > Tables. You should see `employees`, `salary_details`, and `payroll`.

### 3. Configure password
1. In VS Code, open the project folder.
2. Copy `.env.example` and rename the copy to `.env`.
3. Edit `.env`; put your actual MySQL root password after `DB_PASSWORD=`.
   If your MySQL root account has no password, leave it blank.
4. Do not upload `.env` to GitHub. `.gitignore` excludes it.

### 4. Install packages
In VS Code: Terminal > New Terminal. Ensure terminal path is the project folder, then run:
```bash
npm install
```

### 5. Run the project
```bash
npm start
```
Terminal should show:
`Zakir Employee Payroll Management System running at http://localhost:3000`

Open Chrome and visit http://localhost:3000

### 6. Use the website
- Employees: add, view, edit and delete employee records.
- Salary Details: select an employee, enter basic salary, allowances and deductions. Net salary is calculated as basic + allowance - deduction.
- Monthly Payroll: select employee and salary record, month, year, payment date and status.
- Salary Reports: view payroll rows and use Print / Save PDF.

Add employee data first, then add salary data, then create payroll entries. The foreign keys link records between tables. The same employee should have only one payroll entry for a given month/year.

### 7. Stop the server
In the VS Code terminal where the server is running, press:
`Ctrl + C`

## GitHub upload
Create a new GitHub repository, then in the VS Code project terminal:
```bash
git init
git add .
git commit -m "Initial commit - Zakir Employee Payroll Management System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/zakir-employee-payroll-management-system.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username. `.env` and `node_modules` are ignored by Git.

## Note
This is a local learning project. It does not include authentication or tax-compliance rules; payroll figures are the simple calculation defined in the project requirements.

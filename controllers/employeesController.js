const fs = require("fs");

// Function to save the employees data to the JSON file
const saveEmployeesToFile = (employees) => {
  const filePath = "model/employees.json";
  fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
};

const data = {
  employees: require("../model/employees.json"),
  setEmployees: function (employees) {
    this.employees = employees;
    // Save the updated employees data to the JSON file
    saveEmployeesToFile(employees);
  },
};

// Other functions remain the same...

const getAllEmployees = (req, res) => {
  res.json(data.employees);
};

const createNewEmployee = (req, res) => {
  const newEmployee = {
    id: data.employees[data.employees.length - 1].id + 1 || 1,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  };

  if (!newEmployee.firstname || !newEmployee.lastname) {
    return res
      .status(400)
      .json({ message: "First and last names are required" });
  }

  data.setEmployees([...data.employees, newEmployee]);
  res.status(201).json(data.employees);
};

const updateNewEmployee = (req, res) => {
  const employee = data.employees.find(
    (emp) => emp.id === parseInt(req.body.id)
  );

  if (!employee) {
    return res
      .status(400)
      .json({ message: `Employee ID ${req.body.id} not found` });
  }

  if (req.body.firstname) {
    employee.firstname = req.body.firstname;
  }
  if (req.body.lastname) {
    employee.lastname = req.body.lastname;
  }

  // Use filter method to create a new array excluding the employee to be updated
  const filteredArray = data.employees.filter(
    (emp) => emp.id !== parseInt(req.body.id)
  );

  // Combine the updated employee and filtered array
  const updatedEmployees = [...filteredArray, employee];

  // Sort the updatedEmployees array based on id
  const sortedEmployees = updatedEmployees.sort((a, b) => a.id - b.id);

  // Update the data.employees with the sorted array
  data.setEmployees(sortedEmployees);

  res.status(200).json(data.employees);
};

const deleteEmployee = (req, res) => {
  const employee = data.employees.find(
    (emp) => emp.id !== parseInt(req.body.id)
  );

  if (!employee) {
    return res
      .status(400)
      .json({ message: `Employee ID ${req.body.id} not found` });
  }

  const filteredArray = data.employees.filter(
    (emp) => emp.id !== parseInt(req.body.id)
  );

  const unsortedArray = [...filteredArray];
  data.setEmployees(unsortedArray);
  res.status(200).json(data.employees);
};

const getEmployee = (req, res) => {
  const employee = data.employees.find(
    (emp) => emp.id === parseInt(req.params.id)
  );

  if (!employee) {
    return res
      .status(400)
      .json({ message: `Employee ID ${req.params.id} not found` });
  }
  res.status(200).json(employee);
};

module.exports = {
  getAllEmployees,
  createNewEmployee,
  updateNewEmployee,
  deleteEmployee,
  getEmployee,
};

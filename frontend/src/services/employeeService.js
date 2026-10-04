import { apiRequest } from "./api";

export const getEmployees = async () => {
    const data = await apiRequest("/employees");
    return data.employees;
};

export const getEmployeeById = async (id) => {
    const data = await apiRequest(`/employees/${id}`);
    return data.employee;
};

export const getEmployeeWithAssets = async (id) => {
    return await apiRequest(`/employees/${id}/assets`);
};

export const createEmployee = async (employee) => {
    return await apiRequest("/employees", {
        method: "POST",
        body: JSON.stringify(employee)
    });
};

export const updateEmployee = async (id, employee) => {
    return await apiRequest(`/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(employee)
    });
};
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import Server from "@/server/Server"; // Assuming Server is correctly configured for API calls

const EditUserModal = ({ closeModal, userId }) => {
  const [userData, setUserData] = useState({
    firstname: "",
    surname: "",
    email: "",
    role: "",
    department: "",
    salary: "",
    contractFrom: "",
    contractTo: "",
  }); // Initialize with empty strings to avoid uncontrolled component warnings
  const [loading, setLoading] = useState(false);

  // Fetch the user data when modal opens or userId changes
  useEffect(() => {
    if (userId) { // Ensure userId exists before fetching
      Server.fetchUserDetails(userId)
        .then((response) => {
          // Format dates to 'YYYY-MM-DD' if they come from the backend as different formats
          // This is crucial for HTML date inputs
          const formattedData = {
            ...response.data,
            contractFrom: response.data.contractFrom ? new Date(response.data.contractFrom).toISOString().split('T')[0] : '',
            contractTo: response.data.contractTo ? new Date(response.data.contractTo).toISOString().split('T')[0] : '',
          };
          setUserData(formattedData);
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
          toast.error("Failed to load user details.");
        });
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data to send to Django. Ensure field names match your Django model.
    const dataToSend = {
      first_name: userData.firstname, // Example: if Django expects 'first_name'
      last_name: userData.surname, // Example: if Django expects 'last_name'
      email: userData.email,
      role: userData.role,
      department: userData.department,
      salary: userData.salary,
      contract_from: userData.contractFrom, // Example: if Django expects 'contract_from'
      contract_to: userData.contractTo,     // Example: if Django expects 'contract_to'
      // ... include other fields that your Django backend expects
    };

    axios
      .put(`/user/${userId}/`, dataToSend) // API call to update the user
      .then((response) => {
        toast.success("User updated successfully!");
        closeModal(); // Close modal after success
        // You might want to trigger a refresh of the user list in the parent component here
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        // More specific error messages can be pulled from error.response.data
        if (error.response && error.response.data) {
          toast.error(`Error: ${JSON.stringify(error.response.data)}`);
        } else {
          toast.error("Error updating user.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center w-full z-50"> {/* Added z-50 for modal stacking */}
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md space-y-4 w-full max-w-lg shadow-lg relative" // Added relative for positioning close button
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit User details</h2>
          <button
            type="button" // Ensure it's type="button" to prevent form submission
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none" // Adjusted styling for 'x'
          >
            &times; {/* Use HTML entity for 'x' for better consistency */}
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto"> {/* Added scroll for long forms */}
          {/* First Name */}
          <div>
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              name="firstname"
              value={userData.firstname || ""} // Corrected: use {userData.firstname} directly, add || "" for controlled component
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          {/* Surname */}
          <div>
            <Label htmlFor="surname">Surname</Label>
            <Input
              id="surname"
              name="surname"
              value={userData.surname || ""} // Corrected
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email || ""} // Corrected
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              value={userData.role || ""} // Corrected
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="" disabled>Select Role</option> {/* Added disabled default option */}
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
              {/* Add more roles if necessary */}
            </select>
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="department">Department</Label>
            <select
              id="department" // Added id for label association
              name="department"
              value={userData.department || ""} // Corrected
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="" disabled>
                Select Department
              </option>
              <option value="Management">Management</option> {/* Capitalized to match common naming */}
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Purchasing">Purchasing</option>
            </select>
          </div>

          {/* Salary */}
          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              value={userData.salary || ""} // Corrected
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          {/* Contract From */}
          <div>
            <Label htmlFor="contractFrom">Contract From</Label>
            <Input
              id="contractFrom"
              name="contractFrom"
              type="date"
              value={userData.contractFrom || ""} // Corrected
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          {/* Contract To */}
          <div>
            <Label htmlFor="contractTo">Contract To</Label>
            <Input
              id="contractTo"
              name="contractTo"
              type="date"
              value={userData.contractTo || ""} // Corrected
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div> {/* End of scrollable content div */}

        {/* Modal Actions */}
        <div className="flex justify-end space-x-4 mt-4 p-4 border-t"> {/* Added padding and border-t for separation */}
          <Button
            type="button" // Important: set to type="button" to prevent form submission
            onClick={closeModal}
            variant="outline"
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="default" // This is from your UI library
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" // Added classes if `variant` doesn't fully style
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUserModal;
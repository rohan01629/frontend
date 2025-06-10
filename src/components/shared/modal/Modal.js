import React, { useState } from "react";
import { useSelector } from "react-redux";
import InputType from "./../Form/InputType";
import API from "./../../../services/API";

const Modal = () => {
  const [inventoryType, setInventoryType] = useState("in");
  const [bloodGroup, setBloodGroup] = useState("");
  const [quantity, setQuantity] = useState("");
  const [email, setEmail] = useState("");
  const { user } = useSelector((state) => state.auth);

  // ✅ Temporary real IDs - ensure these exist in DB
  const TEST_DONOR_ID = "66535d9715d2c9f4c2a6d45a";
  const TEST_HOSPITAL_ID = "66535c8215d2c9f4c2a6d23b";

  const handleModalSubmit = async () => {
    try {
      // 🛡️ Basic validation
      if (!email || !bloodGroup || !quantity) {
        return alert("Please fill all fields.");
      }

      // 🎯 Construct payload
      const payload = {
        email,
        organisation: user?._id,
        inventoryType,
        bloodGroup,
        quantity: parseInt(quantity),
      };

      // ➕ Add donor/hospital based on type
      if (inventoryType === "in") {
        payload.donar = TEST_DONOR_ID;
      } else if (inventoryType === "out") {
        payload.hospital = TEST_HOSPITAL_ID;
      }

      console.log("Submitting payload:", payload);

      // 📡 Send to backend
      const { data } = await API.post("/inventory/create-inventory", payload);

      if (data?.success) {
        alert("Inventory record created successfully!");
        window.location.reload(); // Refresh the page after successful submission
      } else {
        alert(data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error creating inventory:", error);
      const errMsg = error?.response?.data?.message || "Internal server error";
      alert(errMsg); // Alert with the error message from the backend
      window.location.reload(); // Refresh the page on error (optional)
    }
  };

  return (
    <div
      className="modal fade"
      id="staticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex={-1}
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Manage Blood Record
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            {/* Inventory Type */}
            <div className="d-flex mb-3">
              Blood Type:&nbsp;
              <div className="form-check ms-3">
                <input
                  type="radio"
                  name="inRadio"
                  value="in"
                  defaultChecked
                  onChange={(e) => setInventoryType(e.target.value)}
                  className="form-check-input"
                />
                <label className="form-check-label">IN</label>
              </div>
              <div className="form-check ms-3">
                <input
                  type="radio"
                  name="inRadio"
                  value="out"
                  onChange={(e) => setInventoryType(e.target.value)}
                  className="form-check-input"
                />
                <label className="form-check-label">OUT</label>
              </div>
            </div>

            {/* Blood Group */}
            <select
              className="form-select"
              onChange={(e) => setBloodGroup(e.target.value)}
              value={bloodGroup} // Make sure value is controlled
            >
              <option value="" disabled>Select Blood Group</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            {/* Email */}
            <InputType
              labelText={inventoryType === "in" ? "Donor Email" : "Hospital Email"}
              labelFor="email"
              inputType="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Quantity */}
            <InputType
              labelText="Quantity (ML)"
              labelFor="quantity"
              inputType="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handleModalSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
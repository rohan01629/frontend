import React, { useEffect, useState } from "react";
import axiosInstance from "../../src/utils/axiosInstance";
import moment from "moment";

const OrganInventoryPage = () => {
  const [organs, setOrgans] = useState([]);
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    organType: "",
    bloodGroup: "",
    quantity: "",
    donor: "",
    hospital: "",
    inOrOut: "",
    donorReceiverName: "",
    age: "",
    email: "",
    phone: "",
  });

  const [medicalDocument, setMedicalDocument] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);

  const organOptions = ["Kidney", "Liver", "Heart", "Lung", "Pancreas", "Intestine"];
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const colors = ["#884A39", "#C38154", "#FFC26F", "#4F709C", "#4942E4", "#0079FF", "#FF0060", "#22A699"];

  useEffect(() => {
    fetchOrgans();
    fetchDonors();
  }, []);

  const fetchOrgans = async () => {
    try {
      const res = await axiosInstance.get("/organ-inventory/get-organ");
      if (res.data.success) {
        setOrgans(res.data.data);
      } else {
        setError("Failed to fetch organs.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await axiosInstance.get("/users?role=donar");
      if (res.data.success) {
        setDonors(res.data.data);
      } else {
        setError("Failed to fetch donors.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "medicalDocument" && files[0]) setMedicalDocument(files[0]);
    if (name === "identityProof" && files[0]) setIdentityProof(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const isIn = formData.inOrOut === "in";
    const isOut = formData.inOrOut === "out";

    if (isIn && !formData.donor) return setError("Donor is required for IN type.");
    if (isOut && !formData.hospital) return setError("Hospital is required for OUT type.");

    try {
      const qty = Number(formData.quantity);
      if (qty <= 0) return setError("Quantity must be greater than zero.");

      // Calculate current available quantity for this organ/bloodGroup
      const key = `${formData.organType}|${formData.bloodGroup}`;
      const availableQty = organs.reduce((acc, o) => {
        const k = `${o.organType}|${o.bloodGroup}`;
        if (k === key) {
          return acc + (o.inOrOut === "in" ? Number(o.quantity) : -Number(o.quantity));
        }
        return acc;
      }, 0);

      if (isOut && qty > availableQty) {
        return setError(`Insufficient stock: only ${availableQty} available.`);
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => val && data.append(key, val));
      if (medicalDocument) data.append("medicalDocument", medicalDocument);
      if (identityProof) data.append("identityProof", identityProof);

      // Always add a new record instead of updating
      const res = await axiosInstance.post("/organ-inventory/add-organ", data);

      if (res.data.success) {
        resetForm();
        fetchOrgans();
      } else {
        setError(res.data.message || "Submission failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      organType: "",
      bloodGroup: "",
      quantity: "",
      donor: "",
      hospital: "",
      inOrOut: "",
      donorReceiverName: "",
      age: "",
      email: "",
      phone: "",
    });
    setMedicalDocument(null);
    setIdentityProof(null);
    document.querySelectorAll('input[type="file"]').forEach((el) => (el.value = ""));
  };

  // Calculate total IN and OUT separately (across all organs)
  const totalIn = organs.filter((o) => o.inOrOut === "in").reduce((acc, o) => acc + Number(o.quantity), 0);
  const totalOut = organs.filter((o) => o.inOrOut === "out").reduce((acc, o) => acc + Number(o.quantity), 0);

  // Summary per organ+bloodGroup with totalIn, totalOut, and available (non-negative)
  const summary = organs.reduce((acc, organ) => {
    const key = `${organ.organType}|${organ.bloodGroup}`;
    if (!acc[key]) {
      acc[key] = { totalIn: 0, totalOut: 0 };
    }
    if (organ.inOrOut === "in") {
      acc[key].totalIn += Number(organ.quantity);
    } else {
      acc[key].totalOut += Number(organ.quantity);
    }
    return acc;
  }, {});

  // Helper to safely format inOrOut type
  const formatType = (type) => (typeof type === "string" ? type.toUpperCase() : "N/A");

  return (
    <div className="container mt-4">
      <h3 className="mb-4">🧬 Organ Inventory Dashboard</h3>

      <div className="mb-4">
        <h5>Inventory Summary</h5>
        <p>
          <strong>Total IN:</strong> {totalIn} | <strong>Total OUT:</strong> {totalOut}
        </p>
        <ul>
          {Object.entries(summary).map(([key, { totalIn, totalOut }]) => {
            const [organ, blood] = key.split("|");
            const available = Math.max(totalIn - totalOut, 0);
            return (
              <li key={key}>
                {organ} ({blood}): <strong>Available: {available}</strong>, IN: {totalIn}, OUT: {totalOut}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Form */}
      <form className="row g-3 mb-4" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Organ Type */}
        <div className="col-md-2">
          <label className="form-label">Organ Type</label>
          <select name="organType" className="form-select" required value={formData.organType} onChange={handleInputChange}>
            <option value="">Select</option>
            {organOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Blood Group */}
        <div className="col-md-2">
          <label className="form-label">Blood Group</label>
          <select name="bloodGroup" className="form-select" required value={formData.bloodGroup} onChange={handleInputChange}>
            <option value="">Select</option>
            {bloodGroupOptions.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="col-md-2">
          <label className="form-label">Quantity</label>
          <input type="number" min="1" name="quantity" className="form-control" required value={formData.quantity} onChange={handleInputChange} />
        </div>

        {/* IN or OUT */}
        <div className="col-md-2">
          <label className="form-label">In / Out</label>
          <select name="inOrOut" className="form-select" required value={formData.inOrOut} onChange={handleInputChange}>
            <option value="">Select</option>
            <option value="in">IN</option>
            <option value="out">OUT</option>
          </select>
        </div>

        {/* Donor */}
        <div className="col-md-2">
          <label className="form-label">Donor</label>
          <select name="donor" className="form-select" value={formData.donor} onChange={handleInputChange} disabled={formData.inOrOut !== "in"}>
            <option value="">Optional</option>
            {donors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.email})
              </option>
            ))}
          </select>
        </div>

        {/* Hospital */}
        <div className="col-md-2">
          <label className="form-label">Hospital</label>
          <input type="text" name="hospital" className="form-control" value={formData.hospital} onChange={handleInputChange} disabled={formData.inOrOut !== "out"} />
        </div>

        {/* Personal Info */}
        <div className="col-md-3">
          <label className="form-label">Full Name</label>
          <input type="text" name="donorReceiverName" className="form-control" required value={formData.donorReceiverName} onChange={handleInputChange} />
        </div>
        <div className="col-md-1">
          <label className="form-label">Age</label>
          <input type="number" name="age" className="form-control" required min="0" value={formData.age} onChange={handleInputChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleInputChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Phone</label>
          <input type="tel" name="phone" className="form-control" required value={formData.phone} onChange={handleInputChange} />
        </div>

        {/* Files */}
        <div className="col-md-6">
          <label className="form-label">Medical Document</label>
          <input type="file" name="medicalDocument" accept=".pdf,.jpg,.jpeg,.png" className="form-control" onChange={handleFileChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Identity Proof</label>
          <input type="file" name="identityProof" accept=".pdf,.jpg,.jpeg,.png" className="form-control" onChange={handleFileChange} />
        </div>

        {/* Error + Buttons */}
        {error && (
          <div className="col-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        <div className="col-12">
          <button type="submit" className="btn btn-primary me-2">
            Submit
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      {/* Cards */}
      <h4 className="mb-3">Inventory Summary Cards</h4>
      <div className="d-flex flex-wrap">
        {Object.entries(summary).map(([key, { totalIn, totalOut }], i) => {
          const [organ, blood] = key.split("|");
          const available = Math.max(totalIn - totalOut, 0);
          return (
            <div
              key={key}
              className="card m-2 p-2 text-white"
              style={{ backgroundColor: colors[i % colors.length], width: "18rem", borderRadius: "10px" }}
            >
              <div className="card-body">
                <h5 className="card-title bg-light text-dark text-center py-2 rounded">
                  {organ} ({blood})
                </h5>
                <p>
                  <b>Available:</b> {available}
                </p>
                <p>
                  <b>IN:</b> {totalIn} | <b>OUT:</b> {totalOut}
                </p>
              </div>
              <div className="card-footer bg-dark text-center text-light rounded">
                Last updated: {organs[0]?.updatedAt && moment(organs[0].updatedAt).fromNow()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Organ Records */}
      <h4 className="mt-5 mb-3">Organ Inventory Records</h4>
      <div className="d-flex flex-wrap">
        {organs.length === 0 ? (
          <p>No records available.</p>
        ) : (
          organs.map((o, i) => (
            <div
              key={o._id}
              className="card m-2 p-3 text-white"
              style={{ width: "20rem", backgroundColor: colors[i % colors.length], borderRadius: "12px" }}
            >
              <div>
                <h5 className="card-title bg-light text-dark text-center py-2 rounded">
                  {o.organType} ({o.bloodGroup})
                </h5>
                <p>
                  <strong>Quantity:</strong> {o.quantity}
                </p>
                <p>
                  <strong>Type:</strong> {formatType(o.inOrOut)}
                </p>
                <p>
                  <strong>Name:</strong> {o.donorReceiverName}
                </p>
                <p>
                  <strong>Age:</strong> {o.age}
                </p>
                <p>
                  <strong>Email:</strong> {o.email}
                </p>
                <p>
                  <strong>Phone:</strong> {o.phone}
                </p>
                <p>
                  <strong>{o.inOrOut === "in" ? "Donor" : "Hospital"}:</strong>{" "}
                  {o.inOrOut === "in" ? (o.donor?.name || "N/A") : o.hospital}
                </p>
                <p>
                  <strong>Updated:</strong> {moment(o.updatedAt).fromNow()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganInventoryPage;

import React, { useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance'; // Make sure baseURL is /api/v1
import { useAuth } from '../../../context/authContext';

const organOptions = [
  'Heart', 'Liver', 'Kidney', 'Lung', 'Pancreas', 'Intestine', 'Cornea', 'Skin',
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const OrganModal = ({ onClose }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    organType: '',
    bloodGroup: '',
    quantity: 1,
    inOrOut: 'in', // default
    donorReceiverName: '',
    age: '',
    email: '',
    phone: '',
  });

  const [medicalDocument, setMedicalDocument] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = [
      'organType', 'bloodGroup', 'quantity', 'inOrOut',
      'donorReceiverName', 'age', 'email', 'phone'
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`Please fill the ${field} field.`);
        return;
      }
    }

    if (!medicalDocument || !identityProof) {
      alert('Please upload both medical document and identity proof.');
      return;
    }

    try {
      const formData = new FormData();

      for (let key in form) {
        formData.append(key, form[key]);
      }

      if (form.inOrOut === 'in') {
        formData.append('donor', user._id);
      } else {
        formData.append('hospital', user._id);
      }

      formData.append('medicalDocument', medicalDocument);
      formData.append('identityProof', identityProof);

      const res = await axiosInstance.post('/organ-inventory/add-organ', formData);

      if (res.data?.success) {
        alert('Organ inventory added successfully!');
        onClose();
      } else {
        alert(res.data?.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Add Organ Error:', err.response?.data || err.message);
      alert('Failed to add organ. Please check server logs.');
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-96 space-y-4"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-bold">Add Organ</h2>

        {/* Organ Type */}
        <select name="organType" value={form.organType} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
          <option value="">Select Organ</option>
          {organOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {/* Blood Group */}
        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
          <option value="">Select Blood Group</option>
          {bloodGroups.map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>

        {/* Quantity */}
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          min={1}
          className="w-full border px-3 py-2 rounded"
          placeholder="Quantity"
          required
        />

        {/* In/Out Selection */}
        <div className="flex gap-4">
          <label className="flex items-center">
            <input type="radio" name="inOrOut" value="in" checked={form.inOrOut === 'in'} onChange={handleChange} />
            <span className="ml-2">IN</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="inOrOut" value="out" checked={form.inOrOut === 'out'} onChange={handleChange} />
            <span className="ml-2">OUT</span>
          </label>
        </div>

        {/* Donor / Hospital Info */}
        <input name="donorReceiverName" value={form.donorReceiverName} onChange={handleChange} placeholder="Full Name" className="w-full border px-3 py-2 rounded" required />
        <input name="age" value={form.age} onChange={handleChange} placeholder="Age" type="number" className="w-full border px-3 py-2 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="w-full border px-3 py-2 rounded" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" type="tel" className="w-full border px-3 py-2 rounded" required />

        {/* Files */}
        <div>
          <label className="block text-sm font-medium mb-1">Medical Document (PDF/JPG/PNG)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setMedicalDocument)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Identity Proof (PDF/JPG/PNG)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setIdentityProof)} required />
        </div>

        <div className="flex justify-between mt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
          <button type="button" onClick={onClose} className="text-red-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganModal;

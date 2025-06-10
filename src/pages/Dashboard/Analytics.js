import React, { useState, useEffect } from "react";
import Header from "../../components/shared/Layout/Header";
import API from "./../../services/API";
import moment from "moment";

const Analytics = () => {
  const [data, setData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const colors = [
    "#884A39",
    "#C38154",
    "#FFC26F",
    "#4F709C",
    "#4942E4",
    "#0079FF",
    "#FF0060",
    "#22A699",
  ];

  // FETCH BLOOD GROUP ANALYTICS
  const getBloodGroupData = async () => {
    try {
      const res = await API.get("/analytics/bloodGroups-data");
      console.log("📊 Blood Group Data:", res?.data);
      if (res?.data?.success) {
        setData(res.data.bloodGroupData);
      }
    } catch (error) {
      console.error("❌ Error fetching blood group data:", error);
    }
  };

  // FETCH RECENT INVENTORY
  const getBloodRecords = async () => {
    try {
      const res = await API.get("/inventory/get-recent-inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log("🧾 Recent Inventory:", res?.data);
      if (res?.data?.success) {
        setInventoryData(res.data.inventory);
      }
    } catch (error) {
      console.error("❌ Error fetching inventory:", error);
    }
  };

  // INITIAL FETCH
  useEffect(() => {
    getBloodGroupData();
    getBloodRecords();

    // OPTIONAL: Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      getBloodGroupData();
      getBloodRecords();
    }, 10000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <>
      <Header />

      {/* Refresh Button */}
      <div className="container mt-3 d-flex justify-content-between align-items-center">
        <h2>Blood Group Analytics</h2>
        <button className="btn btn-primary" onClick={() => {
          getBloodGroupData();
          getBloodRecords();
        }}>
          🔄 Refresh Analytics
        </button>
      </div>

      {/* Blood Analytics Cards */}
      <div className="d-flex flex-row flex-wrap">
        {data?.map((record, i) => (
          <div
            className="card m-2 p-1 text-white"
            key={i}
            style={{ width: "18rem", backgroundColor: colors[i % colors.length] }}
          >
            <div className="card-body">
              <h5 className="card-title bg-light text-dark text-center py-2">
                {record.bloodGroup}
              </h5>
              <p>Total In: <b>{record.totalIn}</b> ML</p>
              <p>Total Out: <b>{record.totalOut}</b> ML</p>
            </div>
            <div className="card-footer text-light bg-dark text-center">
              Available: <b>{record.availableBlood}</b> ML
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="container my-4">
        <h3>Recent Blood Transactions</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Inventory Type</th>
              <th>Quantity</th>
              <th>Email</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData?.map((record) => (
              <tr key={record._id}>
                <td>{record.bloodGroup}</td>
                <td>{record.inventoryType}</td>
                <td>{record.quantity} ML</td>
                <td>{record.email}</td>
                <td>{record.organisation?.email || "Unknown"}</td>

                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Analytics;

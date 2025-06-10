import React, { useState, useEffect } from "react";
import API from "../../services/API";
import moment from "moment";

const AdminAnalytics = () => {
  const [data, setData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const colors = [
    "#884A39", "#C38154", "#FFC26F", "#4F709C",
    "#4942E4", "#0079FF", "#FF0060", "#22A699",
  ];

  // Function to fetch blood group data
  const getBloodGroupData = async () => {
    try {
      const res = await API.get("/analytics/bloodGroups-data", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (res?.data?.success) {
        setData(res.data.bloodGroupData);
      }
    } catch (error) {
      console.error("Error fetching blood group data:", error);
    }
  };

  // Function to fetch recent inventory data
  const getBloodRecords = async () => {
    try {
      const res = await API.get("/analytics/get-recent-inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (res?.data?.success) {
        setInventoryData(res.data.inventory);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // UseEffect to fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        await getBloodGroupData();
        await getBloodRecords();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();

    // Refetch data every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading while fetching
  }

  return (
    <div className="mt-4">
      {/* Blood Group Analytics */}
      <div className="d-flex justify-content-between align-items-center">
        <h3>📊 Blood Group Analytics</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            getBloodGroupData();
            getBloodRecords();
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="d-flex flex-wrap">
        {data?.map((record, i) => (
          <div
            key={i}
            className="card text-white m-2 p-1"
            style={{
              width: "18rem",
              backgroundColor: colors[i % colors.length],
            }}
          >
            <div className="card-body">
              <h5 className="card-title bg-light text-dark text-center py-2">
                {record.bloodGroup}
              </h5>
              <p>Total In: <b>{record.totalIn}</b> ML</p>
              <p>Total Out: <b>{record.totalOut}</b> ML</p>
            </div>
            <div className="card-footer text-center bg-dark">
              Available: <b>{record.availableBlood}</b> ML
            </div>
          </div>
        ))}
      </div>

      {/* Recent Blood Transactions */}
      <h4 className="mt-4">🧾 Recent Blood Transactions</h4>
      <table className="table table-striped mt-2">
        <thead>
          <tr>
            <th>Blood Group</th>
            <th>Type</th>
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
              <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAnalytics;

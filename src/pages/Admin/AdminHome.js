import React from "react";
import Layout from "../../components/shared/Layout/Layout";
import { useSelector } from "react-redux";

const AdminHome = () => {
  const user = useSelector((state) => state.auth?.user || null);

  return (
    <Layout>
      <div className="container">
        <div className="d-felx flex-column mt-4">
          <h1>
            Welcome Admin{" "}
            <i className="text-success">{user?.name || "Guest"}</i>
          </h1>
          <h3>Manage Blood Bank App</h3>
          <hr />
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad
            explicabo animi blanditiis incidunt dicta quia, quibusdam facere
            corporis! Dolores...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;

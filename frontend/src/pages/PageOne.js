import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api"; // ✅ juiste import
import awsExports from "../aws-exports";
import { listItems } from "../graphql/queries";

// Configure Amplify
Amplify.configure(awsExports);
const client = generateClient();

function PageOne() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
    try {
        const result = await client.graphql({ query: listItems });
        console.log("GraphQL response:", result);
        setItems(result.data.listItems); // ✅ dit moet erbij
    } catch (err) {
        console.error("Error fetching items", err);
    } finally {
        setLoading(false);
    }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <h2>Page One - Items</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Naam</th>
              <th>Beschrijving</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PageOne;

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getBottleData() {
  try {
    const response = await fetch(`${API_URL}/bottle`);
    if (!response.ok) throw new Error("Failed to fetch bottle data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching bottle data:", error);
    return null;
  }
}

export async function updateBottleData(updates) {
  try {
    const response = await fetch(`${API_URL}/bottle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update bottle data");
    return await response.json();
  } catch (error) {
    console.error("Error updating bottle data:", error);
    return null;
  }
}

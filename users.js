/**
 * User-related functionality for Luzmo API
 */

import https from "https";

/**
 * Fetch all users in an organization
 * @param {Object} client - Luzmo client instance
 * @param {string} orgId - Organization ID
 * @returns {Promise<void>}
 */
export async function getUsers(client, orgId) {
  try {
    const org = await client.get("organization", {
      where: { id: orgId },
      include: [{ model: "User" }],
    });
    console.log(JSON.stringify(org.rows[0].users, null, 2));
  } catch (err) {
    console.error(`Error fetching users`, err.message || err);
    throw err;
  }
}

/**
 * Fetch user by email address
 * @param {Object} client - Luzmo client instance
 * @param {string} orgId - Organization ID
 * @param {string} email - User email address
 * @returns {Promise<void>}
 */
export async function getUserByEmail(client, orgId, email) {
  try {
    const org = await client.get("organization", {
      where: { id: orgId },
      include: [{ model: "User" }],
    });
    const user = org.rows[0].users.find((u) => u.email === email);
    if (user) {
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log(`User with email "${email}" not found.`);
    }
  } catch (err) {
    console.error(`Error fetching user by email`, err.message || err);
    throw err;
  }
}

/**
 * Promote a user to admin role in an organization
 * @param {string} apiKey - Luzmo API key
 * @param {string} apiToken - Luzmo API token
 * @param {string} userId - User ID to promote
 * @param {string} orgId - Organization ID
 * @returns {Promise<void>}
 */
export async function promoteUserToAdmin(apiKey, apiToken, userId, orgId) {
  try {
    const payload = {
      version: "0.1.0",
      action: "associate",
      key: apiKey,
      token: apiToken,
      id: userId,
      resource: {
        role: "Organizations",
        id: orgId,
      },
      properties: {
        flagMember: true,
        flagEditor: true,
        flagOwn: true,
        flagAdmin: true,
      },
    };

    const postData = JSON.stringify(payload);

    const options = {
      hostname: "api.luzmo.com",
      port: 443,
      path: "/0.1.0/user",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(JSON.parse(data));
          }
        });
      });

      req.on("error", reject);
      req.write(postData);
      req.end();
    });

    console.log(`✔ promoted user ${userId} to admin`);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`✖ error promoting user ${userId} to admin:`, err.message || err);
    throw err;
  }
}

/**
 * Assign full rights on a securable to a user
 * @param {Object} client - Luzmo client instance
 * @param {Object} securable - Securable object with id property
 * @param {string} userId - Target user ID
 * @returns {Promise<void>}
 */
export async function assignFullRights(client, securable, userId) {
  const id = securable.id;
  try {
    await client.associate(
      "securable",
      id,
      { role: "Users", id: userId },
      {
        flagRead: true,
        flagUse: true,
        flagModify: true,
        flagOwn: true,
      },
    );
    console.log(`✔ granted full rights on ${id}`);
  } catch (err) {
    console.error(`✖ error on ${id}:`, err.message || err);
  }
}

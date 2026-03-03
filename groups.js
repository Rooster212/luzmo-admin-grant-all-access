/**
 * Group-related functionality for Luzmo API
 */

/**
 * Fetch all groups
 * @param {Object} client - Luzmo client instance
 * @returns {Promise<void>}
 */
export async function getGroups(client) {
  try {
    const groups = await client.get("group", {
      attributes: ["id", "name"],
    });
    console.log(JSON.stringify(groups, null, 2));
  } catch (err) {
    console.error(`Error fetching groups`, err.message || err);
    throw err;
  }
}

/**
 * Update group name in multiple languages
 * @param {Object} client - Luzmo client instance
 * @param {string} groupId - Group ID
 * @param {Object} names - Object containing language codes and names (e.g., {en: "Admin", fr: "Administrateur"})
 * @returns {Promise<void>}
 */
export async function updateGroupName(client, groupId, names) {
  try {
    const response = await client.update('group', groupId, {
      name: names
    });
    console.log(`✔ Updated group ${groupId}`);
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(`✖ Error updating group ${groupId}:`, err.message || err);
    throw err;
  }
}

/**
 * Assign full rights on a securable to a group
 * @param {Object} client - Luzmo client instance
 * @param {Object} securable - Securable object with id property
 * @param {string} groupId - Target group ID
 * @returns {Promise<void>}
 */
export async function assignFullRightsToGroup(client, securable, groupId) {
  const id = securable.id;
  try {
    await client.associate(
      "securable",
      id,
      { role: "Groups", id: groupId },
      {
        flagRead: true,
        flagUse: true,
        flagModify: true,
        flagOwn: true,
      },
    );
    console.log(`✔ granted full rights on ${id} to group ${groupId}`);
  } catch (err) {
    console.error(`✖ error on ${id}:`, err.message || err);
  }
}

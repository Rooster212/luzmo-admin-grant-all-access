/**
 * Organization-related functionality for Luzmo API
 */

/**
 * Fetch organization details
 * @param {Object} client - Luzmo client instance
 * @returns {Promise<void>}
 */
export async function getOrganization(client) {
  try {
    const org = await client.get("organization", {
    });
    console.log(org);
  } catch (err) {
    console.error(`Error fetching organization`, err.message || err);
    throw err;
  }
}

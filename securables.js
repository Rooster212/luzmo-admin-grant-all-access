/**
 * Securable-related functionality for Luzmo API
 */

/**
 * Fetch all securables with pagination
 * @param {Object} client - Luzmo client instance
 * @returns {Promise<Array>} Array of all securables
 */
export async function listAllSecurables(client) {
  let all = [];
  let page = 0;
  const pageSize = 100;
  while (true) {
    console.log(`Fetching page ${page + 1} (offset: ${page * pageSize})...`);
    const res = await client.get("securable", {
      limit: pageSize,
      offset: page * pageSize,
    });
    console.log(`Response type: ${typeof res}, is array: ${Array.isArray(res)}`);
    console.log(`Response keys: ${Object.keys(res)}`);

    let items = [];
    if (Array.isArray(res)) {
      items = res;
    } else if (res && res.rows && Array.isArray(res.rows)) {
      items = res.rows;
    }

    console.log(`Got ${items.length} items on this page`);

    if (items.length === 0) break;

    items.forEach((item, idx) => {
      console.log(`  [${all.length + idx}] ID: ${item.id}, Type: ${item.type}, Name: ${item.name}`);
    });

    all.push(...items);
    if (items.length < pageSize) break;
    page++;
  }
  return all;
}

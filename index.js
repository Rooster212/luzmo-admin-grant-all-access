#!/usr/bin/env node

import dotenv from "dotenv";
import Luzmo from "@luzmo/nodejs-sdk";
import readline from "readline";
import https from "https";

dotenv.config();

const API_KEY = process.env.LUZMO_API_KEY;
const API_TOKEN = process.env.LUZMO_API_TOKEN;
const TARGET_USER_ID = process.env.TARGET_USER_ID;
const TARGET_ORG_ID = process.env.TARGET_ORG_ID;

const DRY_RUN = process.argv.includes("--dry-run");
const GET_USERS = process.argv.includes("--get-users");
const GET_ORG = process.argv.includes("--get-org");
const GET_USER_BY_EMAIL = process.argv.includes("--get-user-by-email");
const USER_EMAIL = process.argv[process.argv.indexOf("--get-user-by-email") + 1];
const PROMOTE_USER_TO_ADMIN = process.argv.includes("--promote-user-to-admin");

if (!API_KEY || !API_TOKEN) {
  console.error("Please set LUZMO_API_KEY and LUZMO_API_TOKEN.");
  process.exit(1);
}

// initialize client
const client = new Luzmo({
  api_key: API_KEY,
  api_token: API_TOKEN,
  host: "https://api.luzmo.com",
});

// helper to fetch *all* securables
async function listAllSecurables() {
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

async function getOrganization() {
  try {
    const org = await client.get("organization", {
    });
    console.log(org);
  } catch (err) {
    console.error(`Error fetching organization`, err.message || err);
    throw err;
  }
}
async function getUsers() {
  try {
    const org = await client.get("organization", {
      where: { id: TARGET_ORG_ID },
      include: [{ model: "User" }],
    });
    console.log(JSON.stringify(org.rows[0].users, null, 2));
  } catch (err) {
    console.error(`Error fetching users`, err.message || err);
    throw err;
  }
}

async function getUserByEmail(email) {
  try {
    const org = await client.get("organization", {
      where: { id: TARGET_ORG_ID },
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

async function promoteUserToAdmin(userId) {
  try {
    const payload = {
      version: "0.1.0",
      action: "associate",
      key: API_KEY,
      token: API_TOKEN,
      id: userId,
      resource: {
        role: "Organizations",
        id: TARGET_ORG_ID,
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

// assign max rights
async function assignFullRights(securable) {
  const id = securable.id;
  try {
    await client.associate(
      "securable",
      id,
      { role: "Users", id: TARGET_USER_ID },
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

(async () => {
  if (GET_ORG) {
    await getOrganization();
  } else if (GET_USERS) {
    console.log("Fetching users...");
    await getUsers();
  } else if (GET_USER_BY_EMAIL) {
    if (!USER_EMAIL) {
      console.error("Please provide an email: --get-user-by-email <email>");
      process.exit(1);
    }
    console.log(`Fetching user with email: ${USER_EMAIL}...`);
    await getUserByEmail(USER_EMAIL);
  } else if (PROMOTE_USER_TO_ADMIN) {
    if (!TARGET_USER_ID) {
      console.error("Please provide a user ID via TARGET_USER_ID environment variable.");
      process.exit(1);
    }
    console.log(`Promoting user ${TARGET_USER_ID} to admin...`);
    await promoteUserToAdmin(TARGET_USER_ID);
  } else {
    if (!TARGET_USER_ID) {
      console.error("Please set TARGET_USER_ID.");
      process.exit(1);
    }

    console.log("Fetching securables...");
    const securables = await listAllSecurables();
    console.log(`Found ${securables.length} securables.`);

    if (DRY_RUN) {
      console.log("\n[DRY RUN MODE] Listing securables:");
      securables.forEach((sec) => {
        console.log(`  - ID: ${sec.id}, Type: ${sec.type}, Name: ${sec.name}`);
      });
    } else {
      for (const sec of securables) {
        await assignFullRights(sec);
      }
    }
  }

  console.log("Done.");
})();

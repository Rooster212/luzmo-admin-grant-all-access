#!/usr/bin/env node

import dotenv from "dotenv";
import Luzmo from "@luzmo/nodejs-sdk";
import { getOrganization } from "./organization.js";
import { getUsers, getUserByEmail, promoteUserToAdmin, assignFullRights } from "./users.js";
import { getGroups, updateGroupName, assignFullRightsToGroup } from "./groups.js";
import { listAllSecurables } from "./securables.js";

dotenv.config();

const API_KEY = process.env.LUZMO_API_KEY;
const API_TOKEN = process.env.LUZMO_API_TOKEN;
const TARGET_USER_ID = process.env.TARGET_USER_ID;
const TARGET_ORG_ID = process.env.TARGET_ORG_ID;
const TARGET_GROUP_ID = process.env.TARGET_GROUP_ID;

const DRY_RUN = process.argv.includes("--dry-run");
const GET_USERS = process.argv.includes("--get-users");
const GET_GROUPS = process.argv.includes("--get-groups");
const GET_ORG = process.argv.includes("--get-org");
const GET_USER_BY_EMAIL = process.argv.includes("--get-user-by-email");
const USER_EMAIL = process.argv[process.argv.indexOf("--get-user-by-email") + 1];
const PROMOTE_USER_TO_ADMIN = process.argv.includes("--promote-user-to-admin");
const ASSIGN_TO_GROUP = process.argv.includes("--assign-to-group");
const UPDATE_GROUP_NAME = process.argv.includes("--update-group-name");

// Parse group update arguments
const UPDATE_GROUP_ID = process.argv.includes("--group-id")
  ? process.argv[process.argv.indexOf("--group-id") + 1]
  : null;
const GROUP_NAME_EN = process.argv.includes("--name-en")
  ? process.argv[process.argv.indexOf("--name-en") + 1]
  : null;
const GROUP_NAME_FR = process.argv.includes("--name-fr")
  ? process.argv[process.argv.indexOf("--name-fr") + 1]
  : null;
const GROUP_NAME_NL = process.argv.includes("--name-nl")
  ? process.argv[process.argv.indexOf("--name-nl") + 1]
  : null;
const GROUP_NAME_DE = process.argv.includes("--name-de")
  ? process.argv[process.argv.indexOf("--name-de") + 1]
  : null;
const GROUP_NAME_ES = process.argv.includes("--name-es")
  ? process.argv[process.argv.indexOf("--name-es") + 1]
  : null;

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

(async () => {
  if (GET_ORG) {
    await getOrganization(client);
  } else if (GET_USERS) {
    console.log("Fetching users...");
    await getUsers(client, TARGET_ORG_ID);
  } else if (GET_GROUPS) {
    console.log("Fetching groups...");
    await getGroups(client);
  } else if (GET_USER_BY_EMAIL) {
    if (!USER_EMAIL) {
      console.error("Please provide an email: --get-user-by-email <email>");
      process.exit(1);
    }
    console.log(`Fetching user with email: ${USER_EMAIL}...`);
    await getUserByEmail(client, TARGET_ORG_ID, USER_EMAIL);
  } else if (PROMOTE_USER_TO_ADMIN) {
    if (!TARGET_USER_ID) {
      console.error("Please provide a user ID via TARGET_USER_ID environment variable.");
      process.exit(1);
    }
    console.log(`Promoting user ${TARGET_USER_ID} to admin...`);
    await promoteUserToAdmin(API_KEY, API_TOKEN, TARGET_USER_ID, TARGET_ORG_ID);
  } else if (UPDATE_GROUP_NAME) {
    if (!UPDATE_GROUP_ID) {
      console.error("Please provide a group ID with --group-id <id>");
      process.exit(1);
    }

    const names = {};
    if (GROUP_NAME_EN) names.en = GROUP_NAME_EN;
    if (GROUP_NAME_FR) names.fr = GROUP_NAME_FR;
    if (GROUP_NAME_NL) names.nl = GROUP_NAME_NL;
    if (GROUP_NAME_DE) names.de = GROUP_NAME_DE;
    if (GROUP_NAME_ES) names.es = GROUP_NAME_ES;

    if (Object.keys(names).length === 0) {
      console.error("Please provide at least one language name (--name-en, --name-fr, --name-nl, --name-de, --name-es)");
      process.exit(1);
    }

    console.log(`Updating group ${UPDATE_GROUP_ID} with names:`, names);
    await updateGroupName(client, UPDATE_GROUP_ID, names);
  } else if (ASSIGN_TO_GROUP) {
    if (!TARGET_GROUP_ID) {
      console.error("Please set TARGET_GROUP_ID environment variable.");
      process.exit(1);
    }

    console.log("Fetching securables...");
    const securables = await listAllSecurables(client);
    console.log(`Found ${securables.length} securables.`);

    if (DRY_RUN) {
      console.log("\n[DRY RUN MODE] Listing securables to assign to group:");
      securables.forEach((sec) => {
        console.log(`  - ID: ${sec.id}, Type: ${sec.type}, Name: ${sec.name}`);
      });
    } else {
      console.log(`Assigning all securables to group ${TARGET_GROUP_ID}...`);
      for (const sec of securables) {
        await assignFullRightsToGroup(client, sec, TARGET_GROUP_ID);
      }
    }
  } else {
    if (!TARGET_USER_ID) {
      console.error("Please set TARGET_USER_ID.");
      process.exit(1);
    }

    console.log("Fetching securables...");
    const securables = await listAllSecurables(client);
    console.log(`Found ${securables.length} securables.`);

    if (DRY_RUN) {
      console.log("\n[DRY RUN MODE] Listing securables:");
      securables.forEach((sec) => {
        console.log(`  - ID: ${sec.id}, Type: ${sec.type}, Name: ${sec.name}`);
      });
    } else {
      for (const sec of securables) {
        await assignFullRights(client, sec, TARGET_USER_ID);
      }
    }
  }

  console.log("Done.");
})();

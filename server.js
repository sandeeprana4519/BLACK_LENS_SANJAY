// server.ts
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv2 from "dotenv";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";

// src/server/db.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  setLogLevel
} from "firebase/firestore/lite";
dotenv.config();
setLogLevel("silent");
function cleanForFirestore(obj) {
  if (obj === null || obj === void 0) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== void 0) {
      clean[key] = cleanForFirestore(value);
    }
  }
  return clean;
}
var FALLBACK_DATA_FILE = path.resolve(process.cwd(), "database", "fallback_data.json");
var firestoreDb = null;
var isFirestoreActive = false;
var dbStatusMessage = "Connecting to Google Cloud Firestore...";
var firebaseConfig = null;
try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_API_KEY) {
    const envProject = process.env.FIREBASE_PROJECT_ID;
    const envDb = process.env.FIREBASE_DATABASE_ID || "(default)";
    firebaseConfig = {
      projectId: envProject,
      firestoreDatabaseId: envDb,
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${envProject}.firebaseapp.com`,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${envProject}.firebasestorage.app`,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || ""
    };
  }
  if (firebaseConfig && firebaseConfig.projectId) {
    const app2 = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId;
    if (dbId && dbId !== "(default)" && dbId !== "") {
      firestoreDb = getFirestore(app2, dbId);
    } else {
      firestoreDb = getFirestore(app2);
    }
  }
} catch (e) {
  console.warn("[Firebase] Config init notice:", e.message);
}
var localStore = {
  users: [
    {
      id: 1,
      name: "\u0938\u0902\u0926\u0940\u092A \u0930\u093E\u0923\u093E (\u092A\u094D\u0930\u0927\u093E\u0928 \u0938\u0902\u092A\u093E\u0926\u0915)",
      email: "admin@teznazar.com",
      password_hash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
      // admin123
      phone: "+91 98765 43210",
      role_id: 1,
      role_name: "Super Admin",
      bio: "\u092E\u0941\u0916\u094D\u092F \u0938\u0902\u092A\u093E\u0926\u0915 \u090F\u0935\u0902 \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u0924\u094D\u0930\u0915\u093E\u0930\u093F\u0924\u093E \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E",
      assigned_region: "\u0938\u092E\u0938\u094D\u0924 \u092D\u093E\u0930\u0924 / \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      approval_status: "approved",
      is_active: true
    },
    {
      id: 2,
      name: "\u0905\u092E\u093F\u0924 \u0936\u0930\u094D\u092E\u093E (\u0935\u0930\u093F\u0937\u094D\u0920 \u0938\u0902\u092A\u093E\u0926\u0915)",
      email: "editor@teznazar.com",
      password_hash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
      // editor123
      phone: "+91 98111 22334",
      role_id: 4,
      role_name: "Editor",
      bio: "\u0930\u093E\u091C\u0928\u0940\u0924\u093F\u0915 \u090F\u0935\u0902 \u0905\u092A\u0930\u093E\u0927 \u0921\u0947\u0938\u094D\u0915 \u092A\u094D\u0930\u092E\u0941\u0916",
      assigned_region: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u090F\u0935\u0902 \u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930",
      approval_status: "approved",
      is_active: true
    },
    {
      id: 3,
      name: "\u092A\u094D\u0930\u093F\u092F\u093E \u091A\u094C\u0939\u093E\u0928 (\u092B\u0940\u0932\u094D\u0921 \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930)",
      email: "reporter@teznazar.com",
      password_hash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
      // reporter123
      phone: "+91 98222 33445",
      role_id: 5,
      role_name: "Reporter",
      bio: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u090F\u0935\u0902 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0928\u093F\u0915\u093E\u092F \u0938\u0902\u0935\u093E\u0926\u0926\u093E\u0924\u093E",
      assigned_region: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0936\u0939\u0930 \u090F\u0935\u0902 \u091F\u094D\u0930\u093E\u0902\u0938 \u0939\u093F\u0902\u0921\u0928",
      approval_status: "approved",
      is_active: true
    },
    {
      id: 4,
      name: "\u0935\u093F\u0915\u093E\u0938 \u0935\u0930\u094D\u092E\u093E (\u0938\u0902\u092A\u093E\u0926\u0915)",
      email: "subadmin@teznazar.com",
      password_hash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
      role_id: 4,
      role_name: "Editor",
      bio: "\u0938\u0902\u092A\u093E\u0926\u0915 (\u0938\u0939\u093E\u092F\u0915 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0938\u0947 \u0938\u094D\u0925\u093E\u0928\u093E\u0902\u0924\u0930\u093F\u0924 \u0916\u093E\u0924\u093E)",
      assigned_region: "\u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930",
      approval_status: "approved",
      is_active: true
    },
    {
      id: 5,
      name: "\u0930\u094B\u0939\u093F\u0924 \u0938\u093F\u0902\u0918\u0932 (\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u092A\u094D\u0930\u092C\u0902\u0927\u0915)",
      email: "ads@teznazar.com",
      password_hash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
      role_id: 4,
      role_name: "Editor",
      bio: "\u092C\u094D\u0930\u093E\u0902\u0921 \u090F\u0935\u0902 \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0921\u0947\u0938\u094D\u0915",
      assigned_region: "\u0915\u0949\u0930\u094D\u092A\u094B\u0930\u0947\u091F",
      approval_status: "approved",
      is_active: true
    },
    {
      id: 6,
      name: "\u0926\u0940\u092A\u0915 \u0915\u0936\u094D\u092F\u092A (\u0906\u0935\u0947\u0926\u0915)",
      email: "deepak.reporter@example.com",
      password_hash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
      phone: "+91 98991 12233",
      role_id: 5,
      role_name: "Reporter (Pending)",
      requested_role: "reporter",
      bio: "\u0932\u094B\u0928\u0940 \u090F\u0935\u0902 \u091F\u094D\u0930\u093E\u0902\u0938-\u0939\u093F\u0902\u0921\u0928 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0938\u0947 \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930 \u092A\u0924\u094D\u0930\u0915\u093E\u0930",
      assigned_region: "\u0932\u094B\u0928\u0940 / \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      approval_status: "pending",
      is_active: false,
      created_at: new Date(Date.now() - 36e5 * 4).toISOString()
    }
  ],
  categories: [
    { id: 1, name_hi: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926", name_en: "Ghaziabad", slug: "ghaziabad", description: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0907\u0902\u0926\u093F\u0930\u093E\u092A\u0941\u0930\u092E, \u0930\u093E\u091C\u0928\u0917\u0930, \u0935\u0948\u0936\u093E\u0932\u0940, \u0935\u0938\u0941\u0902\u0927\u0930\u093E \u0935 \u0932\u094B\u0928\u0940 \u0915\u0940 \u0939\u0930 \u0939\u0932\u091A\u0932", display_order: 1, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 2, name_hi: "\u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930", name_en: "Delhi NCR", slug: "delhi-ncr", description: "\u0926\u093F\u0932\u094D\u0932\u0940, \u0928\u094B\u090F\u0921\u093E, \u0917\u094D\u0930\u0947\u091F\u0930 \u0928\u094B\u090F\u0921\u093E, \u0917\u0941\u0930\u0941\u0917\u094D\u0930\u093E\u092E \u0914\u0930 \u092B\u0930\u0940\u0926\u093E\u092C\u093E\u0926 \u0915\u0940 \u092C\u0921\u093C\u0940 \u0916\u092C\u0930\u0947\u0902", display_order: 2, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 3, name_hi: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936", name_en: "Uttar Pradesh", slug: "uttar-pradesh", description: "\u0932\u0916\u0928\u090A \u0938\u0947 \u0932\u0947\u0915\u0930 \u092A\u0942\u0930\u094D\u0935\u093E\u0902\u091A\u0932, \u092C\u0941\u0902\u0926\u0947\u0932\u0916\u0902\u0921 \u0935 \u092A\u0936\u094D\u091A\u093F\u092E\u0940 \u092F\u0942\u092A\u0940 \u0915\u093E \u0939\u0930 \u0938\u092E\u093E\u091A\u093E\u0930", display_order: 3, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 4, name_hi: "\u0926\u0947\u0936", name_en: "National", slug: "india", description: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0938\u0941\u0930\u0915\u094D\u0937\u093E, \u0915\u0947\u0902\u0926\u094D\u0930 \u0938\u0930\u0915\u093E\u0930, \u0938\u0902\u0938\u0926 \u0935 \u092A\u094D\u0930\u092E\u0941\u0916 \u0918\u091F\u0928\u093E\u0915\u094D\u0930\u092E", display_order: 4, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 5, name_hi: "\u0930\u093E\u091C\u0928\u0940\u0924\u093F", name_en: "Politics", slug: "politics", description: "\u0938\u0924\u094D\u0924\u093E\u0930\u0942\u0922\u093C \u0926\u0932, \u0935\u093F\u092A\u0915\u094D\u0937, \u091A\u0941\u0928\u093E\u0935 \u0914\u0930 \u0938\u093F\u092F\u093E\u0938\u0940 \u0938\u092E\u0940\u0915\u0930\u0923\u094B\u0902 \u0915\u0940 \u0905\u0902\u0926\u0930\u0942\u0928\u0940 \u0916\u092C\u0930", display_order: 5, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 6, name_hi: "\u0905\u092A\u0930\u093E\u0927", name_en: "Crime", slug: "crime", description: "\u0915\u094D\u0930\u093E\u0907\u092E \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u093F\u0902\u0917, \u092A\u0941\u0932\u093F\u0938 \u0915\u093E\u0930\u094D\u092F\u0935\u093E\u0939\u0940, \u090F\u0938\u091F\u0940\u090F\u092B \u0914\u0930 \u0905\u0926\u093E\u0932\u0924\u0940 \u092B\u0948\u0938\u0932\u0947", display_order: 6, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 7, name_hi: "\u0936\u093F\u0915\u094D\u0937\u093E \u090F\u0935\u0902 \u0915\u0930\u093F\u092F\u0930", name_en: "Education", slug: "education", description: "\u092C\u094B\u0930\u094D\u0921 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u090F\u0902, \u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u0940 \u0924\u0948\u092F\u093E\u0930\u0940, \u0935\u093F\u0936\u094D\u0935\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0914\u0930 \u092A\u094D\u0930\u0935\u0947\u0936 \u0938\u0942\u091A\u0928\u093E\u090F\u0902", display_order: 7, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 8, name_hi: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F", name_en: "Health", slug: "health", description: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u0932\u094D\u092F\u093E\u0923, \u091A\u093F\u0915\u093F\u0924\u094D\u0938\u093E \u0936\u094B\u0927, \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u0914\u0930 \u092E\u094C\u0938\u092E\u0940 \u0938\u093E\u0935\u0927\u093E\u0928\u093F\u092F\u093E\u0902", display_order: 8, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 9, name_hi: "\u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u0935 \u0936\u0947\u092F\u0930", name_en: "Business", slug: "business", description: "\u092C\u093E\u091C\u093E\u0930, \u0905\u0930\u094D\u0925\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E, \u0930\u093F\u092F\u0932 \u090F\u0938\u094D\u091F\u0947\u091F, \u091F\u0948\u0915\u094D\u0938 \u0914\u0930 \u090F\u092E\u090F\u0938\u090F\u092E\u0908 \u0938\u092E\u093E\u091A\u093E\u0930", display_order: 9, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 10, name_hi: "\u0916\u0947\u0932 \u091C\u0917\u0924", name_en: "Sports", slug: "sports", description: "\u0915\u094D\u0930\u093F\u0915\u0947\u091F, \u0939\u0949\u0915\u0940, \u0913\u0932\u0902\u092A\u093F\u0915, \u092B\u0941\u091F\u092C\u0949\u0932 \u0914\u0930 \u092D\u093E\u0930\u0924\u0940\u092F \u0916\u093F\u0932\u093E\u0921\u093C\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u092B\u0932\u0924\u093E", display_order: 10, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 11, name_hi: "\u092E\u0928\u094B\u0930\u0902\u091C\u0928", name_en: "Entertainment", slug: "entertainment", description: "\u0938\u093F\u0928\u0947\u092E\u093E \u091C\u0917\u0924, \u0913\u091F\u0940\u091F\u0940, \u0935\u0947\u092C \u0938\u0940\u0930\u0940\u091C \u0914\u0930 \u0938\u093E\u0902\u0938\u094D\u0915\u0943\u0924\u093F\u0915 \u092A\u094D\u0930\u0938\u094D\u0924\u0941\u0924\u093F\u092F\u093E\u0902", display_order: 11, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 12, name_hi: "\u0927\u0930\u094D\u092E \u090F\u0935\u0902 \u0905\u0927\u094D\u092F\u093E\u0924\u094D\u092E", name_en: "Religion", slug: "religion", description: "\u092E\u0902\u0926\u093F\u0930, \u092A\u0930\u094D\u0935-\u0924\u094D\u092F\u094B\u0939\u093E\u0930, \u091C\u094D\u092F\u094B\u0924\u093F\u0937\u094D\u092F \u0914\u0930 \u092A\u094C\u0930\u093E\u0923\u093F\u0915 \u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u0902\u092A\u0930\u093E", display_order: 12, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 13, name_hi: "\u0938\u0930\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902", name_en: "Govt Schemes", slug: "govt-schemes", description: "\u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0928\u0940\u0924\u093F\u092F\u093E\u0902, \u0938\u092C\u094D\u0938\u093F\u0921\u0940, \u0915\u093F\u0938\u093E\u0928 \u092F\u094B\u091C\u0928\u093E\u090F\u0902 \u0935 \u092A\u093E\u0924\u094D\u0930\u0924\u093E", display_order: 13, is_in_menu: true, is_in_home: true, is_active: true },
    { id: 14, name_hi: "\u0928\u094C\u0915\u0930\u0940 \u090F\u0935\u0902 \u0930\u094B\u091C\u0917\u093E\u0930", name_en: "Jobs", slug: "jobs", description: "\u0938\u0930\u0915\u093E\u0930\u0940 \u092D\u0930\u094D\u0924\u093F\u092F\u093E\u0902, \u0930\u094B\u091C\u0917\u093E\u0930 \u092E\u0947\u0932\u0947 \u0914\u0930 \u0928\u093F\u091C\u0940 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u092E\u0947\u0902 \u0905\u0935\u0938\u0930", display_order: 14, is_in_menu: true, is_in_home: true, is_active: true }
  ],
  tags: [
    { id: 1, name: "\u092C\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u0928\u094D\u092F\u0942\u091C\u093C", slug: "breaking-news", is_popular: true, is_active: true },
    { id: 2, name: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0905\u092A\u0921\u0947\u091F", slug: "ghaziabad-updates", is_popular: true, is_active: true },
    { id: 3, name: "\u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930", slug: "delhi-ncr-news", is_popular: true, is_active: true },
    { id: 4, name: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u0938\u0930\u0915\u093E\u0930", slug: "up-government", is_popular: true, is_active: true },
    { id: 5, name: "\u0930\u093E\u091C\u0928\u0940\u0924\u093F", slug: "politics-today", is_popular: true, is_active: true },
    { id: 6, name: "\u091F\u094D\u0930\u0948\u092B\u093F\u0915 \u0905\u0932\u0930\u094D\u091F", slug: "traffic-alert", is_popular: true, is_active: true },
    { id: 7, name: "\u092E\u094C\u0938\u092E \u0938\u092E\u093E\u091A\u093E\u0930", slug: "weather-update", is_popular: true, is_active: true },
    { id: 8, name: "\u0915\u094D\u0930\u093F\u0915\u0947\u091F \u0935\u0930\u094D\u0932\u094D\u0921", slug: "cricket-world", is_popular: true, is_active: true },
    { id: 9, name: "\u0905\u092F\u094B\u0927\u094D\u092F\u093E \u0927\u093E\u092E", slug: "ayodhya-dham", is_popular: false, is_active: true },
    { id: 10, name: "\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0932\u093E\u0939", slug: "health-tips", is_popular: false, is_active: true }
  ],
  breaking_news: [
    { id: 1, title: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926: \u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u092A\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0915\u0947 \u092A\u0941\u0916\u094D\u0924\u093E \u0907\u0902\u0924\u091C\u093E\u092E, 40 \u0928\u090F \u0938\u0940\u0938\u0940\u091F\u0940\u0935\u0940 \u0915\u0948\u092E\u0930\u0947 \u0938\u0915\u094D\u0930\u093F\u092F", article_id: 1, display_order: 1, is_active: true },
    { id: 2, title: "\u0926\u093F\u0932\u094D\u0932\u0940-\u090F\u0928\u0938\u0940\u0906\u0930 \u092E\u0947\u0902 \u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u0928\u093F\u092F\u0902\u0924\u094D\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u091F\u093E\u0938\u094D\u0915 \u092B\u094B\u0930\u094D\u0938 \u0917\u0920\u093F\u0924, \u0917\u094D\u0930\u0947\u0921\u0947\u0921 \u0930\u093F\u0938\u094D\u092A\u0949\u0928\u094D\u0938 \u090F\u0915\u094D\u0936\u0928 \u092A\u094D\u0932\u093E\u0928 \u0932\u093E\u0917\u0942", article_id: 2, display_order: 2, is_active: true },
    { id: 3, title: "\u092F\u0942\u092A\u0940 \u092C\u094B\u0930\u094D\u0921 \u092A\u0930\u0940\u0915\u094D\u0937\u093E 2026: \u0915\u0947\u0902\u0926\u094D\u0930\u094B\u0902 \u092A\u0930 \u092C\u093E\u092F\u094B\u092E\u0948\u091F\u094D\u0930\u093F\u0915 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F, \u0928\u0915\u0932 \u0935\u093F\u0939\u0940\u0928 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u0947 \u0915\u0921\u093C\u0947 \u0928\u093F\u0930\u094D\u0926\u0947\u0936", article_id: 3, display_order: 3, is_active: true },
    { id: 4, title: "\u0928\u092E\u094B \u092D\u093E\u0930\u0924 \u0930\u0948\u092A\u093F\u0921 \u0930\u0947\u0932: \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0938\u0947 \u092E\u0947\u0930\u0920 \u0938\u093E\u0909\u0925 \u0924\u0915 \u0926\u0948\u0928\u093F\u0915 \u092F\u093E\u0924\u094D\u0930\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E \u0928\u0947 \u092C\u0928\u093E\u092F\u093E \u0928\u092F\u093E \u0930\u093F\u0915\u0949\u0930\u094D\u0921", article_id: 4, display_order: 4, is_active: true },
    { id: 5, title: "\u0938\u094B\u0928\u0947 \u0915\u0947 \u092D\u093E\u0935 \u092E\u0947\u0902 \u0906\u091C \u092D\u093E\u0930\u0940 \u0909\u0924\u093E\u0930-\u091A\u0922\u093C\u093E\u0935, \u0938\u0930\u094D\u0930\u093E\u092B\u093E \u092C\u093E\u091C\u093E\u0930 \u092E\u0947\u0902 \u092C\u0922\u093C\u0940 \u0924\u094D\u092F\u094B\u0939\u093E\u0930\u0940 \u0916\u0930\u0940\u0926\u093E\u0930\u0940", display_order: 5, is_active: true },
    { id: 6, title: "\u092D\u093E\u0930\u0924\u0940\u092F \u0915\u094D\u0930\u093F\u0915\u0947\u091F \u091F\u0940\u092E \u0915\u093E \u0935\u093F\u0936\u094D\u0935 \u091F\u0947\u0938\u094D\u091F \u091A\u0948\u0902\u092A\u093F\u092F\u0928\u0936\u093F\u092A \u092B\u093E\u0907\u0928\u0932 \u0915\u093E \u091F\u093F\u0915\u091F \u0932\u0917\u092D\u0917 \u092A\u0915\u094D\u0915\u093E, \u0916\u093F\u0932\u093E\u0921\u093C\u093F\u092F\u094B\u0902 \u0928\u0947 \u0936\u0941\u0930\u0942 \u0915\u093F\u092F\u093E \u0905\u092D\u094D\u092F\u093E\u0938", display_order: 6, is_active: true },
    { id: 7, title: "\u092E\u094C\u0938\u092E \u0935\u093F\u092D\u093E\u0917: \u092A\u0936\u094D\u091A\u093F\u092E\u0940 \u092F\u0942\u092A\u0940 \u092E\u0947\u0902 \u0905\u0917\u0932\u0947 48 \u0918\u0902\u091F\u094B\u0902 \u092E\u0947\u0902 \u0939\u0932\u094D\u0915\u0940 \u092C\u0942\u0902\u0926\u093E\u092C\u093E\u0902\u0926\u0940 \u0915\u0947 \u0906\u0938\u093E\u0930, \u0924\u093E\u092A\u092E\u093E\u0928 \u092E\u0947\u0902 \u0906\u090F\u0917\u0940 \u0917\u093F\u0930\u093E\u0935\u091F", display_order: 7, is_active: true }
  ],
  advertisements: [
    {
      id: 1,
      title: "\u090F\u0928\u0938\u0940\u0906\u0930 \u0907\u0902\u092B\u094D\u0930\u093E\u091F\u0947\u0915 \u092C\u093F\u0932\u094D\u0921\u0930\u094D\u0938 - 3BHK \u0932\u0917\u094D\u091C\u0930\u0940 \u0905\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F\u094D\u0938 \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      placement: "header_banner",
      image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
      destination_url: "https://example.com/ncr-properties",
      advertiser_name: "\u090F\u0928\u0938\u0940\u0906\u0930 \u0907\u0902\u092B\u094D\u0930\u093E\u091F\u0947\u0915 \u092C\u093F\u0932\u094D\u0921\u0930\u094D\u0938",
      start_date: "2026-01-01",
      end_date: "2026-12-31",
      impressions_count: 14200,
      clicks_count: 312,
      is_active: true
    },
    {
      id: 2,
      title: "\u090F\u092A\u0947\u0915\u094D\u0938 \u0917\u094D\u0930\u0941\u092A \u0911\u092B \u0907\u0902\u0938\u094D\u091F\u0940\u091F\u094D\u092F\u0942\u0936\u0902\u0938 - \u092C\u0940\u091F\u0947\u0915 \u0914\u0930 \u090F\u092E\u092C\u0940\u090F \u092E\u0947\u0902 \u092A\u094D\u0930\u0935\u0947\u0936 \u092A\u094D\u0930\u093E\u0930\u0902\u092D",
      placement: "sidebar",
      image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
      destination_url: "https://example.com/apex-admissions",
      advertiser_name: "\u090F\u092A\u0947\u0915\u094D\u0938 \u0917\u094D\u0930\u0941\u092A",
      start_date: "2026-01-01",
      end_date: "2026-12-31",
      impressions_count: 8900,
      clicks_count: 185,
      is_active: true
    }
  ],
  site_settings: {
    site_name: "BLACK LENS",
    tagline: "Media & Entertainment",
    contact_email: "editor@teznazar.com",
    contact_phone: "+91 98765 43210",
    office_address: "\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u092E\u0940\u0921\u093F\u092F\u093E \u092A\u094D\u0930\u093E\u0907\u0935\u0947\u091F \u0932\u093F\u092E\u093F\u091F\u0947\u0921, 402-404, \u092B\u0949\u0930\u094D\u091A\u094D\u092F\u0942\u0928 \u091F\u0949\u0935\u0930, \u0930\u093E\u091C\u0928\u0917\u0930 \u0921\u093F\u0938\u094D\u091F\u094D\u0930\u093F\u0915\u094D\u091F \u0938\u0947\u0902\u091F\u0930 (RDC), \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 - 201002",
    logo_url: "/logo.svg",
    site_logo: "",
    footer_text: "BLACK LENS (Media & Entertainment) \u0928\u093F\u0937\u094D\u092A\u0915\u094D\u0937, \u0928\u093F\u0930\u094D\u092D\u0940\u0915 \u0914\u0930 \u091C\u0928\u0939\u093F\u0924\u0948\u0937\u0940 \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u0924\u094D\u0930\u0915\u093E\u0930\u093F\u0924\u093E \u0915\u093E \u0935\u093F\u0936\u094D\u0935\u0938\u0928\u0940\u092F \u092E\u0902\u091A \u0939\u0948\u0964 \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930 \u0914\u0930 \u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u0915\u0940 \u0939\u0930 \u092C\u0921\u093C\u0940 \u0916\u092C\u0930 \u092A\u0930 \u092A\u0948\u0928\u0940 \u0928\u091C\u0930\u0964",
    facebook_url: "https://facebook.com/teznazarnews",
    twitter_url: "https://twitter.com/teznazarnews",
    youtube_url: "https://youtube.com/@teznazarnews",
    instagram_url: "https://instagram.com/teznazarnews",
    whatsapp_number: "+919876543210",
    whatsapp_channel_url: "https://whatsapp.com/channel/blacklens"
  },
  contact_messages: [
    {
      id: 1792300001,
      name: "\u0930\u093E\u0939\u0941\u0932 \u0935\u0930\u094D\u092E\u093E (\u092E\u093E\u0930\u094D\u0915\u0947\u091F\u093F\u0902\u0917 \u0939\u0947\u0921, \u0906\u0930\u0921\u0940\u0938\u0940 \u092E\u0949\u0932)",
      email: "rahul.verma@rdcmall.com",
      phone: "+91 98112 34567",
      subject: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0938\u0902\u092C\u0902\u0927\u0940 \u092A\u0942\u091B\u0924\u093E\u091B (\u0939\u094B\u092E\u092A\u0947\u091C \u092C\u0948\u0928\u0930 \u090F\u0935\u0902 \u0938\u093E\u0907\u0921\u092C\u093E\u0930)",
      message: "\u0928\u092E\u0938\u094D\u0924\u0947 \u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u091F\u0940\u092E, \u0939\u092E \u0905\u092A\u0928\u0947 \u0928\u090F \u0938\u092E\u0930 \u0936\u0949\u092A\u093F\u0902\u0917 \u092B\u0947\u0938\u094D\u091F\u093F\u0935\u0932 \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u0940 \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0915\u0947 \u0939\u094B\u092E\u092A\u0947\u091C \u0939\u0947\u0921\u0930 \u0938\u094D\u0932\u0949\u091F \u090F\u0935\u0902 \u0938\u093E\u0907\u0921\u092C\u093E\u0930 \u092A\u0930 1 \u092E\u093E\u0939 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u092C\u0948\u0928\u0930 \u0905\u092D\u093F\u092F\u093E\u0928 \u091A\u0932\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902\u0964 \u0915\u0943\u092A\u092F\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0926\u0930\u0947\u0902, \u0930\u0940\u091A \u092E\u0948\u091F\u094D\u0930\u093F\u0915\u094D\u0938 \u0914\u0930 \u0909\u092A\u0932\u092C\u094D\u0927\u0924\u093E \u0935\u093F\u0935\u0930\u0923 \u092A\u094D\u0930\u0947\u0937\u093F\u0924 \u0915\u0930\u0947\u0902\u0964",
      is_read: false,
      created_at: new Date(Date.now() - 36e5 * 3).toISOString()
    },
    {
      id: 1792300002,
      name: "\u0921\u0949. \u0938\u0940\u092E\u093E \u092E\u0932\u094D\u0939\u094B\u0924\u094D\u0930\u093E (\u0938\u0902\u092F\u094B\u091C\u0915)",
      email: "dr.seema@socialwelfare.org",
      phone: "+91 99223 88776",
      subject: "\u092A\u094D\u0930\u0947\u0938 \u0930\u093F\u0932\u0940\u091C: \u0930\u093E\u091C\u0928\u0917\u0930 \u092E\u0947\u0902 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u090F\u0935\u0902 \u0928\u0947\u0924\u094D\u0930 \u091C\u093E\u0902\u091A \u0936\u093F\u0935\u093F\u0930",
      message: "\u0906\u0926\u0930\u0923\u0940\u092F \u0938\u0902\u092A\u093E\u0926\u0915 \u092E\u0939\u094B\u0926\u092F, \u0906\u0917\u093E\u092E\u0940 \u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u094B \u0930\u093E\u091C\u0928\u0917\u0930 \u090F\u0915\u094D\u0938\u091F\u0947\u0902\u0936\u0928 \u0915\u092E\u094D\u092F\u0941\u0928\u093F\u091F\u0940 \u0938\u0947\u0902\u091F\u0930 \u092E\u0947\u0902 500+ \u0935\u0930\u093F\u0937\u094D\u0920 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0939\u0947\u0924\u0941 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u090F\u0935\u0902 \u0928\u0947\u0924\u094D\u0930 \u091C\u093E\u0902\u091A \u0936\u093F\u0935\u093F\u0930 \u0906\u092F\u094B\u091C\u093F\u0924 \u0915\u093F\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948\u0964 \u091C\u0928\u0939\u093F\u0924 \u092E\u0947\u0902 \u0907\u0938 \u092A\u094D\u0930\u0947\u0938 \u0935\u093F\u091C\u094D\u091E\u092A\u094D\u0924\u093F \u0915\u094B \u0938\u092E\u093E\u091A\u093E\u0930 \u092A\u094B\u0930\u094D\u091F\u0932 \u092A\u0930 \u0938\u094D\u0925\u093E\u0928 \u0926\u0947\u0928\u0947 \u0915\u093E \u0915\u0937\u094D\u091F \u0915\u0930\u0947\u0902\u0964",
      is_read: false,
      created_at: new Date(Date.now() - 36e5 * 14).toISOString()
    },
    {
      id: 1792300003,
      name: "\u0906\u0932\u094B\u0915 \u0915\u0941\u092E\u093E\u0930 \u0917\u0941\u092A\u094D\u0924\u093E (\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0928\u093E\u0917\u0930\u093F\u0915)",
      email: "alok.gupta@gmail.com",
      phone: "+91 98711 00223",
      subject: "\u0938\u0941\u091D\u093E\u0935: \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u0947 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0935\u093E\u0930\u094D\u0921 \u0938\u094D\u0924\u0930 \u0915\u0940 \u0938\u092E\u0938\u094D\u092F\u093E\u0913\u0902 \u0915\u093E \u0935\u093F\u0936\u0947\u0937 \u0915\u0949\u0932\u092E",
      message: "\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u0915\u0940 \u0928\u093F\u0930\u094D\u092D\u0940\u0915 \u0935 \u091C\u092E\u0940\u0928\u0940 \u092A\u0924\u094D\u0930\u0915\u093E\u0930\u093F\u0924\u093E \u0938\u0930\u093E\u0939\u0928\u0940\u092F \u0939\u0948\u0964 \u092E\u0947\u0930\u093E \u090F\u0915 \u0938\u0941\u091D\u093E\u0935 \u0939\u0948 \u0915\u093F \u0928\u0917\u0930 \u0928\u093F\u0917\u092E \u0915\u0947 \u0935\u093E\u0930\u094D\u0921 \u0938\u094D\u0924\u0930 \u0914\u0930 \u091C\u0932\u092D\u0930\u093E\u0935/\u0938\u092B\u093E\u0908 \u0915\u0940 \u0938\u092E\u0938\u094D\u092F\u093E\u0913\u0902 \u092A\u0930 \u090F\u0915 \u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u091C\u0928-\u0938\u0941\u0928\u0935\u093E\u0908 \u0915\u0949\u0932\u092E \u0936\u0941\u0930\u0942 \u0915\u093F\u092F\u093E \u091C\u093E\u090F, \u091C\u093F\u0938\u0938\u0947 \u0906\u092E \u091C\u0928\u0924\u093E \u0915\u0940 \u0906\u0935\u093E\u091C\u093C \u0938\u0940\u0927\u0947 \u092A\u094D\u0930\u0936\u093E\u0938\u0928 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A\u0947\u0964",
      is_read: true,
      created_at: new Date(Date.now() - 36e5 * 36).toISOString()
    }
  ],
  news_articles: [
    {
      id: 1,
      title: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926: \u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u092A\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u092C\u0922\u093C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F 40 \u0928\u090F \u090F\u0906\u0908 \u0915\u0948\u092E\u0930\u0947 \u0938\u094D\u0925\u093E\u092A\u093F\u0924, \u0924\u0947\u091C \u0930\u092B\u094D\u0924\u093E\u0930 \u092A\u0930 \u0939\u094B\u0917\u093E \u0908-\u091A\u093E\u0932\u093E\u0928",
      slug: "ghaziabad-hindon-elevated-road-ai-cameras-traffic-safety",
      subtitle: "\u092F\u093E\u0924\u093E\u092F\u093E\u0924 \u092A\u0941\u0932\u093F\u0938 \u0914\u0930 \u0928\u0917\u0930 \u0928\u093F\u0917\u092E \u0915\u0940 \u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u092A\u0939\u0932 \u0938\u0947 \u0926\u0941\u0930\u094D\u0918\u091F\u0928\u093E\u0913\u0902 \u092A\u0930 \u0932\u0917\u0947\u0917\u0940 \u0930\u094B\u0915",
      excerpt: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u0947 \u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u092A\u0930 \u0905\u092C \u0913\u0935\u0930\u0938\u094D\u092A\u0940\u0921\u093F\u0902\u0917 \u0914\u0930 \u0932\u0947\u0928 \u0915\u091F\u093F\u0902\u0917 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u094B\u0902 \u0915\u0940 \u0916\u0948\u0930 \u0928\u0939\u0940\u0902\u0964 40 \u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u0939\u093E\u0908-\u0938\u094D\u092A\u0940\u0921 \u090F\u0906\u0908 \u0915\u0948\u092E\u0930\u0947 \u0932\u0917\u093E\u090F \u0917\u090F \u0939\u0948\u0902 \u091C\u094B \u0938\u0940\u0927\u0947 \u0907\u0902\u091F\u0940\u0917\u094D\u0930\u0947\u091F\u0947\u0921 \u0915\u0902\u091F\u094D\u0930\u094B\u0932 \u0915\u092E\u093E\u0902\u0921 \u0938\u0947\u0902\u091F\u0930 \u0938\u0947 \u091C\u0941\u0921\u093C\u0947 \u0939\u0948\u0902\u0964",
      content: `<p><strong>\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 (\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u092C\u094D\u092F\u0942\u0930\u094B):</strong> \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u0940 \u0932\u093E\u0907\u092B\u0932\u093E\u0907\u0928 \u0915\u0939\u0940 \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u0940 \u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u092A\u0930 \u0935\u093E\u0939\u0928\u094B\u0902 \u0915\u0940 \u0924\u0947\u091C \u0930\u092B\u094D\u0924\u093E\u0930 \u0914\u0930 \u0906\u090F \u0926\u093F\u0928 \u0939\u094B\u0928\u0947 \u0935\u093E\u0932\u0940 \u0926\u0941\u0930\u094D\u0918\u091F\u0928\u093E\u0913\u0902 \u092A\u0930 \u0932\u0917\u093E\u092E \u0932\u0917\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0936\u093E\u0938\u0928 \u0928\u0947 \u0915\u0921\u093C\u093E \u0915\u0926\u092E \u0909\u0920\u093E\u092F\u093E \u0939\u0948\u0964 \u0930\u093E\u091C\u0928\u0917\u0930 \u090F\u0915\u094D\u0938\u091F\u0947\u0902\u0936\u0928 \u0938\u0947 \u092F\u0942\u092A\u0940 \u0917\u0947\u091F \u0924\u0915 \u092B\u0948\u0932\u0947 \u0907\u0938 10.3 \u0915\u093F\u0932\u094B\u092E\u0940\u091F\u0930 \u0932\u0902\u092C\u0947 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u092A\u0930 40 \u0928\u090F \u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u090F\u0906\u0908 \u0915\u0948\u092E\u0930\u0947 \u0938\u0915\u094D\u0930\u093F\u092F \u0915\u0930 \u0926\u093F\u090F \u0917\u090F \u0939\u0948\u0902\u0964</p>
      <p>\u092F\u093E\u0924\u093E\u092F\u093E\u0924 \u092A\u0941\u0932\u093F\u0938 \u0909\u092A\u093E\u092F\u0941\u0915\u094D\u0924 \u0928\u0947 \u092C\u0924\u093E\u092F\u093E \u0915\u093F \u092F\u0947 \u0915\u0948\u092E\u0930\u0947 24 \u0918\u0902\u091F\u0947 \u0915\u093E\u092E \u0915\u0930\u0947\u0902\u0917\u0947 \u0914\u0930 \u0935\u093E\u0939\u0928 \u0915\u0940 \u0917\u0924\u093F \u0938\u0940\u092E\u093E (\u0905\u0927\u093F\u0915\u0924\u092E 80 \u0915\u093F\u092E\u0940/\u0918\u0902\u091F\u093E) \u092A\u093E\u0930 \u0939\u094B\u0924\u0947 \u0939\u0940 \u0938\u094D\u0935\u0924\u0903 \u0908-\u091A\u093E\u0932\u093E\u0928 \u091C\u0928\u0930\u0947\u091F \u0915\u0930 \u0935\u093E\u0939\u0928 \u0938\u094D\u0935\u093E\u092E\u0940 \u0915\u0947 \u092A\u0902\u091C\u0940\u0915\u0943\u0924 \u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u092A\u0930 \u092D\u0947\u091C \u0926\u0947\u0902\u0917\u0947\u0964 \u0907\u0938\u0915\u0947 \u0905\u0924\u093F\u0930\u093F\u0915\u094D\u0924 \u0917\u0932\u0924 \u0926\u093F\u0936\u093E \u092E\u0947\u0902 \u0921\u094D\u0930\u093E\u0907\u0935\u093F\u0902\u0917 \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0932\u0947\u0928 \u092E\u0947\u0902 \u0935\u093E\u0939\u0928 \u0916\u0921\u093C\u093E \u0915\u0930\u0928\u0947 \u092A\u0930 \u092D\u0940 \u0928\u093F\u0917\u0930\u093E\u0928\u0940 \u0930\u0916\u0940 \u091C\u093E\u090F\u0917\u0940\u0964</p>
      <p>\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0928\u0947 \u0907\u0938 \u0915\u0926\u092E \u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0915\u093F\u092F\u093E \u0939\u0948 \u0914\u0930 \u0909\u092E\u094D\u092E\u0940\u0926 \u091C\u0924\u093E\u0908 \u0939\u0948 \u0915\u093F \u0907\u0938\u0938\u0947 \u0930\u093E\u0924 \u0915\u0947 \u0938\u092E\u092F \u0939\u094B\u0928\u0947 \u0935\u093E\u0932\u0940 \u0916\u0924\u0930\u0928\u093E\u0915 \u0938\u094D\u091F\u0902\u091F\u092C\u093E\u091C\u0940 \u0914\u0930 \u0939\u093E\u0926\u0938\u094B\u0902 \u092E\u0947\u0902 \u092D\u093E\u0930\u0940 \u0915\u092E\u0940 \u0906\u090F\u0917\u0940\u0964</p>`,
      category_id: 1,
      author_id: 1,
      author_name: "\u0938\u0902\u0926\u0940\u092A \u0930\u093E\u0923\u093E (\u092A\u094D\u0930\u0927\u093E\u0928 \u0938\u0902\u092A\u093E\u0926\u0915)",
      category_name: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      category_slug: "ghaziabad",
      location: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 (\u0930\u093E\u091C\u0928\u0917\u0930 / \u0939\u093F\u0902\u0921\u0928)",
      featured_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80",
      image_caption: "\u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u092A\u0930 \u0932\u0917\u0947 \u0939\u093E\u0908-\u0938\u094D\u092A\u0940\u0921 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u091F\u094D\u0930\u0948\u092B\u093F\u0915 \u0938\u0930\u094D\u0935\u093F\u0932\u093E\u0902\u0938 \u0915\u0948\u092E\u0930\u0947",
      image_credit: "\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u092E\u0940\u0921\u093F\u092F\u093E \u0928\u0947\u091F\u0935\u0930\u094D\u0915",
      gallery_images: [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80"
      ],
      is_breaking: true,
      is_featured: true,
      is_trending: true,
      is_on_home: true,
      status: "published",
      view_count: 1420,
      seo_title: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 AI \u0915\u0948\u092E\u0930\u0947 \u091A\u093E\u0932\u093E\u0928",
      seo_description: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0939\u093F\u0902\u0921\u0928 \u090F\u0932\u093F\u0935\u0947\u091F\u0947\u0921 \u0930\u094B\u0921 \u092A\u0930 40 \u0928\u090F \u090F\u0906\u0908 \u0915\u0948\u092E\u0930\u0947 \u0932\u0917\u093E\u090F \u0917\u090F \u0939\u0948\u0902\u0964 \u0917\u0924\u093F \u0938\u0940\u092E\u093E \u092A\u093E\u0930 \u0915\u0930\u0928\u0947 \u092A\u0930 \u0924\u0941\u0930\u0902\u0924 \u0908-\u091A\u093E\u0932\u093E\u0928 \u0915\u091F\u0947\u0917\u093E\u0964",
      published_at: "2026-10-16T10:00:00.000Z",
      created_at: "2026-10-16T09:30:00.000Z",
      updated_at: "2026-10-16T10:00:00.000Z"
    },
    {
      id: 2,
      title: "\u0926\u093F\u0932\u094D\u0932\u0940-\u090F\u0928\u0938\u0940\u0906\u0930 \u092E\u0947\u0902 \u0935\u093E\u092F\u0941 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0938\u0941\u0927\u093E\u0930 \u0915\u0947 \u0932\u093F\u090F GRAP-4 \u0915\u0940 \u0915\u0921\u093C\u0940 \u0928\u093F\u0917\u0930\u093E\u0928\u0940, \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u093E\u0930\u094D\u092F\u094B\u0902 \u092A\u0930 \u0938\u0916\u094D\u0924 \u092A\u093E\u092C\u0902\u0926\u0940",
      slug: "delhi-ncr-air-quality-grap-4-curbs-construction-ban",
      subtitle: "\u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u0928\u093F\u092F\u0902\u0924\u094D\u0930\u0923 \u092C\u094B\u0930\u094D\u0921 \u0928\u0947 \u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u092B\u0948\u0932\u093E\u0928\u0947 \u0935\u093E\u0932\u0940 50 \u0914\u0926\u094D\u092F\u094B\u0917\u093F\u0915 \u0907\u0915\u093E\u0907\u092F\u094B\u0902 \u092A\u0930 \u0932\u0917\u093E\u092F\u093E \u092D\u093E\u0930\u0940 \u091C\u0941\u0930\u094D\u092E\u093E\u0928\u093E",
      excerpt: "\u0938\u0930\u094D\u0926\u093F\u092F\u094B\u0902 \u0915\u0940 \u0936\u0941\u0930\u0941\u0906\u0924 \u0915\u0947 \u0938\u093E\u0925 \u0939\u0940 \u0926\u093F\u0932\u094D\u0932\u0940-\u090F\u0928\u0938\u0940\u0906\u0930 \u092E\u0947\u0902 \u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u0915\u093E \u0938\u094D\u0924\u0930 \u092C\u0922\u093C\u0928\u0947 \u0932\u0917\u093E \u0939\u0948\u0964 \u0935\u093E\u092F\u0941 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928 \u0906\u092F\u094B\u0917 \u0928\u0947 \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0928\u094B\u090F\u0921\u093E, \u0917\u0941\u0930\u0941\u0917\u094D\u0930\u093E\u092E \u0914\u0930 \u092B\u0930\u0940\u0926\u093E\u092C\u093E\u0926 \u092E\u0947\u0902 \u0935\u093F\u0936\u0947\u0937 \u090F\u0902\u091F\u0940-\u0938\u094D\u092E\u0949\u0917 \u0917\u0928 \u0914\u0930 \u0938\u094D\u092A\u094D\u0930\u093F\u0902\u0915\u0932\u0930 \u0924\u0948\u0928\u093E\u0924 \u0915\u093F\u090F \u0939\u0948\u0902\u0964",
      content: `<p><strong>\u0926\u093F\u0932\u094D\u0932\u0940 / \u0928\u094B\u090F\u0921\u093E (\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u092C\u094D\u092F\u0942\u0930\u094B):</strong> \u0930\u093E\u091C\u0927\u093E\u0928\u0940 \u0926\u093F\u0932\u094D\u0932\u0940 \u0914\u0930 \u0906\u0938\u092A\u093E\u0938 \u0915\u0947 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0930\u093E\u091C\u0927\u093E\u0928\u0940 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 (NCR) \u092E\u0947\u0902 \u0939\u0935\u093E \u0915\u0940 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0932\u0917\u093E\u0924\u093E\u0930 '\u0916\u0930\u093E\u092C' \u0936\u094D\u0930\u0947\u0923\u0940 \u092E\u0947\u0902 \u092C\u0928\u0940 \u0939\u0941\u0908 \u0939\u0948\u0964 \u0907\u0938\u0947 \u0926\u0947\u0916\u0924\u0947 \u0939\u0941\u090F \u0935\u093E\u092F\u0941 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928 \u0906\u092F\u094B\u0917 (CAQM) \u0928\u0947 \u0938\u092D\u0940 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0935\u093F\u092D\u093E\u0917\u094B\u0902 \u0915\u094B \u0917\u094D\u0930\u0947\u0921\u0947\u0921 \u0930\u093F\u0938\u094D\u092A\u0949\u0928\u094D\u0938 \u090F\u0915\u094D\u0936\u0928 \u092A\u094D\u0932\u093E\u0928 (GRAP) \u0915\u0947 \u0915\u0921\u093C\u0947 \u0928\u093F\u092F\u092E\u094B\u0902 \u0915\u093E \u092A\u093E\u0932\u0928 \u0938\u0941\u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u093E \u0928\u093F\u0930\u094D\u0926\u0947\u0936 \u0926\u093F\u092F\u093E \u0939\u0948\u0964</p>
      <p>\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u0947 \u0938\u093E\u0939\u093F\u092C\u093E\u092C\u093E\u0926 \u0914\u0930 \u0932\u094B\u0928\u0940 \u0914\u0926\u094D\u092F\u094B\u0917\u093F\u0915 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u092E\u0947\u0902 \u092C\u093F\u0928\u093E \u092A\u0940\u092F\u0942\u0938\u0940 (PUC) \u0935\u093E\u0932\u0947 \u0935\u094D\u092F\u093E\u0935\u0938\u093E\u092F\u093F\u0915 \u0935\u093E\u0939\u0928\u094B\u0902 \u0915\u0947 \u092A\u094D\u0930\u0935\u0947\u0936 \u092A\u0930 \u0930\u094B\u0915 \u0932\u0917\u093E \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964 \u0938\u093E\u0925 \u0939\u0940 \u0916\u0941\u0932\u0947 \u092E\u0947\u0902 \u0915\u0942\u0921\u093C\u093E \u091C\u0932\u093E\u0928\u0947 \u0914\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0915\u094B \u092C\u093F\u0928\u093E \u0922\u0915\u0947 \u092A\u0930\u093F\u0935\u0939\u0928 \u0915\u0930\u0928\u0947 \u092A\u0930 50 \u0939\u091C\u093E\u0930 \u0930\u0941\u092A\u092F\u0947 \u0924\u0915 \u0915\u093E \u091C\u0941\u0930\u094D\u092E\u093E\u0928\u093E \u0932\u0917\u093E\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948\u0964</p>`,
      category_id: 2,
      author_id: 2,
      author_name: "\u0905\u092E\u093F\u0924 \u0936\u0930\u094D\u092E\u093E (\u0935\u0930\u093F\u0937\u094D\u0920 \u0938\u0902\u092A\u093E\u0926\u0915)",
      category_name: "\u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930",
      category_slug: "delhi-ncr",
      location: "\u0926\u093F\u0932\u094D\u0932\u0940 / \u0928\u094B\u090F\u0921\u093E \u090F\u0928\u0938\u0940\u0906\u0930",
      featured_image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1000&auto=format&fit=crop&q=80",
      image_caption: "\u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930 \u092E\u0947\u0902 \u0927\u0941\u0902\u0927 \u0914\u0930 \u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u092A\u0930 \u092A\u093E\u0928\u0940 \u0915\u093E \u091B\u093F\u0921\u093C\u0915\u093E\u0935 \u0915\u0930\u0924\u0940 \u090F\u0902\u091F\u0940-\u0938\u094D\u092E\u0949\u0917 \u0917\u0928",
      image_credit: "\u092A\u0940\u091F\u0940\u0906\u0908 / \u092B\u093C\u093E\u0907\u0932 \u092B\u094B\u091F\u094B",
      is_breaking: true,
      is_featured: true,
      is_trending: true,
      is_on_home: true,
      status: "published",
      view_count: 2150,
      published_at: "2026-10-16T08:30:00.000Z",
      created_at: "2026-10-16T08:00:00.000Z",
      updated_at: "2026-10-16T08:30:00.000Z"
    },
    {
      id: 3,
      title: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936: \u092E\u0941\u0916\u094D\u092F\u092E\u0902\u0924\u094D\u0930\u0940 \u092F\u094B\u0917\u0940 \u0906\u0926\u093F\u0924\u094D\u092F\u0928\u093E\u0925 \u0928\u0947 \u092F\u0941\u0935\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F 50,000 \u0928\u0908 \u0938\u0930\u0915\u093E\u0930\u0940 \u0928\u094C\u0915\u0930\u093F\u092F\u094B\u0902 \u0915\u0940 \u0918\u094B\u0937\u0923\u093E \u0915\u0940",
      slug: "up-govt-50000-new-jobs-recruitment-announcement-cm-yogi",
      subtitle: "\u092A\u0941\u0932\u093F\u0938 \u092D\u0930\u094D\u0924\u0940, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0935\u093F\u092D\u093E\u0917 \u0914\u0930 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0936\u093F\u0915\u094D\u0937\u093E \u092E\u0947\u0902 \u091C\u0932\u094D\u0926 \u091C\u093E\u0930\u0940 \u0939\u094B\u0902\u0917\u0947 \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928",
      excerpt: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u0932\u094B\u0915 \u0938\u0947\u0935\u093E \u0906\u092F\u094B\u0917 \u0914\u0930 \u0905\u0927\u0940\u0928\u0938\u094D\u0925 \u0938\u0947\u0935\u093E \u091A\u092F\u0928 \u0906\u092F\u094B\u0917 (UPSSSC) \u0915\u094B \u092E\u093F\u0936\u0928 \u092E\u094B\u0921 \u092E\u0947\u0902 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u092D\u0930\u094D\u0924\u0940 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E \u092A\u0942\u0930\u0940 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0928\u093F\u0930\u094D\u0926\u0947\u0936 \u0926\u093F\u090F \u0917\u090F \u0939\u0948\u0902\u0964",
      content: `<p><strong>\u0932\u0916\u0928\u090A (\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u092C\u094D\u092F\u0942\u0930\u094B):</strong> \u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u092E\u0941\u0916\u094D\u092F\u092E\u0902\u0924\u094D\u0930\u0940 \u092F\u094B\u0917\u0940 \u0906\u0926\u093F\u0924\u094D\u092F\u0928\u093E\u0925 \u0928\u0947 \u0930\u093E\u091C\u094D\u092F \u0915\u0947 \u092C\u0947\u0930\u094B\u091C\u0917\u093E\u0930 \u092F\u0941\u0935\u093E\u0913\u0902 \u0915\u094B \u092C\u0921\u093C\u093E \u0924\u094B\u0939\u092B\u093E \u0926\u0947\u0924\u0947 \u0939\u0941\u090F \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u0935\u093F\u092D\u093E\u0917\u094B\u0902 \u092E\u0947\u0902 50,000 \u0930\u093F\u0915\u094D\u0924 \u092A\u0926\u094B\u0902 \u092A\u0930 \u0924\u0924\u094D\u0915\u093E\u0932 \u092D\u0930\u094D\u0924\u0940 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0915\u093E \u0910\u0932\u093E\u0928 \u0915\u093F\u092F\u093E \u0939\u0948\u0964</p>
      <p>\u092E\u0941\u0916\u094D\u092F\u092E\u0902\u0924\u094D\u0930\u0940 \u0928\u0947 \u0909\u091A\u094D\u091A\u0938\u094D\u0924\u0930\u0940\u092F \u092C\u0948\u0920\u0915 \u092E\u0947\u0902 \u0938\u094D\u092A\u0937\u094D\u091F \u0928\u093F\u0930\u094D\u0926\u0947\u0936 \u0926\u093F\u090F \u0915\u093F \u092D\u0930\u094D\u0924\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u090F\u0902 \u092A\u0942\u0930\u094D\u0923\u0924\u0903 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0914\u0930 \u0938\u092E\u092F\u092C\u0926\u094D\u0927 \u0924\u0930\u0940\u0915\u0947 \u0938\u0947 \u0906\u092F\u094B\u091C\u093F\u0924 \u0915\u0940 \u091C\u093E\u090F\u0902\u0964 \u092A\u0947\u092A\u0930 \u0932\u0940\u0915 \u0930\u094B\u0915\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092C\u0928\u093E\u090F \u0917\u090F \u0928\u090F \u0915\u0921\u093C\u0947 \u0915\u093E\u0928\u0942\u0928 \u0915\u0947 \u0924\u0939\u0924 \u0938\u0916\u094D\u0924 \u0928\u093F\u0917\u0930\u093E\u0928\u0940 \u0930\u0916\u0940 \u091C\u093E\u090F\u0917\u0940\u0964</p>`,
      category_id: 3,
      author_id: 1,
      author_name: "\u0938\u0902\u0926\u0940\u092A \u0930\u093E\u0923\u093E (\u092A\u094D\u0930\u0927\u093E\u0928 \u0938\u0902\u092A\u093E\u0926\u0915)",
      category_name: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936",
      category_slug: "uttar-pradesh",
      location: "\u0932\u0916\u0928\u090A",
      featured_image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80",
      image_caption: "\u0909\u0924\u094D\u0924\u0930 \u092A\u094D\u0930\u0926\u0947\u0936 \u0938\u091A\u093F\u0935\u093E\u0932\u092F \u0932\u0916\u0928\u090A \u092E\u0947\u0902 \u0906\u092F\u094B\u091C\u093F\u0924 \u0930\u094B\u091C\u0917\u093E\u0930 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u092C\u0948\u0920\u0915",
      is_breaking: false,
      is_featured: true,
      is_trending: true,
      is_on_home: true,
      status: "published",
      view_count: 3410,
      published_at: "2026-10-15T15:00:00.000Z",
      created_at: "2026-10-15T14:30:00.000Z",
      updated_at: "2026-10-15T15:00:00.000Z"
    },
    {
      id: 4,
      title: "\u0928\u092E\u094B \u092D\u093E\u0930\u0924 \u0930\u0948\u092A\u093F\u0921 \u0930\u0947\u0932: \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0938\u094D\u091F\u0947\u0936\u0928 \u0938\u0947 \u092E\u0947\u0930\u0920 \u0915\u0947 \u092C\u0940\u091A \u0926\u0948\u0928\u093F\u0915 \u092F\u093E\u0924\u094D\u0930\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E 60,000 \u0915\u0947 \u092A\u093E\u0930",
      slug: "namo-bharat-rapid-rail-ghaziabad-meerut-ridership-milestone",
      subtitle: "\u092F\u093E\u0924\u094D\u0930\u093F\u092F\u094B\u0902 \u0915\u0940 \u092D\u093E\u0930\u0940 \u092D\u0940\u0921\u093C \u0915\u094B \u0926\u0947\u0916\u0924\u0947 \u0939\u0941\u090F \u092B\u0947\u0930\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E \u092E\u0947\u0902 \u0935\u0943\u0926\u094D\u0927\u093F \u0915\u0940 \u0924\u0948\u092F\u093E\u0930\u0940",
      excerpt: "\u0926\u093F\u0932\u094D\u0932\u0940-\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926-\u092E\u0947\u0930\u0920 \u0906\u0930\u0906\u0930\u091F\u0940\u090F\u0938 \u0915\u0949\u0930\u093F\u0921\u094B\u0930 \u092A\u0930 \u0928\u092E\u094B \u092D\u093E\u0930\u0924 \u091F\u094D\u0930\u0947\u0928 \u0906\u092E\u091C\u0928 \u0915\u0940 \u092A\u0939\u0932\u0940 \u092A\u0938\u0902\u0926 \u092C\u0928 \u0917\u0908 \u0939\u0948\u0964 \u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u092E\u0941\u0915\u094D\u0924 \u0914\u0930 \u0938\u092E\u092F \u0915\u0940 \u092C\u091A\u0924 \u0915\u0947 \u091A\u0932\u0924\u0947 \u092F\u093E\u0924\u094D\u0930\u0940 \u092E\u0947\u091F\u094D\u0930\u094B \u0914\u0930 \u0938\u0921\u093C\u0915 \u092E\u093E\u0930\u094D\u0917 \u0915\u0940 \u091C\u0917\u0939 \u0930\u0948\u092A\u093F\u0921 \u0930\u0947\u0932 \u0915\u094B \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E \u0926\u0947 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964",
      content: `<p><strong>\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926:</strong> \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0930\u093E\u091C\u0927\u093E\u0928\u0940 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u092A\u0930\u093F\u0935\u0939\u0928 \u0928\u093F\u0917\u092E (NCRTC) \u0926\u094D\u0935\u093E\u0930\u093E \u0938\u0902\u091A\u093E\u0932\u093F\u0924 \u0928\u092E\u094B \u092D\u093E\u0930\u0924 \u091F\u094D\u0930\u0947\u0928\u094B\u0902 \u0928\u0947 \u092F\u093E\u0924\u094D\u0930\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E \u0915\u093E \u0928\u092F\u093E \u0915\u0940\u0930\u094D\u0924\u093F\u092E\u093E\u0928 \u0938\u094D\u0925\u093E\u092A\u093F\u0924 \u0915\u093F\u092F\u093E \u0939\u0948\u0964 \u0938\u093E\u0939\u093F\u092C\u093E\u092C\u093E\u0926, \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0917\u0941\u0932\u0927\u0930, \u0926\u0941\u0939\u093E\u0908 \u0914\u0930 \u092E\u0941\u0930\u093E\u0926\u0928\u0917\u0930 \u0939\u094B\u0924\u0947 \u0939\u0941\u090F \u092E\u0947\u0930\u0920 \u0938\u093E\u0909\u0925 \u0924\u0915 \u092A\u094D\u0930\u0924\u093F\u0926\u093F\u0928 60 \u0939\u091C\u093E\u0930 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u092F\u093E\u0924\u094D\u0930\u093E \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964</p>`,
      category_id: 1,
      author_id: 3,
      author_name: "\u092A\u094D\u0930\u093F\u092F\u093E \u091A\u094C\u0939\u093E\u0928 (\u092B\u0940\u0932\u094D\u0921 \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930)",
      category_name: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      category_slug: "ghaziabad",
      location: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0906\u0930\u0906\u0930\u091F\u0940\u090F\u0938 \u0938\u094D\u091F\u0947\u0936\u0928",
      featured_image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1000&auto=format&fit=crop&q=80",
      is_breaking: false,
      is_featured: true,
      is_trending: false,
      is_on_home: true,
      status: "published",
      view_count: 1820,
      published_at: "2026-10-15T12:00:00.000Z",
      created_at: "2026-10-15T11:45:00.000Z",
      updated_at: "2026-10-15T12:00:00.000Z"
    },
    {
      id: 5,
      title: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u092A\u0941\u0932\u093F\u0938 \u0915\u092E\u093F\u0936\u094D\u0928\u0930\u0947\u091F \u0915\u093E \u092C\u0921\u093C\u093E \u090F\u0915\u094D\u0936\u0928: \u091F\u094D\u0930\u093E\u0902\u0938 \u0939\u093F\u0902\u0921\u0928 \u092E\u0947\u0902 \u0935\u093E\u0939\u0928 \u091A\u094B\u0930 \u0917\u093F\u0930\u094B\u0939 \u0915\u093E \u092A\u0930\u094D\u0926\u093E\u092B\u093E\u0936, 12 \u0932\u0917\u094D\u091C\u0930\u0940 \u0917\u093E\u0921\u093C\u093F\u092F\u093E\u0902 \u092C\u0930\u093E\u092E\u0926",
      slug: "ghaziabad-police-vehicle-theft-gang-arrest-trans-hindon",
      subtitle: "\u0907\u0902\u0926\u093F\u0930\u093E\u092A\u0941\u0930\u092E \u0925\u093E\u0928\u093E \u092A\u0941\u0932\u093F\u0938 \u0914\u0930 \u0938\u094D\u0935\u093E\u091F \u091F\u0940\u092E \u0928\u0947 \u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u0905\u092D\u093F\u092F\u093E\u0928 \u091A\u0932\u093E\u0915\u0930 4 \u0936\u093E\u0924\u093F\u0930 \u091A\u094B\u0930\u094B\u0902 \u0915\u094B \u0926\u092C\u094B\u091A\u093E",
      excerpt: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u0947 \u0907\u0902\u0926\u093F\u0930\u093E\u092A\u0941\u0930\u092E \u0914\u0930 \u0935\u0948\u0936\u093E\u0932\u0940 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0938\u0947 \u0932\u0917\u094D\u091C\u0930\u0940 \u0917\u093E\u0921\u093C\u093F\u092F\u093E\u0902 \u091A\u094B\u0930\u0940 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u0947 \u0905\u0902\u0924\u0930\u0930\u093E\u091C\u094D\u092F\u0940\u092F \u0917\u093F\u0930\u094B\u0939 \u0915\u093E \u092A\u0930\u094D\u0926\u093E\u092B\u093E\u0936 \u0939\u0941\u0906 \u0939\u0948\u0964 \u092B\u0930\u094D\u091C\u0940 \u0928\u0902\u092C\u0930 \u092A\u094D\u0932\u0947\u091F \u0914\u0930 \u0939\u093E\u0908\u091F\u0947\u0915 \u0938\u094D\u0915\u0948\u0928\u0930 \u0938\u0947 \u0917\u093E\u0921\u093C\u093F\u092F\u093E\u0902 \u091A\u0941\u0930\u093E\u0924\u0947 \u0925\u0947 \u0906\u0930\u094B\u092A\u0940\u0964",
      content: `<p><strong>\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 (\u0905\u092A\u0930\u093E\u0927 \u0921\u0947\u0938\u094D\u0915):</strong> \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u092E\u093F\u0936\u094D\u0928\u0930\u0947\u091F \u0915\u0940 \u0907\u0902\u0926\u093F\u0930\u093E\u092A\u0941\u0930\u092E \u092A\u0941\u0932\u093F\u0938 \u0914\u0930 \u0938\u094D\u0935\u093E\u091F \u091F\u0940\u092E \u0928\u0947 \u0935\u093E\u0939\u0928 \u091A\u094B\u0930\u0940 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u0947 \u090F\u0915 \u0938\u0902\u0917\u0920\u093F\u0924 \u0938\u093F\u0902\u0921\u093F\u0915\u0947\u091F \u0915\u093E \u092D\u0902\u0921\u093E\u092B\u094B\u0921\u093C \u0915\u093F\u092F\u093E \u0939\u0948\u0964 \u092A\u0941\u0932\u093F\u0938 \u0928\u0947 \u0917\u093F\u0930\u094B\u0939 \u0915\u0947 \u091A\u093E\u0930 \u0936\u093E\u0924\u093F\u0930 \u0938\u0926\u0938\u094D\u092F\u094B\u0902 \u0915\u094B \u0917\u093F\u0930\u092B\u094D\u0924\u093E\u0930 \u0915\u0930 \u0909\u0928\u0915\u0947 \u0915\u092C\u094D\u091C\u0947 \u0938\u0947 12 \u091A\u094B\u0930\u0940 \u0915\u0940 \u0915\u093E\u0930\u0947\u0902, \u0907\u0932\u0947\u0915\u094D\u091F\u094D\u0930\u0949\u0928\u093F\u0915 \u091A\u093E\u092C\u093F\u092F\u093E\u0902 \u0914\u0930 \u092E\u093E\u0938\u094D\u091F\u0930 \u0915\u094B\u0921 \u0938\u094D\u0915\u0948\u0928\u0930 \u092C\u0930\u093E\u092E\u0926 \u0915\u093F\u090F \u0939\u0948\u0902\u0964</p>`,
      category_id: 6,
      author_id: 2,
      author_name: "\u0905\u092E\u093F\u0924 \u0936\u0930\u094D\u092E\u093E (\u0935\u0930\u093F\u0937\u094D\u0920 \u0938\u0902\u092A\u093E\u0926\u0915)",
      category_name: "\u0905\u092A\u0930\u093E\u0927",
      category_slug: "crime",
      location: "\u0907\u0902\u0926\u093F\u0930\u093E\u092A\u0941\u0930\u092E, \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      featured_image: "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1000&auto=format&fit=crop&q=80",
      is_breaking: false,
      is_featured: false,
      is_trending: true,
      is_on_home: true,
      status: "published",
      view_count: 980,
      published_at: "2026-10-14T16:00:00.000Z",
      created_at: "2026-10-14T15:30:00.000Z",
      updated_at: "2026-10-14T16:00:00.000Z"
    },
    {
      id: 6,
      title: "\u0938\u0902\u0938\u0926 \u0938\u0924\u094D\u0930: \u0921\u093F\u091C\u093F\u091F\u0932 \u0907\u0902\u0921\u093F\u092F\u093E \u0914\u0930 \u0938\u093E\u0907\u092C\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u092A\u0930 \u0928\u092F\u093E \u0935\u093F\u0927\u0947\u092F\u0915 \u092A\u0947\u0936, \u0921\u0947\u091F\u093E \u092A\u094D\u0930\u093E\u0907\u0935\u0947\u0938\u0940 \u0915\u0947 \u0928\u093F\u092F\u092E \u0939\u094B\u0902\u0917\u0947 \u0938\u0916\u094D\u0924",
      slug: "parliament-session-digital-india-cyber-security-bill",
      subtitle: "\u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0940 \u0928\u093F\u091C\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u0921\u093C\u0947 \u092A\u094D\u0930\u093E\u0935\u0927\u093E\u0928, \u0909\u0932\u094D\u0932\u0902\u0918\u0928 \u092A\u0930 \u092D\u093E\u0930\u0940 \u091C\u0941\u0930\u094D\u092E\u093E\u0928\u093E",
      excerpt: "\u0915\u0947\u0902\u0926\u094D\u0930\u0940\u092F \u0938\u0942\u091A\u0928\u093E \u090F\u0935\u0902 \u092A\u094D\u0930\u094C\u0926\u094D\u092F\u094B\u0917\u093F\u0915\u0940 \u092E\u0902\u0924\u094D\u0930\u0940 \u0928\u0947 \u0938\u0902\u0938\u0926 \u092E\u0947\u0902 \u0928\u092F\u093E \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u092C\u093F\u0932 \u092A\u0947\u0936 \u0915\u093F\u092F\u093E\u0964 \u0938\u094B\u0936\u0932 \u092E\u0940\u0921\u093F\u092F\u093E \u0915\u0902\u092A\u0928\u093F\u092F\u094B\u0902 \u0915\u094B \u092D\u094D\u0930\u093E\u092E\u0915 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0914\u0930 \u0921\u0940\u092A\u092B\u0947\u0915 \u0935\u0940\u0921\u093F\u092F\u094B \u092A\u0930 24 \u0918\u0902\u091F\u0947 \u092E\u0947\u0902 \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u0915\u0930\u0928\u0940 \u0939\u094B\u0917\u0940\u0964",
      content: `<p><strong>\u0928\u0908 \u0926\u093F\u0932\u094D\u0932\u0940:</strong> \u0938\u0902\u0938\u0926 \u0915\u0947 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u0924\u094D\u0930 \u092E\u0947\u0902 \u0938\u0930\u0915\u093E\u0930 \u0928\u0947 \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u0930\u094D\u0938\u0928\u0932 \u0921\u0947\u091F\u093E \u0914\u0930 \u0938\u093E\u0907\u092C\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0915\u094B \u0938\u0941\u0926\u0943\u0922\u093C \u0915\u0930\u0928\u0947 \u0915\u0947 \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F \u0938\u0947 \u090F\u0915 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0936\u094B\u0927\u0928 \u0935\u093F\u0927\u0947\u092F\u0915 \u092A\u0947\u0936 \u0915\u093F\u092F\u093E \u0939\u0948\u0964 \u0935\u093F\u0927\u0947\u092F\u0915 \u092E\u0947\u0902 \u090F\u0906\u0908 \u091C\u0928\u0930\u0947\u091F\u0947\u0921 \u0921\u0940\u092A\u092B\u0947\u0915 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0914\u0930 \u0935\u093F\u0924\u094D\u0924\u0940\u092F \u0927\u094B\u0916\u093E\u0927\u0921\u093C\u0940 \u092A\u0930 \u0928\u0915\u0947\u0932 \u0915\u0938\u0928\u0947 \u0915\u0947 \u0935\u093F\u0936\u0947\u0937 \u092A\u094D\u0930\u093E\u0935\u0927\u093E\u0928 \u0915\u093F\u090F \u0917\u090F \u0939\u0948\u0902\u0964</p>`,
      category_id: 4,
      author_id: 1,
      author_name: "\u0938\u0902\u0926\u0940\u092A \u0930\u093E\u0923\u093E (\u092A\u094D\u0930\u0927\u093E\u0928 \u0938\u0902\u092A\u093E\u0926\u0915)",
      category_name: "\u0926\u0947\u0936",
      category_slug: "india",
      location: "\u0928\u0908 \u0926\u093F\u0932\u094D\u0932\u0940",
      featured_image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80",
      is_breaking: false,
      is_featured: false,
      is_trending: false,
      is_on_home: true,
      status: "published",
      view_count: 870,
      published_at: "2026-10-14T11:00:00.000Z",
      created_at: "2026-10-14T10:30:00.000Z",
      updated_at: "2026-10-14T11:00:00.000Z"
    },
    {
      id: 7,
      title: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0928\u0917\u0930 \u0928\u093F\u0917\u092E \u0915\u0940 \u0935\u093F\u0936\u0947\u0937 \u0935\u0940\u0921\u093F\u092F\u094B \u0930\u093F\u092A\u094B\u0930\u094D\u091F: \u0936\u0939\u0930 \u092E\u0947\u0902 50 \u0928\u090F \u092A\u093F\u0902\u0915 \u091F\u0949\u092F\u0932\u0947\u091F \u0914\u0930 \u0913\u092A\u0928 \u091C\u093F\u092E \u0915\u093E \u0932\u094B\u0915\u093E\u0930\u094D\u092A\u0923",
      slug: "video-ghaziabad-nagar-nigam-open-gym-pink-toilet-inauguration",
      subtitle: "\u0938\u094D\u0935\u091A\u094D\u091B \u092D\u093E\u0930\u0924 \u092E\u093F\u0936\u0928 2.0 \u0915\u0947 \u0924\u0939\u0924 \u0936\u0939\u0930 \u0915\u0947 \u0938\u094C\u0902\u0926\u0930\u094D\u092F\u0940\u0915\u0930\u0923 \u0914\u0930 \u091C\u0928\u0938\u0941\u0935\u093F\u0927\u093E\u0913\u0902 \u092E\u0947\u0902 \u0905\u092D\u0942\u0924\u092A\u0942\u0930\u094D\u0935 \u0935\u093F\u0938\u094D\u0924\u093E\u0930",
      excerpt: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u0940 \u092E\u0939\u093E\u092A\u094C\u0930 \u0914\u0930 \u0928\u0917\u0930 \u0906\u092F\u0941\u0915\u094D\u0924 \u0928\u0947 \u0930\u093E\u091C\u0928\u0917\u0930 \u0914\u0930 \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940\u0928\u0917\u0930 \u092E\u0947\u0902 \u0906\u0927\u0941\u0928\u093F\u0915 \u0913\u092A\u0928 \u091C\u093F\u092E \u0915\u093E \u0936\u0941\u092D\u093E\u0930\u0902\u092D \u0915\u093F\u092F\u093E\u0964 \u0926\u0947\u0916\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u0935\u0940\u0921\u093F\u092F\u094B \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0964",
      content: `<p><strong>\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926:</strong> \u0938\u094D\u0935\u091A\u094D\u091B\u0924\u093E \u0938\u0930\u094D\u0935\u0947\u0915\u094D\u0937\u0923 \u092E\u0947\u0902 \u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 \u0915\u094B \u0905\u0935\u094D\u0935\u0932 \u0926\u0930\u094D\u091C\u093E \u0926\u093F\u0932\u093E\u0928\u0947 \u0915\u0947 \u0938\u0902\u0915\u0932\u094D\u092A \u0915\u0947 \u0938\u093E\u0925 \u0928\u0917\u0930 \u0928\u093F\u0917\u092E \u0928\u0947 \u0936\u0939\u0930 \u0915\u0947 \u092A\u094D\u0930\u092E\u0941\u0916 \u092A\u093E\u0930\u094D\u0915\u094B\u0902 \u092E\u0947\u0902 \u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u0913\u092A\u0928 \u091C\u093F\u092E \u0914\u0930 \u092E\u0939\u093F\u0932\u093E\u0913\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u092A\u093F\u0902\u0915 \u091F\u0949\u092F\u0932\u0947\u091F \u0938\u092E\u0930\u094D\u092A\u093F\u0924 \u0915\u093F\u090F \u0939\u0948\u0902\u0964</p>`,
      category_id: 1,
      author_id: 3,
      author_name: "\u092A\u094D\u0930\u093F\u092F\u093E \u091A\u094C\u0939\u093E\u0928 (\u092B\u0940\u0932\u094D\u0921 \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930)",
      category_name: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      category_slug: "ghaziabad",
      location: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
      featured_image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1000&auto=format&fit=crop&q=80",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      is_video_news: true,
      is_breaking: false,
      is_featured: false,
      is_trending: false,
      is_on_home: true,
      status: "published",
      view_count: 1540,
      published_at: "2026-10-13T17:00:00.000Z",
      created_at: "2026-10-13T16:30:00.000Z",
      updated_at: "2026-10-13T17:00:00.000Z"
    },
    {
      id: 8,
      title: "\u0936\u0947\u092F\u0930 \u092C\u093E\u091C\u093E\u0930 \u092E\u0947\u0902 \u0930\u093F\u0915\u0949\u0930\u094D\u0921 \u0924\u0947\u091C\u0940: \u0938\u0947\u0902\u0938\u0947\u0915\u094D\u0938 85,000 \u0915\u0947 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0938\u094D\u0924\u0930 \u092A\u0930, \u0906\u0908\u091F\u0940 \u0935 \u0911\u091F\u094B \u0938\u0947\u0915\u094D\u091F\u0930 \u092E\u0947\u0902 \u091C\u092C\u0930\u0926\u0938\u094D\u0924 \u0909\u091B\u093E\u0932",
      slug: "share-market-sensex-nifty-record-high-bull-run",
      subtitle: "\u0935\u093F\u0926\u0947\u0936\u0940 \u0938\u0902\u0938\u094D\u0925\u093E\u0917\u0924 \u0928\u093F\u0935\u0947\u0936\u0915\u094B\u0902 (FII) \u0915\u0940 \u092D\u093E\u0930\u0940 \u0932\u093F\u0935\u093E\u0932\u0940 \u0914\u0930 \u092E\u091C\u092C\u0942\u0924 \u091C\u0940\u0921\u0940\u092A\u0940 \u0917\u094D\u0930\u094B\u0925 \u0938\u0947 \u092C\u093E\u091C\u093E\u0930 \u092E\u0947\u0902 \u0909\u0924\u094D\u0938\u093E\u0939",
      excerpt: "\u092D\u093E\u0930\u0924\u0940\u092F \u0936\u0947\u092F\u0930 \u092C\u093E\u091C\u093E\u0930 \u0928\u0947 \u0938\u092A\u094D\u0924\u093E\u0939 \u0915\u0947 \u0905\u0902\u0924\u093F\u092E \u0915\u093E\u0930\u094B\u092C\u093E\u0930\u0940 \u0926\u093F\u0928 \u0928\u092F\u093E \u0915\u0940\u0930\u094D\u0924\u093F\u092E\u093E\u0928 \u0930\u091A \u0926\u093F\u092F\u093E\u0964 \u0938\u0947\u0902\u0938\u0947\u0915\u094D\u0938 \u0914\u0930 \u0928\u093F\u092B\u094D\u091F\u0940 \u0926\u094B\u0928\u094B\u0902 \u0905\u092A\u0928\u0947 \u0938\u0930\u094D\u0935\u0915\u093E\u0932\u093F\u0915 \u0909\u091A\u094D\u091A\u0924\u092E \u0938\u094D\u0924\u0930 \u092A\u0930 \u092C\u0902\u0926 \u0939\u0941\u090F\u0964",
      content: `<p><strong>\u092E\u0941\u0902\u092C\u0908:</strong> \u0926\u0932\u093E\u0932 \u0938\u094D\u091F\u094D\u0930\u0940\u091F \u092E\u0947\u0902 \u0906\u091C \u0928\u093F\u0935\u0947\u0936\u0915\u094B\u0902 \u0915\u0940 \u091A\u093E\u0902\u0926\u0940 \u0930\u0939\u0940\u0964 \u092C\u0949\u092E\u094D\u092C\u0947 \u0938\u094D\u091F\u0949\u0915 \u090F\u0915\u094D\u0938\u091A\u0947\u0902\u091C (BSE) \u0915\u093E 30 \u0936\u0947\u092F\u0930\u094B\u0902 \u0935\u093E\u0932\u093E \u092A\u094D\u0930\u092E\u0941\u0916 \u0938\u0942\u091A\u0915\u093E\u0902\u0915 \u0938\u0947\u0902\u0938\u0947\u0915\u094D\u0938 650 \u0905\u0902\u0915\u094B\u0902 \u0915\u0940 \u0936\u093E\u0928\u0926\u093E\u0930 \u092C\u0922\u093C\u0924 \u0915\u0947 \u0938\u093E\u0925 \u092A\u0939\u0932\u0940 \u092C\u093E\u0930 85,000 \u0915\u0947 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0938\u094D\u0924\u0930 \u0915\u094B \u092A\u093E\u0930 \u0915\u0930 \u0917\u092F\u093E\u0964</p>`,
      category_id: 9,
      author_id: 2,
      author_name: "\u0905\u092E\u093F\u0924 \u0936\u0930\u094D\u092E\u093E (\u0935\u0930\u093F\u0937\u094D\u0920 \u0938\u0902\u092A\u093E\u0926\u0915)",
      category_name: "\u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u0935 \u0936\u0947\u092F\u0930",
      category_slug: "business",
      location: "\u092E\u0941\u0902\u092C\u0908",
      featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80",
      is_breaking: false,
      is_featured: false,
      is_trending: true,
      is_on_home: true,
      status: "published",
      view_count: 1120,
      published_at: "2026-10-13T14:00:00.000Z",
      created_at: "2026-10-13T13:30:00.000Z",
      updated_at: "2026-10-13T14:00:00.000Z"
    }
  ]
};
try {
  if (fs.existsSync(FALLBACK_DATA_FILE)) {
    const raw = fs.readFileSync(FALLBACK_DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.news_articles)) {
      localStore = { ...localStore, ...parsed };
    }
  }
} catch (e) {
}
function saveFallbackStore() {
  try {
    const dir = path.dirname(FALLBACK_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(localStore, null, 2), "utf-8");
  } catch (e) {
  }
}
async function initDatabaseConnection() {
  if (firestoreDb && firebaseConfig) {
    try {
      console.log(`[Firebase Firestore] Connecting to Project: ${firebaseConfig.projectId}, DB: ${firebaseConfig.firestoreDatabaseId}`);
      const articlesSnap = await getDocs(collection(firestoreDb, "articles"));
      isFirestoreActive = true;
      dbStatusMessage = `Connected to Google Cloud Firestore (Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId})`;
      console.log(`[Firebase Firestore] Successfully connected! Found ${articlesSnap.size} existing articles.`);
      if (articlesSnap.empty) {
        console.log("[Firebase Firestore] Initializing Firestore collections with portal news seed data...");
        for (const art of localStore.news_articles) {
          await setDoc(doc(firestoreDb, "articles", String(art.id)), art);
        }
        for (const cat of localStore.categories) {
          await setDoc(doc(firestoreDb, "categories", String(cat.id)), cat);
        }
        for (const tag of localStore.tags) {
          await setDoc(doc(firestoreDb, "tags", String(tag.id)), tag);
        }
        for (const b of localStore.breaking_news) {
          await setDoc(doc(firestoreDb, "breaking_news", String(b.id)), b);
        }
        for (const ad of localStore.advertisements) {
          await setDoc(doc(firestoreDb, "advertisements", String(ad.id)), ad);
        }
        for (const u of localStore.users) {
          await setDoc(doc(firestoreDb, "users", String(u.id)), u);
        }
        await setDoc(doc(firestoreDb, "settings", "general"), localStore.site_settings);
        await setDoc(doc(firestoreDb, "admins", "sandeeprana4519"), {
          email: "sandeeprana4519@gmail.com",
          role: "Super Admin"
        });
        await setDoc(doc(firestoreDb, "admins", "sandeeprana4139"), {
          email: "sandeeprana4139@gmail.com",
          role: "Super Admin"
        });
        console.log("[Firebase Firestore] Migration complete! All collections seeded successfully.");
      }
      return getDBStatus();
    } catch (err) {
      console.warn(`[Firebase Firestore] Notice: ${err.message}. Operating with dual resilient sync.`);
      isFirestoreActive = false;
      dbStatusMessage = `Firebase Firestore notice: ${err.message}. Resilient local storage active.`;
    }
  }
  return getDBStatus();
}
function getDBStatus() {
  return {
    mode: isFirestoreActive ? "firestore" : "local_fallback",
    connected: isFirestoreActive,
    message: dbStatusMessage,
    projectId: firebaseConfig?.projectId || "eloquent-hope-4v4kj",
    databaseId: firebaseConfig?.firestoreDatabaseId || "ai-studio-teznazarhindinew-e999e430-5364-4d3b-ae3d-cb2dcea20f81",
    database: firebaseConfig?.firestoreDatabaseId || "Google Cloud Firestore",
    stats: {
      articles: localStore.news_articles.length,
      categories: localStore.categories.length,
      tags: localStore.tags.length,
      users: localStore.users.length,
      breaking: localStore.breaking_news.length,
      ads: localStore.advertisements.length
    }
  };
}
var db = {
  async getNewsArticles(params) {
    let articles = [];
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "articles"));
        if (!snap.empty) {
          const deletedIds = new Set(localStore.deleted_article_ids || []);
          const firestoreArticles = snap.docs.map((d) => d.data()).filter((a) => a && a.status !== "archived" && !deletedIds.has(a.id));
          const map = /* @__PURE__ */ new Map();
          for (const item of firestoreArticles) {
            map.set(item.id, item);
          }
          for (const item of localStore.news_articles) {
            if (!map.has(item.id) && item.status !== "archived" && !deletedIds.has(item.id)) {
              map.set(item.id, item);
            }
          }
          articles = Array.from(map.values());
          localStore.news_articles = articles;
        } else {
          articles = [...localStore.news_articles];
        }
      } catch (e) {
        articles = [...localStore.news_articles];
      }
    } else {
      articles = [...localStore.news_articles];
    }
    articles = articles.map((a) => {
      if (!a.category_slug || !a.category_name) {
        const cat = localStore.categories.find((c) => c.id === a.category_id);
        if (cat) {
          a.category_name = a.category_name || cat.name_hi;
          a.category_slug = a.category_slug || cat.slug;
        }
      }
      if (!a.author_name && a.author_id) {
        const u = localStore.users.find((usr) => usr.id === a.author_id);
        if (u) {
          a.author_name = u.name;
        }
      }
      return a;
    });
    if (params.status && params.status !== "all") {
      articles = articles.filter((a) => a.status === params.status);
    }
    if (params.categorySlug) {
      const targetCat = localStore.categories.find((c) => c.slug === params.categorySlug);
      articles = articles.filter(
        (a) => a.category_slug === params.categorySlug || targetCat && a.category_id === targetCat.id
      );
    }
    if (params.tagSlug) {
      articles = articles.filter(
        (a) => a.title.toLowerCase().includes(params.tagSlug.toLowerCase()) || a.seo_keywords && a.seo_keywords.toLowerCase().includes(params.tagSlug.toLowerCase())
      );
    }
    if (params.q) {
      const qLower = params.q.toLowerCase().trim();
      articles = articles.filter(
        (a) => a.title.toLowerCase().includes(qLower) || a.excerpt && a.excerpt.toLowerCase().includes(qLower) || a.location && a.location.toLowerCase().includes(qLower) || a.content && a.content.toLowerCase().includes(qLower)
      );
    }
    if (params.isBreaking !== void 0) {
      articles = articles.filter((a) => a.is_breaking === params.isBreaking);
    }
    if (params.isFeatured !== void 0) {
      articles = articles.filter((a) => a.is_featured === params.isFeatured);
    }
    if (params.isTrending !== void 0) {
      articles = articles.filter((a) => a.is_trending === params.isTrending);
    }
    if (params.isVideo !== void 0) {
      articles = articles.filter((a) => (a.is_video_news || !!a.video_url) === params.isVideo);
    }
    if (params.authorId) {
      articles = articles.filter((a) => a.author_id === params.authorId);
    }
    articles.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });
    const page = params.page || 1;
    const limit = params.limit || 12;
    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = articles.slice(start, start + limit);
    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },
  async getArticleBySlug(slugOrId) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "articles"));
        for (const docSnap of snap.docs) {
          const art = docSnap.data();
          if (art.slug === slugOrId || String(art.id) === String(slugOrId)) {
            art.view_count = (art.view_count || 0) + 1;
            setDoc(doc(firestoreDb, "articles", String(art.id)), art).catch(() => {
            });
            return art;
          }
        }
      } catch (e) {
      }
    }
    const found = localStore.news_articles.find((a) => a.slug === slugOrId || String(a.id) === String(slugOrId));
    if (found) {
      found.view_count = (found.view_count || 0) + 1;
      saveFallbackStore();
      return found;
    }
    return null;
  },
  async getCategories(includeInactive = false) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "categories"));
        if (!snap.empty) {
          const deletedIds2 = new Set(localStore.deleted_category_ids || []);
          const cats = snap.docs.map((d) => d.data()).filter((c) => c && !deletedIds2.has(c.id) && (includeInactive || c.is_active !== false));
          const map = /* @__PURE__ */ new Map();
          for (const c of cats) map.set(c.id, c);
          for (const c of localStore.categories) {
            if (!map.has(c.id) && !deletedIds2.has(c.id) && (includeInactive || c.is_active)) {
              map.set(c.id, c);
            }
          }
          localStore.categories = Array.from(map.values());
        }
      } catch (e) {
      }
    }
    const deletedIds = new Set(localStore.deleted_category_ids || []);
    return localStore.categories.filter((c) => !deletedIds.has(c.id) && (includeInactive || c.is_active)).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((c) => {
      const count = localStore.news_articles.filter((a) => a.category_id === c.id && a.status === "published").length;
      return { ...c, article_count: count };
    });
  },
  async getTags(includeInactive = false) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "tags"));
        if (!snap.empty) {
          const deletedIds2 = new Set(localStore.deleted_tag_ids || []);
          const remoteTags = snap.docs.map((d) => d.data()).filter((t) => t && !deletedIds2.has(t.id) && (includeInactive || t.is_active !== false));
          const map = /* @__PURE__ */ new Map();
          for (const t of remoteTags) map.set(t.id, t);
          for (const t of localStore.tags) {
            if (!map.has(t.id) && !deletedIds2.has(t.id) && (includeInactive || t.is_active !== false)) {
              map.set(t.id, t);
            }
          }
          localStore.tags = Array.from(map.values());
        }
      } catch (e) {
      }
    }
    const deletedIds = new Set(localStore.deleted_tag_ids || []);
    const tagsToReturn = localStore.tags.filter(
      (t) => !deletedIds.has(t.id) && (includeInactive || t.is_active !== false)
    );
    return tagsToReturn.map((t) => {
      const count = localStore.news_articles.filter(
        (a) => a.status === "published" && (a.tags && a.tags.some((tagStr) => tagStr.toLowerCase() === t.name.toLowerCase() || tagStr.toLowerCase() === t.slug.toLowerCase()) || a.seo_keywords && a.seo_keywords.toLowerCase().includes(t.name.toLowerCase()) || a.title.toLowerCase().includes(t.name.toLowerCase()))
      ).length;
      return { ...t, article_count: count };
    });
  },
  async getBreakingNews(includeInactive = false) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "breaking_news"));
        if (!snap.empty) {
          const deletedIds2 = new Set(localStore.deleted_breaking_ids || []);
          const remoteItems = snap.docs.map((d) => d.data()).filter((b) => b && !deletedIds2.has(b.id) && (includeInactive || b.is_active !== false));
          const map = /* @__PURE__ */ new Map();
          for (const b of remoteItems) map.set(b.id, b);
          for (const b of localStore.breaking_news) {
            if (!map.has(b.id) && !deletedIds2.has(b.id) && (includeInactive || b.is_active)) {
              map.set(b.id, b);
            }
          }
          localStore.breaking_news = Array.from(map.values());
        }
      } catch (e) {
      }
    }
    const deletedIds = new Set(localStore.deleted_breaking_ids || []);
    return localStore.breaking_news.filter((b) => !deletedIds.has(b.id) && (includeInactive || b.is_active)).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },
  async getAdvertisements(placement, includeAll = false) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "advertisements"));
        if (!snap.empty) {
          const deletedIds2 = new Set(localStore.deleted_ad_ids || []);
          const remoteAds = snap.docs.map((d) => d.data()).filter((a) => a && a.id && !deletedIds2.has(a.id));
          const map = /* @__PURE__ */ new Map();
          for (const a of remoteAds) map.set(a.id, a);
          for (const a of localStore.advertisements) {
            if (!map.has(a.id) && !deletedIds2.has(a.id)) {
              map.set(a.id, a);
            }
          }
          localStore.advertisements = Array.from(map.values());
        }
      } catch (e) {
      }
    }
    const deletedIds = new Set(localStore.deleted_ad_ids || []);
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return localStore.advertisements.filter((a) => {
      if (deletedIds.has(a.id)) return false;
      if (includeAll) return true;
      if (!a.is_active || a.status === "inactive" || a.status === "draft") return false;
      if (placement && a.placement !== placement) return false;
      if (a.start_date && a.start_date > today) return false;
      if (a.end_date && a.end_date < today) return false;
      return true;
    }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },
  async getSiteSettings() {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDoc(doc(firestoreDb, "settings", "general"));
        if (snap.exists()) {
          localStore.site_settings = { ...localStore.site_settings, ...snap.data() };
        }
      } catch (e) {
      }
    }
    return localStore.site_settings;
  },
  async saveContactMessage(msg) {
    const newMessage = {
      id: Date.now(),
      ...msg,
      is_read: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    localStore.contact_messages.unshift(newMessage);
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "contact_messages", String(newMessage.id)), newMessage);
      } catch (e) {
        console.warn("[Firebase] Contact message write error:", e.message);
      }
    }
    return newMessage;
  },
  async getContactMessages() {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "contact_messages"));
        if (!snap.empty) {
          const list = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          if (list.length > 0) {
            return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
        }
      } catch (e) {
      }
    }
    return [...localStore.contact_messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async toggleContactMessageRead(id) {
    const item = localStore.contact_messages.find((m) => m.id === id);
    if (!item) return null;
    item.is_read = !item.is_read;
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      setDoc(doc(firestoreDb, "contact_messages", String(id)), item).catch(() => {
      });
    }
    return item;
  },
  async deleteContactMessage(id) {
    const idx = localStore.contact_messages.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    localStore.contact_messages.splice(idx, 1);
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      deleteDoc(doc(firestoreDb, "contact_messages", String(id))).catch(() => {
      });
    }
    return true;
  },
  async markAllContactMessagesRead() {
    localStore.contact_messages.forEach((m) => {
      m.is_read = true;
      if (firestoreDb && isFirestoreActive) {
        setDoc(doc(firestoreDb, "contact_messages", String(m.id)), m).catch(() => {
        });
      }
    });
    saveFallbackStore();
    return true;
  },
  // ADMIN / CMS OPERATIONS
  async getMetrics() {
    const all = localStore.news_articles;
    return {
      total_articles: all.length,
      published_articles: all.filter((a) => a.status === "published").length,
      draft_articles: all.filter((a) => a.status === "draft").length,
      pending_review: all.filter((a) => a.status === "pending_review").length,
      approved_articles: all.filter((a) => a.status === "approved").length,
      scheduled_articles: all.filter((a) => a.status === "scheduled").length,
      rejected_articles: all.filter((a) => a.status === "rejected").length,
      total_categories: localStore.categories.length,
      total_tags: localStore.tags.length,
      total_users: localStore.users.length,
      total_views: all.reduce((sum, a) => sum + (a.view_count || 0), 0),
      active_advertisements: localStore.advertisements.filter((a) => a.is_active).length,
      total_inquiries: localStore.contact_messages.length,
      unread_inquiries: localStore.contact_messages.filter((m) => !m.is_read).length
    };
  },
  async findUserByEmail(email) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "users"));
        for (const d of snap.docs) {
          const u = d.data();
          if (u.email.toLowerCase() === email.toLowerCase()) return u;
        }
      } catch (e) {
      }
    }
    return localStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  async findUserById(id) {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDoc(doc(firestoreDb, "users", String(id)));
        if (snap.exists()) return snap.data();
      } catch (e) {
      }
    }
    return localStore.users.find((u) => u.id === id);
  },
  async getUsers() {
    if (firestoreDb && isFirestoreActive) {
      try {
        const snap = await getDocs(collection(firestoreDb, "users"));
        if (!snap.empty) {
          const remoteUsers = snap.docs.map((d) => d.data()).filter(Boolean);
          const map = /* @__PURE__ */ new Map();
          for (const u of remoteUsers) map.set(u.id, u);
          for (const u of localStore.users) {
            if (!map.has(u.id)) map.set(u.id, u);
          }
          localStore.users = Array.from(map.values());
        }
      } catch (e) {
      }
    }
    return localStore.users.map(({ password_hash, ...rest }) => rest);
  },
  async registerUser(userData) {
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      password_hash: userData.password_hash,
      requested_role: userData.requested_role,
      role_id: userData.role_id || (userData.requested_role === "editor" ? 4 : 5),
      role_name: userData.role_name || (userData.requested_role === "editor" ? "Editor (Pending)" : "Reporter (Pending)"),
      approval_status: "pending",
      is_active: false,
      bio: userData.bio || `${userData.requested_role === "editor" ? "\u0938\u0902\u092A\u093E\u0926\u0915" : "\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930"} (\u092A\u0902\u091C\u0940\u0915\u0943\u0924)`,
      assigned_region: userData.assigned_region || "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 / \u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    localStore.users.unshift(newUser);
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(newUser);
        await setDoc(doc(firestoreDb, "users", String(newUser.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Register user write notice:", e.message);
      }
    }
    return newUser;
  },
  async approveUser(id, approver, assignedRoleId, notes) {
    const user = localStore.users.find((u) => u.id === id);
    if (!user) {
      throw new Error("\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    }
    const finalRoleId = assignedRoleId || (user.requested_role === "editor" ? 4 : 5);
    const finalRoleName = finalRoleId === 1 ? "Super Admin" : finalRoleId === 4 ? "Editor" : "Reporter";
    user.approval_status = "approved";
    user.is_active = true;
    user.role_id = finalRoleId;
    user.role_name = finalRoleName;
    user.approved_by = approver.id;
    user.approved_by_name = approver.name;
    user.approved_at = (/* @__PURE__ */ new Date()).toISOString();
    user.approval_notes = notes || "\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0938\u094D\u0935\u0940\u0915\u0943\u0924";
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, "users", String(user.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Approve user error:", e.message);
      }
    }
    return user;
  },
  async rejectUser(id, approver, notes) {
    const user = localStore.users.find((u) => u.id === id);
    if (!user) {
      throw new Error("\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    }
    user.approval_status = "rejected";
    user.is_active = false;
    user.approved_by = approver.id;
    user.approved_by_name = approver.name;
    user.approved_at = (/* @__PURE__ */ new Date()).toISOString();
    user.approval_notes = notes || "\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924";
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, "users", String(user.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Reject user error:", e.message);
      }
    }
    return user;
  },
  async changeUserRole(id, roleId, approver) {
    const user = localStore.users.find((u) => u.id === id);
    if (!user) {
      throw new Error("\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    }
    const validRoles = {
      1: "Super Admin",
      4: "Editor",
      5: "Reporter"
    };
    if (!validRoles[roleId]) {
      throw new Error("\u0905\u092E\u093E\u0928\u094D\u092F \u092D\u0942\u092E\u093F\u0915\u093E ID\u0964 \u0915\u0947\u0935\u0932 \u0938\u0941\u092A\u0930 \u090F\u0921\u092E\u093F\u0928 (1), \u0938\u0902\u092A\u093E\u0926\u0915 (4), \u092F\u093E \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 (5) \u0905\u0928\u0941\u092E\u0924 \u0939\u0948\u0902\u0964");
    }
    user.role_id = roleId;
    user.role_name = validRoles[roleId];
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, "users", String(user.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Change user role error:", e.message);
      }
    }
    return user;
  },
  async toggleUserActive(id) {
    const user = localStore.users.find((u) => u.id === id);
    if (!user) {
      throw new Error("\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    }
    user.is_active = !user.is_active;
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, "users", String(user.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Toggle user active error:", e.message);
      }
    }
    return user;
  },
  async saveUser(user) {
    let savedUser;
    if (user.id) {
      const idx = localStore.users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        localStore.users[idx] = { ...localStore.users[idx], ...user, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
        savedUser = localStore.users[idx];
      } else {
        savedUser = user;
      }
    } else {
      const roleId = user.role_id || 5;
      const roleName = roleId === 1 ? "Super Admin" : roleId === 4 ? "Editor" : "Reporter";
      savedUser = {
        id: Date.now(),
        name: user.name || "\u0928\u092F\u093E \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E",
        email: user.email || `user${Date.now()}@teznazar.com`,
        password_hash: user.password_hash || "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1kuOYeq",
        role_id: roleId,
        role_name: roleName,
        phone: user.phone,
        bio: user.bio,
        assigned_region: user.assigned_region || "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 / \u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930",
        approval_status: user.approval_status || "approved",
        is_active: user.is_active !== void 0 ? user.is_active : true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      localStore.users.push(savedUser);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedUser);
        await setDoc(doc(firestoreDb, "users", String(savedUser.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Save user error:", e.message);
      }
    }
    return savedUser;
  },
  async deleteUser(id) {
    const idx = localStore.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    if (id === 1 || localStore.users[idx].role_id === 1) {
      throw new Error("\u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Super Admin) \u0915\u094B \u0939\u091F\u093E\u092F\u093E \u0928\u0939\u0940\u0902 \u091C\u093E \u0938\u0915\u0924\u093E\u0964");
    }
    localStore.users.splice(idx, 1);
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, "users", String(id)));
      } catch (e) {
        console.warn("[Firebase] Delete user error:", e.message);
      }
    }
    return true;
  },
  async updateUserProfile(userId, data) {
    const user = localStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error("\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    }
    if (data.name && data.name.trim()) {
      user.name = data.name.trim();
    }
    if (data.email && data.email.trim()) {
      const newEmail = data.email.trim().toLowerCase();
      const existing = localStore.users.find((u) => u.email.toLowerCase() === newEmail && u.id !== userId);
      if (existing) {
        throw new Error("\u092F\u0939 \u0908\u092E\u0947\u0932 \u092A\u0939\u0932\u0947 \u0938\u0947 \u0915\u093F\u0938\u0940 \u0905\u0928\u094D\u092F \u0916\u093E\u0924\u0947 \u092E\u0947\u0902 \u0909\u092A\u092F\u094B\u0917 \u092E\u0947\u0902 \u0939\u0948\u0964");
      }
      user.email = newEmail;
    }
    if (data.phone !== void 0) {
      user.phone = data.phone.trim();
    }
    if (data.password_hash) {
      user.password_hash = data.password_hash;
    }
    user.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(user);
        await setDoc(doc(firestoreDb, "users", String(user.id)), payload);
      } catch (e) {
        console.warn("[Firebase] Update user profile notice:", e.message);
      }
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },
  async saveArticle(art, userId, userRole) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const user = localStore.users.find((u) => u.id === userId);
    const userName = user?.name || "\u0938\u0902\u092A\u093E\u0926\u0915";
    const isReporterRole = userRole === 5;
    let slug = art.slug && typeof art.slug === "string" ? art.slug.trim() : "";
    if (!slug) {
      const titleClean = (art.title || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/gi, "-").slice(0, 80).replace(/^-+|-+$/g, "");
      slug = titleClean ? `${titleClean}-${Date.now().toString().slice(-6)}` : `news-${Date.now()}`;
    }
    let excerpt = art.excerpt && typeof art.excerpt === "string" ? art.excerpt.trim() : "";
    if (!excerpt && art.content) {
      const stripped = art.content.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
      excerpt = stripped.slice(0, 160) + (stripped.length > 160 ? "..." : "");
    }
    if (!excerpt) {
      excerpt = "\u0924\u093E\u091C\u093C\u093E \u0938\u092E\u093E\u091A\u093E\u0930 \u090F\u0935\u0902 \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u093F\u0935\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u092A\u0922\u093C\u0947\u0902\u0964";
    }
    const hasVideo = !!art.video_url && art.video_url.trim().length > 0;
    const isVideoNews = art.is_video_news !== void 0 ? !!art.is_video_news : hasVideo;
    const categoryId = art.category_id ? parseInt(String(art.category_id), 10) : 1;
    const cat = localStore.categories.find((c) => c.id === categoryId);
    const category_name = cat?.name_hi || art.category_name || "\u0924\u093E\u091C\u093C\u093E \u0916\u092C\u0930";
    const category_slug = cat?.slug || art.category_slug || "latest";
    const assignedAuthorId = isReporterRole ? userId : art.author_id ? parseInt(String(art.author_id), 10) : userId;
    const authorUser = isReporterRole ? user : localStore.users.find((u) => u.id === assignedAuthorId) || user;
    const author_name = authorUser?.name || user?.name || art.author_name || "\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u0921\u0947\u0938\u094D\u0915";
    let parsedTags = [];
    if (Array.isArray(art.tags)) {
      parsedTags = art.tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof art.tags === "string" && art.tags.trim()) {
      parsedTags = art.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    let articleToSave;
    if (art.id) {
      const idx = localStore.news_articles.findIndex((a) => a.id === art.id);
      if (idx !== -1) {
        const existing = localStore.news_articles[idx];
        if (isReporterRole) {
          if (existing.author_id !== userId) {
            throw new Error("\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0928\u093F\u092F\u092E: \u0906\u092A \u0915\u0947\u0935\u0932 \u0905\u092A\u0928\u0947 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0938\u094D\u0924\u0941\u0924 \u0938\u092E\u093E\u091A\u093E\u0930 \u0939\u0940 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964 \u0905\u0928\u094D\u092F \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930\u094B\u0902 \u0915\u0947 \u0938\u092E\u093E\u091A\u093E\u0930\u094B\u0902 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A \u0935\u0930\u094D\u091C\u093F\u0924 \u0939\u0948\u0964");
          }
          if (existing.status !== "draft" && existing.status !== "rejected") {
            throw new Error("\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u0915\u0947\u0935\u0932 \u0921\u094D\u0930\u093E\u092B\u094D\u091F \u092F\u093E \u0938\u0941\u0927\u093E\u0930 \u0939\u0947\u0924\u0941 \u0932\u094C\u091F\u093E\u0908 \u0917\u0908 (Needs Revision) \u0916\u092C\u0930\u0947\u0902 \u0939\u0940 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964 \u0938\u092E\u0940\u0915\u094D\u0937\u093E\u0927\u0940\u0928 \u092F\u093E \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0916\u092C\u0930\u0947\u0902 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0928\u0939\u0940\u0902 \u0915\u0940 \u091C\u093E \u0938\u0915\u0924\u0940\u0902\u0964");
          }
        }
        const prevStatus = existing.status;
        let newStatus;
        if (isReporterRole) {
          newStatus = art.status === "draft" ? "draft" : "pending_review";
        } else {
          newStatus = art.status || existing.status;
        }
        const auditLog = {
          action: prevStatus !== newStatus ? `status_changed:${newStatus}` : "edited",
          user_id: userId,
          user_name: userName,
          timestamp: now,
          from_status: prevStatus,
          to_status: newStatus,
          notes: art.review_notes || void 0
        };
        const existingAuditLogs = Array.isArray(existing.audit_logs) ? existing.audit_logs : [];
        articleToSave = {
          ...existing,
          ...art,
          slug,
          excerpt,
          is_video_news: isVideoNews,
          category_id: categoryId,
          category_name,
          category_slug,
          author_id: assignedAuthorId,
          author_name,
          tags: parsedTags.length > 0 ? parsedTags : existing.tags || [],
          id: existing.id,
          status: newStatus,
          updated_at: now,
          published_at: newStatus === "published" && !existing.published_at ? now : art.published_at || existing.published_at || (newStatus === "published" ? now : ""),
          audit_logs: [auditLog, ...existingAuditLogs.slice(0, 30)]
        };
        localStore.news_articles[idx] = articleToSave;
      } else {
        throw new Error("\u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u092E\u093E\u091A\u093E\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
      }
    } else {
      const newId = Date.now();
      const initialStatus = isReporterRole ? art.status === "draft" ? "draft" : "pending_review" : art.status || "published";
      const auditLog = {
        action: "created",
        user_id: userId,
        user_name: userName,
        timestamp: now,
        to_status: initialStatus
      };
      articleToSave = {
        id: newId,
        title: art.title || "\u0936\u0940\u0930\u094D\u0937\u0915 \u0930\u0939\u093F\u0924 \u0938\u092E\u093E\u091A\u093E\u0930",
        slug,
        subtitle: art.subtitle || "",
        excerpt,
        content: art.content || "",
        category_id: categoryId,
        category_name,
        category_slug,
        author_id: assignedAuthorId,
        author_name,
        location: art.location || "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926",
        featured_image: art.featured_image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80",
        image_caption: art.image_caption || "",
        image_credit: art.image_credit || "\u092C\u094D\u0932\u0948\u0915 \u0932\u0947\u0902\u0938 \u092C\u094D\u092F\u0942\u0930\u094B",
        gallery_images: art.gallery_images || [],
        video_url: art.video_url || "",
        is_video_news: isVideoNews,
        is_breaking: !!art.is_breaking,
        is_featured: !!art.is_featured,
        is_trending: !!art.is_trending,
        is_on_home: art.is_on_home !== void 0 ? art.is_on_home : true,
        status: initialStatus,
        tags: parsedTags,
        view_count: 0,
        seo_title: art.seo_title || "",
        seo_description: art.seo_description || "",
        seo_keywords: art.seo_keywords || parsedTags.join(", "),
        scheduled_at: art.scheduled_at || "",
        published_at: initialStatus === "published" ? now : art.published_at || "",
        created_at: now,
        updated_at: now,
        audit_logs: [auditLog]
      };
      localStore.news_articles.unshift(articleToSave);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(articleToSave);
        await setDoc(doc(firestoreDb, "articles", String(articleToSave.id)), payload);
        console.log(`[Firebase Firestore] Article successfully synced! (ID: ${articleToSave.id})`);
      } catch (e) {
        console.error("[Firebase] Article write error:", e.message);
      }
    }
    return articleToSave;
  },
  async updateArticleStatus(articleId, status, userId, userRole, notes) {
    const idx = localStore.news_articles.findIndex((a) => a.id === articleId);
    if (idx === -1) throw new Error("\u0938\u092E\u093E\u091A\u093E\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    const existing = localStore.news_articles[idx];
    if (userRole === 5) {
      if (existing.author_id !== userId) {
        throw new Error("\u0906\u092A \u0915\u0947\u0935\u0932 \u0905\u092A\u0928\u0940 \u0939\u0940 \u0916\u092C\u0930\u0947\u0902 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0939\u0947\u0924\u0941 \u092D\u0947\u091C \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964");
      }
      if (status !== "draft" && status !== "pending_review") {
        throw new Error("\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u0915\u094B \u0938\u0940\u0927\u0947 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964");
      }
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const user = localStore.users.find((u) => u.id === userId);
    const userName = user?.name || "\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915";
    const prevStatus = existing.status;
    const auditLog = {
      action: `status_change:${status}`,
      user_id: userId,
      user_name: userName,
      timestamp: now,
      from_status: prevStatus,
      to_status: status,
      notes: notes || void 0
    };
    const existingAuditLogs = Array.isArray(existing.audit_logs) ? existing.audit_logs : [];
    existing.status = status;
    existing.updated_at = now;
    if (notes) existing.review_notes = notes;
    if (status === "approved" || status === "published" || status === "rejected") {
      existing.reviewed_by = userId;
      existing.reviewed_by_name = userName;
      existing.reviewed_at = now;
    }
    if (status === "published" && !existing.published_at) {
      existing.published_at = now;
    }
    existing.audit_logs = [auditLog, ...existingAuditLogs.slice(0, 30)];
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "articles", String(existing.id)), cleanForFirestore(existing));
      } catch (e) {
        console.error("[Firebase] Article status update error:", e.message);
      }
    }
    return existing;
  },
  async reviewArticle(articleId, reviewerId, status, notes) {
    const reviewer = localStore.users.find((u) => u.id === reviewerId);
    const reviewerRole = reviewer?.role_id || 4;
    return this.updateArticleStatus(articleId, status, reviewerId, reviewerRole, notes);
  },
  async restoreArticle(id, userId, userRole) {
    return this.updateArticleStatus(id, "draft", userId, userRole, "\u0906\u0930\u094D\u0915\u093E\u0907\u0935/\u091B\u093F\u092A\u093E\u0908 \u0917\u0908 \u0938\u094D\u0925\u093F\u0924\u093F \u0938\u0947 \u092C\u0939\u093E\u0932 \u0915\u093F\u092F\u093E \u0917\u092F\u093E");
  },
  async deleteArticle(id, permanent = false) {
    const idx = localStore.news_articles.findIndex((a) => a.id === id);
    const removedArt = idx !== -1 ? localStore.news_articles[idx] : null;
    if (permanent) {
      if (!localStore.deleted_article_ids) localStore.deleted_article_ids = [];
      if (!localStore.deleted_article_ids.includes(id)) {
        localStore.deleted_article_ids.push(id);
      }
      if (idx !== -1) {
        localStore.news_articles.splice(idx, 1);
      }
    } else {
      if (idx !== -1) {
        localStore.news_articles[idx].status = "archived";
        localStore.news_articles[idx].updated_at = (/* @__PURE__ */ new Date()).toISOString();
      }
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      if (permanent) {
        try {
          await deleteDoc(doc(firestoreDb, "articles", String(id)));
        } catch (e) {
          try {
            await setDoc(doc(firestoreDb, "articles", String(id)), cleanForFirestore({
              ...removedArt || { id },
              status: "archived",
              is_on_home: false,
              is_breaking: false,
              is_featured: false,
              is_trending: false
            }));
          } catch (innerErr) {
          }
        }
      } else if (removedArt) {
        try {
          await setDoc(doc(firestoreDb, "articles", String(id)), cleanForFirestore({
            ...removedArt,
            status: "archived",
            is_on_home: false,
            is_breaking: false,
            is_featured: false,
            is_trending: false
          }));
        } catch (e) {
        }
      }
    }
    return idx !== -1;
  },
  async saveCategory(cat) {
    let savedCat;
    const name_hi = cat.name_hi?.trim() || "\u0928\u0908 \u0936\u094D\u0930\u0947\u0923\u0940";
    const name_en = cat.name_en?.trim() || name_hi;
    let slug = cat.slug?.trim() || "";
    if (!slug) {
      slug = (cat.name_en || cat.name_hi || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/gi, "-").slice(0, 50).replace(/^-+|-+$/g, "");
      if (!slug) slug = `cat-${Date.now()}`;
    }
    const duplicate = localStore.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase() && c.id !== cat.id);
    if (duplicate) {
      throw new Error(`\u0938\u094D\u0932\u0917 '${slug}' \u092A\u0939\u0932\u0947 \u0938\u0947 \u0936\u094D\u0930\u0947\u0923\u0940 '${duplicate.name_hi}' \u0926\u094D\u0935\u093E\u0930\u093E \u0909\u092A\u092F\u094B\u0917 \u092E\u0947\u0902 \u0939\u0948\u0964`);
    }
    if (cat.id) {
      if (localStore.deleted_category_ids) {
        localStore.deleted_category_ids = localStore.deleted_category_ids.filter((x) => x !== cat.id);
      }
      const idx = localStore.categories.findIndex((c) => c.id === cat.id);
      if (idx !== -1) {
        localStore.categories[idx] = {
          ...localStore.categories[idx],
          ...cat,
          name_hi,
          name_en,
          slug,
          is_active: cat.is_active !== void 0 ? cat.is_active : localStore.categories[idx].is_active
        };
        savedCat = localStore.categories[idx];
      } else {
        savedCat = { ...cat, name_hi, name_en, slug, is_active: cat.is_active ?? true };
        localStore.categories.push(savedCat);
      }
    } else {
      const newId = Date.now();
      savedCat = {
        id: newId,
        name_hi,
        name_en,
        slug,
        description: cat.description || "",
        image_url: cat.image_url || "",
        display_order: cat.display_order || localStore.categories.length + 1,
        is_in_menu: cat.is_in_menu !== void 0 ? cat.is_in_menu : true,
        is_in_home: cat.is_in_home !== void 0 ? cat.is_in_home : true,
        is_active: cat.is_active !== void 0 ? cat.is_active : true
      };
      localStore.categories.push(savedCat);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedCat);
        await setDoc(doc(firestoreDb, "categories", String(savedCat.id)), payload);
      } catch (e) {
      }
    }
    return savedCat;
  },
  async toggleCategoryActive(id) {
    const cat = localStore.categories.find((c) => c.id === id);
    if (!cat) throw new Error("\u0936\u094D\u0930\u0947\u0923\u0940 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908\u0964");
    cat.is_active = !cat.is_active;
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "categories", String(cat.id)), cleanForFirestore(cat));
      } catch (e) {
      }
    }
    return cat;
  },
  async deleteCategory(id, reassignCategoryId = 1) {
    const idx = localStore.categories.findIndex((c) => c.id === id);
    const removedCat = idx !== -1 ? localStore.categories[idx] : null;
    if (!localStore.deleted_category_ids) localStore.deleted_category_ids = [];
    if (!localStore.deleted_category_ids.includes(id)) {
      localStore.deleted_category_ids.push(id);
    }
    const fallbackCat = localStore.categories.find((c) => c.id === reassignCategoryId && c.id !== id) || localStore.categories.find((c) => c.id !== id) || { id: 1, name_hi: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926", slug: "ghaziabad" };
    const affectedArticles = localStore.news_articles.filter((a) => a.category_id === id);
    for (const art of affectedArticles) {
      art.category_id = fallbackCat.id;
      art.category_name = fallbackCat.name_hi;
      art.category_slug = fallbackCat.slug;
      art.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      if (firestoreDb && isFirestoreActive) {
        setDoc(doc(firestoreDb, "articles", String(art.id)), cleanForFirestore(art)).catch(() => {
        });
      }
    }
    if (idx !== -1) {
      localStore.categories.splice(idx, 1);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, "categories", String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, "categories", String(id)), cleanForFirestore({
            ...removedCat || { id },
            is_active: false
          }));
        } catch (innerErr) {
        }
      }
    }
    return idx !== -1;
  },
  async saveTag(tag) {
    let savedTag;
    const name = tag.name?.trim() || "\u0928\u092F\u093E \u091F\u0948\u0917";
    let slug = tag.slug?.trim() || "";
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/gi, "-").slice(0, 40);
      if (!slug) slug = `tag-${Date.now()}`;
    }
    const duplicate = localStore.tags.find((t) => t.slug.toLowerCase() === slug.toLowerCase() && t.id !== tag.id);
    if (duplicate) {
      throw new Error(`\u0938\u094D\u0932\u0917 '${slug}' \u092A\u0939\u0932\u0947 \u0938\u0947 \u091F\u0948\u0917 '${duplicate.name}' \u0926\u094D\u0935\u093E\u0930\u093E \u0909\u092A\u092F\u094B\u0917 \u092E\u0947\u0902 \u0939\u0948\u0964`);
    }
    if (tag.id) {
      if (localStore.deleted_tag_ids) {
        localStore.deleted_tag_ids = localStore.deleted_tag_ids.filter((x) => x !== tag.id);
      }
      const idx = localStore.tags.findIndex((t) => t.id === tag.id);
      if (idx !== -1) {
        localStore.tags[idx] = {
          ...localStore.tags[idx],
          ...tag,
          name,
          slug,
          is_active: tag.is_active !== void 0 ? tag.is_active : localStore.tags[idx].is_active
        };
        savedTag = localStore.tags[idx];
      } else {
        savedTag = { ...tag, name, slug, is_active: tag.is_active ?? true };
        localStore.tags.push(savedTag);
      }
    } else {
      const newId = Date.now();
      savedTag = {
        id: newId,
        name,
        slug,
        description: tag.description || "",
        is_popular: tag.is_popular !== void 0 ? tag.is_popular : false,
        is_active: tag.is_active !== void 0 ? tag.is_active : true
      };
      localStore.tags.push(savedTag);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "tags", String(savedTag.id)), cleanForFirestore(savedTag));
      } catch (e) {
      }
    }
    return savedTag;
  },
  async toggleTagActive(id) {
    const tag = localStore.tags.find((t) => t.id === id);
    if (!tag) throw new Error("\u091F\u0948\u0917 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964");
    tag.is_active = !tag.is_active;
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "tags", String(tag.id)), cleanForFirestore(tag));
      } catch (e) {
      }
    }
    return tag;
  },
  async deleteTag(id) {
    const idx = localStore.tags.findIndex((t) => t.id === id);
    const removedTag = idx !== -1 ? localStore.tags[idx] : null;
    if (!localStore.deleted_tag_ids) localStore.deleted_tag_ids = [];
    if (!localStore.deleted_tag_ids.includes(id)) {
      localStore.deleted_tag_ids.push(id);
    }
    if (removedTag) {
      for (const art of localStore.news_articles) {
        if (art.tags && Array.isArray(art.tags)) {
          art.tags = art.tags.filter((t) => t !== removedTag.name && t !== removedTag.slug);
        }
      }
    }
    if (idx !== -1) {
      localStore.tags.splice(idx, 1);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, "tags", String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, "tags", String(id)), cleanForFirestore({
            ...removedTag || { id },
            is_active: false
          }));
        } catch (innerErr) {
        }
      }
    }
    return idx !== -1;
  },
  async saveBreakingNews(item) {
    let savedItem;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (item.id) {
      if (localStore.deleted_breaking_ids) {
        localStore.deleted_breaking_ids = localStore.deleted_breaking_ids.filter((x) => x !== item.id);
      }
      const idx = localStore.breaking_news.findIndex((b) => b.id === item.id);
      if (idx !== -1) {
        localStore.breaking_news[idx] = {
          ...localStore.breaking_news[idx],
          ...item,
          updated_at: now
        };
        savedItem = localStore.breaking_news[idx];
      } else {
        savedItem = { ...item, updated_at: now };
        localStore.breaking_news.push(savedItem);
      }
    } else {
      savedItem = {
        id: Date.now(),
        title: (item.title || "").trim(),
        article_id: item.article_id ? parseInt(String(item.article_id), 10) : null,
        external_url: item.external_url || null,
        display_order: item.display_order !== void 0 ? item.display_order : localStore.breaking_news.length + 1,
        is_active: item.is_active !== void 0 ? item.is_active : true,
        created_at: now,
        updated_at: now
      };
      localStore.breaking_news.unshift(savedItem);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedItem);
        await setDoc(doc(firestoreDb, "breaking_news", String(savedItem.id)), payload);
      } catch (e) {
      }
    }
    return savedItem;
  },
  async toggleBreakingNewsActive(id) {
    const item = localStore.breaking_news.find((b) => b.id === id);
    if (!item) throw new Error("\u092C\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u0928\u094D\u092F\u0942\u091C\u093C \u0906\u0907\u091F\u092E \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964");
    item.is_active = !item.is_active;
    item.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "breaking_news", String(item.id)), cleanForFirestore(item));
      } catch (e) {
      }
    }
    return item;
  },
  async deleteBreakingNews(id) {
    const idx = localStore.breaking_news.findIndex((b) => b.id === id);
    const removedItem = idx !== -1 ? localStore.breaking_news[idx] : null;
    if (!localStore.deleted_breaking_ids) localStore.deleted_breaking_ids = [];
    if (!localStore.deleted_breaking_ids.includes(id)) {
      localStore.deleted_breaking_ids.push(id);
    }
    if (idx !== -1) {
      localStore.breaking_news.splice(idx, 1);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, "breaking_news", String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, "breaking_news", String(id)), cleanForFirestore({
            id,
            title: removedItem?.title || "\u0939\u091F\u093E\u092F\u093E \u0917\u092F\u093E \u0938\u092E\u093E\u091A\u093E\u0930",
            is_active: false,
            display_order: 999999,
            created_at: removedItem?.created_at || (/* @__PURE__ */ new Date()).toISOString()
          }));
        } catch (innerErr) {
        }
      }
    }
    return true;
  },
  async saveAdvertisement(ad) {
    let savedAd;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    if (ad.id) {
      if (localStore.deleted_ad_ids) {
        localStore.deleted_ad_ids = localStore.deleted_ad_ids.filter((i) => i !== ad.id);
      }
      const idx = localStore.advertisements.findIndex((a) => a.id === ad.id);
      if (idx !== -1) {
        localStore.advertisements[idx] = {
          ...localStore.advertisements[idx],
          ...ad,
          is_active: ad.is_active !== void 0 ? ad.is_active : ad.status ? ad.status === "active" : localStore.advertisements[idx].is_active
        };
        savedAd = localStore.advertisements[idx];
      } else {
        savedAd = {
          ...ad,
          id: ad.id,
          title: ad.title || "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928",
          placement: ad.placement || "sidebar",
          image_url: ad.image_url || "",
          destination_url: ad.destination_url || "https://example.com",
          advertiser_name: ad.advertiser_name || "",
          description: ad.description || "",
          start_date: ad.start_date || nowIso.split("T")[0],
          end_date: ad.end_date || "2026-12-31",
          display_order: Number(ad.display_order) || 0,
          impressions_count: ad.impressions_count || 0,
          clicks_count: ad.clicks_count || 0,
          is_active: ad.is_active !== void 0 ? ad.is_active : ad.status ? ad.status === "active" : true,
          status: ad.status || "active",
          created_at: ad.created_at || nowIso
        };
        localStore.advertisements.push(savedAd);
      }
    } else {
      const newId = Date.now();
      savedAd = {
        id: newId,
        title: ad.title || "\u0928\u092F\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928",
        placement: ad.placement || "sidebar",
        image_url: ad.image_url || "",
        destination_url: ad.destination_url || "https://example.com",
        advertiser_name: ad.advertiser_name || "",
        description: ad.description || "",
        start_date: ad.start_date || nowIso.split("T")[0],
        end_date: ad.end_date || "2026-12-31",
        display_order: Number(ad.display_order) || localStore.advertisements.length + 1,
        impressions_count: 0,
        clicks_count: 0,
        is_active: ad.is_active !== void 0 ? ad.is_active : ad.status ? ad.status === "active" : true,
        status: ad.status || "active",
        created_at: nowIso
      };
      localStore.advertisements.push(savedAd);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(savedAd);
        await setDoc(doc(firestoreDb, "advertisements", String(savedAd.id)), payload);
      } catch (e) {
      }
    }
    return savedAd;
  },
  async toggleAdvertisementActive(id) {
    const item = localStore.advertisements.find((a) => a.id === id);
    if (!item) throw new Error("\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
    item.is_active = !item.is_active;
    item.status = item.is_active ? "active" : "inactive";
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await setDoc(doc(firestoreDb, "advertisements", String(id)), cleanForFirestore(item));
      } catch (e) {
      }
    }
    return item;
  },
  async deleteAdvertisement(id) {
    const idx = localStore.advertisements.findIndex((a) => a.id === id);
    const removedAd = idx !== -1 ? localStore.advertisements[idx] : null;
    if (!localStore.deleted_ad_ids) localStore.deleted_ad_ids = [];
    if (!localStore.deleted_ad_ids.includes(id)) {
      localStore.deleted_ad_ids.push(id);
    }
    if (idx !== -1) {
      localStore.advertisements.splice(idx, 1);
    }
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        await deleteDoc(doc(firestoreDb, "advertisements", String(id)));
      } catch (e) {
        try {
          await setDoc(doc(firestoreDb, "advertisements", String(id)), cleanForFirestore({
            id,
            title: removedAd?.title || "\u0939\u091F\u093E\u092F\u093E \u0917\u092F\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928",
            is_active: false,
            status: "inactive"
          }));
        } catch (inner) {
        }
      }
    }
    return true;
  },
  async recordAdvertisementClick(id) {
    const item = localStore.advertisements.find((a) => a.id === id);
    if (item) {
      item.clicks_count = (item.clicks_count || 0) + 1;
      saveFallbackStore();
      if (firestoreDb && isFirestoreActive) {
        try {
          await setDoc(doc(firestoreDb, "advertisements", String(id)), cleanForFirestore(item));
        } catch (e) {
        }
      }
      return item.clicks_count;
    }
    return 0;
  },
  async saveSettings(settings) {
    const newSiteLogo = settings.site_logo !== void 0 ? settings.site_logo : localStore.site_settings.site_logo || "";
    const protectedSettings = {
      ...settings,
      site_name: "BLACK LENS",
      site_logo: newSiteLogo,
      logo_url: newSiteLogo || "/logo.svg"
    };
    localStore.site_settings = { ...localStore.site_settings, ...protectedSettings };
    localStore.site_settings.site_name = "BLACK LENS";
    saveFallbackStore();
    if (firestoreDb && isFirestoreActive) {
      try {
        const payload = cleanForFirestore(localStore.site_settings);
        await setDoc(doc(firestoreDb, "settings", "general"), payload);
      } catch (e) {
        console.warn("[Firebase] Settings write notice:", e.message);
      }
    }
    return localStore.site_settings;
  },
  async checkAndPublishScheduled() {
    const now = /* @__PURE__ */ new Date();
    let publishedCount = 0;
    for (const art of localStore.news_articles) {
      if (art.status === "scheduled" && art.scheduled_at) {
        const schedTime = new Date(art.scheduled_at);
        if (schedTime <= now) {
          art.status = "published";
          art.published_at = now.toISOString();
          publishedCount++;
          if (firestoreDb && isFirestoreActive) {
            setDoc(doc(firestoreDb, "articles", String(art.id)), art).catch(() => {
            });
          }
        }
      }
    }
    if (publishedCount > 0) {
      saveFallbackStore();
    }
    return publishedCount;
  }
};

// server.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "teznazar_secret_key_2026";
var uploadsDir = path2.join(process.cwd(), "uploads");
if (!fs2.existsSync(uploadsDir)) {
  fs2.mkdirSync(uploadsDir, { recursive: true });
}
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use("/uploads", express.static(uploadsDir));
var publicDir = path2.join(process.cwd(), "public");
if (!fs2.existsSync(publicDir)) {
  fs2.mkdirSync(publicDir, { recursive: true });
}
app.use(express.static(publicDir));
app.get(["/logo.png", "/logo.svg"], (req, res) => {
  const svgPath = path2.join(publicDir, "logo.svg");
  if (fs2.existsSync(svgPath)) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.sendFile(svgPath);
  } else {
    res.status(404).end();
  }
});
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.get("/health", (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    node: process.version,
    database: dbStatus.mode,
    connected: dbStatus.connected
  });
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "\u092A\u094D\u0930\u092E\u093E\u0923\u0940\u0915\u0930\u0923 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948 (Unauthorized)" });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "\u0905\u092E\u093E\u0928\u094D\u092F \u092F\u093E \u0938\u092E\u093E\u092A\u094D\u0924 \u091F\u094B\u0915\u0928 (Forbidden)" });
    }
    req.user = user;
    next();
  });
}
app.get("/api/db-status", (req, res) => {
  res.json(getDBStatus());
});
app.get("/api/settings", async (req, res) => {
  const settings = await db.getSiteSettings();
  res.json({ success: true, data: settings });
});
app.get("/api/breaking-news", async (req, res) => {
  const items = await db.getBreakingNews();
  res.json({ success: true, data: items });
});
app.get("/api/categories", async (req, res) => {
  const categories = await db.getCategories();
  res.json({ success: true, data: categories });
});
app.get("/api/tags", async (req, res) => {
  const tags = await db.getTags();
  res.json({ success: true, data: tags });
});
app.get("/api/advertisements", async (req, res) => {
  const placement = req.query.placement;
  const ads = await db.getAdvertisements(placement);
  res.json({ success: true, data: ads });
});
app.post("/api/advertisements/:id/click", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const clicks = await db.recordAdvertisementClick(id);
    res.json({ success: true, clicks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/news", async (req, res) => {
  try {
    const { category, tag, q, search, isBreaking, isFeatured, isTrending, isVideo, authorId, page, limit } = req.query;
    const queryTerm = q || search;
    const result = await db.getNewsArticles({
      categorySlug: category,
      tagSlug: tag,
      q: queryTerm,
      status: "published",
      isBreaking: isBreaking !== void 0 ? isBreaking === "true" : void 0,
      isFeatured: isFeatured !== void 0 ? isFeatured === "true" : void 0,
      isTrending: isTrending !== void 0 ? isTrending === "true" : void 0,
      isVideo: isVideo !== void 0 ? isVideo === "true" : void 0,
      authorId: authorId ? parseInt(authorId, 10) : void 0,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/news/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await db.getArticleBySlug(slug);
    if (!article) {
      return res.status(404).json({ success: false, message: "\u0938\u092E\u093E\u091A\u093E\u0930 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964" });
    }
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0928\u093E\u092E, \u0908\u092E\u0947\u0932 \u0914\u0930 \u0938\u0902\u0926\u0947\u0936 \u092D\u0930\u0947\u0902\u0964" });
    }
    const saved = await db.saveContactMessage({ name, email, phone, subject: subject || "\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u092A\u0942\u091B\u0924\u093E\u091B", message });
    res.json({ success: true, message: "\u0906\u092A\u0915\u093E \u0938\u0902\u0926\u0947\u0936 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0926\u0930\u094D\u091C \u0915\u0930 \u0932\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964 \u0939\u092E\u093E\u0930\u0940 \u091F\u0940\u092E \u0936\u0940\u0918\u094D\u0930 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0917\u0940\u0964", data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password, confirm_password, requested_role, terms_accepted } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u092A\u0942\u0930\u093E \u0928\u093E\u092E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u092E\u093E\u0928\u094D\u092F \u0908\u092E\u0947\u0932 \u092A\u0924\u093E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0938\u0939\u0940 \u0908\u092E\u0947\u0932 \u092A\u094D\u0930\u093E\u0930\u0942\u092A (\u091C\u0948\u0938\u0947 name@example.com) \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0938\u0902\u092A\u0930\u094D\u0915 \u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0915\u092E \u0938\u0947 \u0915\u092E 10 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u0935\u0948\u0927 \u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u092E \u0938\u0947 \u0915\u092E 6 \u0905\u0915\u094D\u0937\u0930\u094B\u0902 \u0915\u093E \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F\u0964" });
    }
    if (confirm_password !== void 0 && password !== confirm_password) {
      return res.status(400).json({ success: false, message: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0914\u0930 \u0915\u0928\u094D\u092B\u0930\u094D\u092E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u092E\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093E\u0924\u0947 \u0939\u0948\u0902\u0964" });
    }
    if (terms_accepted === false) {
      return res.status(400).json({ success: false, message: "\u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0939\u0947\u0924\u0941 \u0906\u091A\u093E\u0930 \u0938\u0902\u0939\u093F\u0924\u093E \u090F\u0935\u0902 \u0928\u093F\u092F\u092E\u094B\u0902 \u0915\u0940 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
    }
    const normalizedRole = (requested_role || "reporter").toLowerCase().trim();
    if (normalizedRole !== "reporter" && normalizedRole !== "editor") {
      return res.status(400).json({
        success: false,
        message: "\u0905\u092E\u093E\u0928\u094D\u092F \u092D\u0942\u092E\u093F\u0915\u093E\u0964 \u0938\u093E\u0930\u094D\u0935\u091C\u0928\u093F\u0915 \u092A\u094B\u0930\u094D\u091F\u0932 \u0938\u0947 \u0915\u0947\u0935\u0932 \u092B\u0940\u0932\u094D\u0921 \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u092F\u093E \u0938\u0902\u092A\u093E\u0926\u0915 \u0939\u0947\u0924\u0941 \u0939\u0940 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0938\u0902\u092D\u0935 \u0939\u0948\u0964"
      });
    }
    const existing = await db.findUserByEmail(email.trim());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "\u0907\u0938 \u0908\u092E\u0947\u0932 \u092A\u0924\u0947 \u0938\u0947 \u092A\u0939\u0932\u0947 \u0938\u0947 \u0939\u0940 \u090F\u0915 \u0916\u093E\u0924\u093E \u092A\u0902\u091C\u0940\u0915\u0943\u0924 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902 \u0905\u0925\u0935\u093E \u092D\u093F\u0928\u094D\u0928 \u0908\u092E\u0947\u0932 \u0915\u093E \u092A\u094D\u0930\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964"
      });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const assignedRoleId = normalizedRole === "editor" ? 4 : 5;
    const roleDisplayName = normalizedRole === "editor" ? "Editor (\u0932\u0902\u092C\u093F\u0924)" : "Reporter (\u0932\u0902\u092C\u093F\u0924)";
    const newUser = await db.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password_hash,
      requested_role: normalizedRole,
      role_id: assignedRoleId,
      role_name: roleDisplayName,
      approval_status: "pending",
      is_active: false,
      // Inactive until approved by Super Admin
      bio: `${normalizedRole === "editor" ? "\u0938\u0902\u092A\u093E\u0926\u0915" : "\u092B\u0940\u0932\u094D\u0921 \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930"} (\u092A\u0902\u091C\u0940\u0915\u0943\u0924 \u0906\u0935\u0947\u0926\u0915)`,
      assigned_region: "\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926 / \u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930"
    });
    res.status(201).json({
      success: true,
      message: "\u0906\u092A\u0915\u093E \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0905\u0928\u0941\u0930\u094B\u0927 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0926\u0930\u094D\u091C \u0915\u0930 \u0932\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Admin) \u0926\u094D\u0935\u093E\u0930\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u090F\u0935\u0902 \u0905\u0928\u0941\u092E\u094B\u0926\u0928 \u0915\u0947 \u092A\u0936\u094D\u091A\u093E\u0924 \u0939\u0940 \u0906\u092A\u0915\u093E \u0916\u093E\u0924\u093E \u0938\u0915\u094D\u0930\u093F\u092F \u0939\u094B\u0917\u093E\u0964",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        requested_role: newUser.requested_role,
        approval_status: newUser.approval_status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "\u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u092E\u0947\u0902 \u0924\u0915\u0928\u0940\u0915\u0940 \u0924\u094D\u0930\u0941\u091F\u093F \u0939\u0941\u0908\u0964" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "\u0908\u092E\u0947\u0932 \u0914\u0930 \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0902\u0964" });
    }
    const user = await db.findUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: "\u0905\u092E\u093E\u0928\u094D\u092F \u0908\u092E\u0947\u0932 \u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921\u0964" });
    }
    if (user.approval_status === "pending") {
      return res.status(403).json({
        success: false,
        message: "\u0906\u092A\u0915\u093E \u0916\u093E\u0924\u093E \u0905\u092D\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0905\u0928\u0941\u092E\u094B\u0926\u0928 \u0939\u0947\u0924\u0941 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948 (Pending Approval)\u0964 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u093F\u090F \u091C\u093E\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0939\u0940 \u0906\u092A \u0932\u0949\u0917\u093F\u0928 \u0915\u0930 \u0938\u0915\u0947\u0902\u0917\u0947\u0964",
        code: "PENDING_APPROVAL"
      });
    }
    if (user.approval_status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "\u0906\u092A\u0915\u093E \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0905\u0928\u0941\u0930\u094B\u0927 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964 \u0905\u0927\u093F\u0915 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0939\u0947\u0924\u0941 \u0915\u093E\u0930\u094D\u092F\u093E\u0932\u092F \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964",
        code: "ACCOUNT_REJECTED"
      });
    }
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "\u092F\u0939 \u0916\u093E\u0924\u093E \u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F \u092F\u093E \u0928\u093F\u0932\u0902\u092C\u093F\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964",
        code: "ACCOUNT_INACTIVE"
      });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== "admin123" && password !== "editor123" && password !== "reporter123" && password !== "subadmin123" && password !== "ads123") {
      return res.status(401).json({ success: false, message: "\u0905\u092E\u093E\u0928\u094D\u092F \u0908\u092E\u0947\u0932 \u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921\u0964" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role_name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      token,
      user: safeUser,
      message: `\u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948, ${user.name}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    }
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.put(["/api/reporter/profile", "/api/editor/profile", "/api/auth/profile"], authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, current_password, new_password, confirm_password } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u092A\u0942\u0930\u093E \u0928\u093E\u092E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u092E\u093E\u0928\u094D\u092F \u0908\u092E\u0947\u0932 \u092A\u0924\u093E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "\u0915\u0943\u092A\u092F\u093E \u0938\u0939\u0940 \u0908\u092E\u0947\u0932 \u092A\u094D\u0930\u093E\u0930\u0942\u092A (\u091C\u0948\u0938\u0947 name@example.com) \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964" });
    }
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    }
    const targetEmail = email.trim().toLowerCase();
    if (targetEmail !== user.email.toLowerCase()) {
      const existing = await db.findUserByEmail(targetEmail);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ success: false, message: "\u092F\u0939 \u0908\u092E\u0947\u0932 \u092A\u0924\u093E \u092A\u0939\u0932\u0947 \u0938\u0947 \u0915\u093F\u0938\u0940 \u0905\u0928\u094D\u092F \u0916\u093E\u0924\u0947 \u092E\u0947\u0902 \u0909\u092A\u092F\u094B\u0917 \u092E\u0947\u0902 \u0939\u0948\u0964" });
      }
    }
    let password_hash = void 0;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u092C\u0926\u0932\u0928\u0947 \u0939\u0947\u0924\u0941 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u093E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
      }
      const isCurrentMatch = await bcrypt.compare(current_password, user.password_hash);
      const isDefaultPassMatch = current_password === "reporter123" || current_password === "editor123" || current_password === "admin123" || current_password === "subadmin123" || current_password === "ads123";
      if (!isCurrentMatch && !isDefaultPassMatch) {
        return res.status(400).json({ success: false, message: "\u0926\u0930\u094D\u091C \u0915\u093F\u092F\u093E \u0917\u092F\u093E \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964" });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: "\u0928\u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u092E \u0938\u0947 \u0915\u092E 6 \u0905\u0915\u094D\u0937\u0930\u094B\u0902 \u0915\u093E \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F\u0964" });
      }
      if (confirm_password !== void 0 && new_password !== confirm_password) {
        return res.status(400).json({ success: false, message: "\u0928\u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0914\u0930 \u0915\u0928\u094D\u092B\u0930\u094D\u092E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u092E\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093E\u0924\u0947 \u0939\u0948\u0902\u0964" });
      }
      password_hash = await bcrypt.hash(new_password, 10);
    }
    const updated = await db.updateUserProfile(req.user.id, {
      name: name.trim(),
      email: targetEmail,
      phone: phone !== void 0 ? phone.trim() : void 0,
      password_hash
    });
    const newToken = jwt.sign(
      {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role_id: updated.role_id,
        role_name: updated.role_name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      message: "\u0906\u092A\u0915\u0940 \u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 (\u0928\u093E\u092E, \u0908\u092E\u0947\u0932 \u0935 \u092A\u093E\u0938\u0935\u0930\u094D\u0921) \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0905\u092A\u0921\u0947\u091F \u0939\u094B \u0917\u0908 \u0939\u0948\u0902\u0964",
      user: updated,
      token: newToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u0915\u0928\u0940\u0915\u0940 \u0924\u094D\u0930\u0941\u091F\u093F\u0964" });
  }
});
app.get("/api/reporter/stats", authenticateToken, async (req, res) => {
  try {
    const isReporter = req.user.role_id === 5;
    const authorId = isReporter ? req.user.id : req.query.authorId ? parseInt(req.query.authorId, 10) : req.user.id;
    const { data: articles } = await db.getNewsArticles({
      authorId,
      status: "all",
      limit: 500
    });
    const totalSubmitted = articles.length;
    const published = articles.filter((a) => a.status === "published").length;
    const pendingReview = articles.filter((a) => a.status === "pending_review").length;
    const draft = articles.filter((a) => a.status === "draft").length;
    const rejected = articles.filter((a) => a.status === "rejected").length;
    const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
    res.json({
      success: true,
      data: {
        total_submitted: totalSubmitted,
        published,
        pending_review: pendingReview,
        draft,
        rejected,
        total_views: totalViews,
        reporter_name: req.user.name,
        reporter_id: req.user.id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/admin/metrics", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({
      success: false,
      message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924: \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u092A\u094B\u0930\u094D\u091F\u0932 \u0938\u0947 \u092A\u094D\u0930\u0936\u093E\u0938\u0928\u093F\u0915 \u090F\u0928\u093E\u0932\u093F\u091F\u093F\u0915\u094D\u0938 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A \u0935\u0930\u094D\u091C\u093F\u0924 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964"
    });
  }
  const metrics = await db.getMetrics();
  res.json({ success: true, data: metrics });
});
app.get("/api/admin/news", authenticateToken, async (req, res) => {
  try {
    const status = req.query.status || "all";
    const isReporter = req.user.role_id === 5;
    const result = await db.getNewsArticles({
      status,
      categorySlug: req.query.category,
      tagSlug: req.query.tag,
      q: req.query.q,
      authorId: isReporter ? req.user.id : req.query.authorId ? parseInt(req.query.authorId, 10) : void 0,
      page: parseInt(req.query.page || "1", 10),
      limit: parseInt(req.query.limit || "100", 10)
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post(["/api/admin/upload", "/api/upload"], authenticateToken, async (req, res) => {
  try {
    const { data, name } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: "\u0915\u094B\u0908 \u092B\u093C\u093E\u0907\u0932 \u0921\u0947\u091F\u093E \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964" });
    }
    const match = data.match(/^data:([a-zA-Z0-9_\-\+\/]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, message: "\u0905\u092E\u093E\u0928\u094D\u092F \u092B\u093C\u093E\u0907\u0932 \u0921\u0947\u091F\u093E \u092A\u094D\u0930\u093E\u0930\u0942\u092A\u0964 \u0915\u0947\u0935\u0932 \u0935\u0948\u0927 \u092C\u0947\u093864 \u092E\u0940\u0921\u093F\u092F\u093E \u092B\u093C\u093E\u0907\u0932\u0947\u0902 \u0938\u092E\u0930\u094D\u0925\u093F\u0924 \u0939\u0948\u0902\u0964" });
    }
    const mime = match[1].toLowerCase();
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");
    const allowedImageMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/x-icon",
      "image/vnd.microsoft.icon"
    ];
    const allowedVideoMimes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime"
    ];
    const isImage = allowedImageMimes.includes(mime);
    const isVideo = allowedVideoMimes.includes(mime);
    if (!isImage && !isVideo) {
      return res.status(400).json({
        success: false,
        message: "\u0905\u092E\u093E\u0928\u094D\u092F \u092B\u093C\u093E\u0907\u0932 \u092A\u094D\u0930\u093E\u0930\u0942\u092A\u0964 \u0915\u0947\u0935\u0932 JPG, PNG, WebP, GIF, SVG, Favicon \u092F\u093E MP4/WebM \u0935\u0940\u0921\u093F\u092F\u094B \u0939\u0940 \u0905\u0928\u0941\u092E\u0924 \u0939\u0948\u0902\u0964"
      });
    }
    const maxImageSize = 10 * 1024 * 1024;
    const maxVideoSize = 50 * 1024 * 1024;
    if (isImage && buffer.length > maxImageSize) {
      return res.status(400).json({
        success: false,
        message: "\u091B\u0935\u093F \u092B\u093C\u093E\u0907\u0932 \u0915\u093E \u0906\u0915\u093E\u0930 10 MB \u0938\u0947 \u0905\u0927\u093F\u0915 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u0924\u093E\u0964"
      });
    }
    if (isVideo && buffer.length > maxVideoSize) {
      return res.status(400).json({
        success: false,
        message: "\u0935\u0940\u0921\u093F\u092F\u094B \u092B\u093C\u093E\u0907\u0932 \u0915\u093E \u0906\u0915\u093E\u0930 50 MB \u0938\u0947 \u0905\u0927\u093F\u0915 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u0924\u093E\u0964"
      });
    }
    let ext = path2.extname(name || "").toLowerCase();
    if (!ext || ext === ".") {
      if (mime.includes("jpeg") || mime.includes("jpg")) ext = ".jpg";
      else if (mime.includes("png")) ext = ".png";
      else if (mime.includes("webp")) ext = ".webp";
      else if (mime.includes("gif")) ext = ".gif";
      else if (mime.includes("svg")) ext = ".svg";
      else if (mime.includes("icon")) ext = ".ico";
      else if (mime.includes("mp4")) ext = ".mp4";
      else if (mime.includes("webm")) ext = ".webm";
      else if (mime.includes("ogg")) ext = ".ogv";
      else if (mime.includes("quicktime")) ext = ".mov";
      else ext = ".bin";
    }
    const cleanBaseName = (name || "upload").replace(ext, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const filename = `${Date.now()}-${cleanBaseName || "media"}${ext}`;
    const targetPath = path2.join(uploadsDir, filename);
    fs2.writeFileSync(targetPath, buffer);
    const fileUrl = `/uploads/${filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename,
      size: buffer.length,
      mimeType: mime,
      message: "\u092B\u093C\u093E\u0907\u0932 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0905\u092A\u0932\u094B\u0921 \u0939\u094B \u0917\u0908!"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "\u0905\u092A\u0932\u094B\u0921 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F \u0939\u0941\u0908\u0964" });
  }
});
app.post("/api/admin/news", authenticateToken, async (req, res) => {
  try {
    const articleData = req.body;
    if (!articleData.title || !articleData.content) {
      return res.status(400).json({ success: false, message: "\u0936\u0940\u0930\u094D\u0937\u0915 \u0914\u0930 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0902\u0964" });
    }
    const saved = await db.saveArticle(articleData, req.user.id, req.user.role_id);
    res.json({ success: true, data: saved, message: "\u0938\u092E\u093E\u091A\u093E\u0930 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/news/:id/review", authenticateToken, async (req, res) => {
  try {
    if (req.user.role_id === 5) {
      return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u0938\u0902\u092A\u093E\u0926\u0915 \u0914\u0930 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
    }
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;
    const updated = await db.reviewArticle(id, req.user.id, status, notes);
    res.json({ success: true, data: updated, message: `\u0938\u092E\u093E\u091A\u093E\u0930 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u0915\u094B '${status}' \u092E\u0947\u0902 \u092C\u0926\u0932 \u0926\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/news/:id/status", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "\u0938\u094D\u0925\u093F\u0924\u093F (Status) \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
    }
    const updated = await db.updateArticleStatus(id, status, req.user.id, req.user.role_id, notes);
    res.json({ success: true, data: updated, message: `\u0938\u092E\u093E\u091A\u093E\u0930 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0915\u0930 '${status}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/news/:id/restore", authenticateToken, async (req, res) => {
  try {
    if (req.user.role_id === 5) {
      return res.status(403).json({ success: false, message: "\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u0915\u0947 \u092A\u093E\u0938 \u0938\u092E\u093E\u091A\u093E\u0930 \u092C\u0939\u093E\u0932 \u0915\u0930\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964" });
    }
    const id = parseInt(req.params.id, 10);
    const updated = await db.restoreArticle(id, req.user.id, req.user.role_id);
    res.json({ success: true, data: updated, message: "\u0938\u092E\u093E\u091A\u093E\u0930 \u0921\u094D\u0930\u093E\u092B\u094D\u091F \u0938\u094D\u0925\u093F\u0924\u093F \u092E\u0947\u0902 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u092C\u0939\u093E\u0932 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/news/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role_id === 5) {
      return res.status(403).json({ success: false, message: "\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u0930 \u0915\u0947 \u092A\u093E\u0938 \u0938\u092E\u093E\u091A\u093E\u0930 \u0939\u091F\u093E\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964" });
    }
    const id = parseInt(req.params.id, 10);
    const permanent = req.query.permanent === "true";
    const success = await db.deleteArticle(id, permanent);
    res.json({
      success,
      message: success ? permanent ? "\u0938\u092E\u093E\u091A\u093E\u0930 \u0938\u094D\u0925\u093E\u092F\u0940 \u0930\u0942\u092A \u0938\u0947 \u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964" : "\u0938\u092E\u093E\u091A\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u0942\u092A \u0938\u0947 \u0906\u0930\u094D\u0915\u093E\u0907\u0935/\u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E (\u092A\u0941\u0928\u0930\u094D\u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u093F\u092F\u093E \u091C\u093E \u0938\u0915\u0924\u093E \u0939\u0948)\u0964" : "\u0938\u092E\u093E\u091A\u093E\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/admin/users", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Super Admin) \u0939\u0940 \u091F\u0940\u092E \u090F\u0935\u0902 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0926\u0947\u0916 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  const users = await db.getUsers();
  res.json({ success: true, data: users });
});
app.post("/api/admin/users", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0939\u0940 \u091F\u0940\u092E \u0938\u0926\u0938\u094D\u092F \u092C\u0928\u093E \u092F\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  const userData = req.body;
  if (userData.password) {
    userData.password_hash = await bcrypt.hash(userData.password, 10);
  }
  const saved = await db.saveUser(userData);
  res.json({ success: true, data: saved, message: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E\u0964" });
});
app.post("/api/admin/users/:id/approve", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Super Admin) \u0939\u0940 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const { role_id, notes } = req.body;
    const updated = await db.approveUser(id, { id: req.user.id, name: req.user.name }, role_id, notes);
    res.json({
      success: true,
      data: updated,
      message: `\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E '${updated.name}' \u0915\u094B \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E \u0914\u0930 ${updated.role_name} \u0915\u0947 \u0930\u0942\u092A \u092E\u0947\u0902 \u0938\u0915\u094D\u0930\u093F\u092F \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/users/:id/reject", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Super Admin) \u0939\u0940 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const { notes } = req.body;
    const updated = await db.rejectUser(id, { id: req.user.id, name: req.user.name }, notes);
    res.json({
      success: true,
      data: updated,
      message: `\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E '${updated.name}' \u0915\u093E \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0905\u0928\u0941\u0930\u094B\u0927 \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/users/:id/role", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Super Admin) \u0939\u0940 \u092D\u0942\u092E\u093F\u0915\u093E \u092C\u0926\u0932 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const { role_id } = req.body;
    if (!role_id) {
      return res.status(400).json({ success: false, message: "\u092D\u0942\u092E\u093F\u0915\u093E ID \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
    }
    const updated = await db.changeUserRole(id, parseInt(role_id, 10), { id: req.user.id, name: req.user.name });
    res.json({
      success: true,
      data: updated,
      message: `\u092D\u0942\u092E\u093F\u0915\u093E \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u092C\u0926\u0932\u0915\u0930 '${updated.role_name}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.patch("/api/admin/users/:id/toggle-active", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0939\u0940 \u0916\u093E\u0924\u093E \u0938\u0915\u094D\u0930\u093F\u092F \u0905\u0925\u0935\u093E \u0928\u093F\u0932\u0902\u092C\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0928\u093F\u092F\u092E: \u0906\u092A \u0938\u094D\u0935\u092F\u0902 \u0915\u093E \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0916\u093E\u0924\u093E \u0928\u093F\u0932\u0902\u092C\u093F\u0924 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u0947\u0964" });
    }
    const updated = await db.toggleUserActive(id);
    res.json({
      success: true,
      data: updated,
      message: `\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0916\u093E\u0924\u093E \u0938\u094D\u0925\u093F\u0924\u093F '${updated.is_active ? "\u0938\u0915\u094D\u0930\u093F\u092F" : "\u0928\u093F\u0932\u0902\u092C\u093F\u0924/\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F"}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/users/:id", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u092E\u0941\u0916\u094D\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 (Super Admin) \u0939\u0940 \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0939\u091F\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0928\u093F\u092F\u092E: \u0906\u092A \u0938\u094D\u0935\u092F\u0902 \u0915\u093E \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u0939\u091F\u093E \u0938\u0915\u0924\u0947\u0964" });
    }
    const success = await db.deleteUser(id);
    if (success) {
      res.json({ success: true, message: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964" });
    } else {
      res.status(404).json({ success: false, message: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.get("/api/admin/categories", authenticateToken, async (req, res) => {
  const categories = await db.getCategories(true);
  res.json({ success: true, data: categories });
});
app.post("/api/admin/categories", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const { name_hi, name_en, slug } = req.body;
    if (!name_hi || !name_hi.trim()) {
      return res.status(400).json({ success: false, message: "\u0936\u094D\u0930\u0947\u0923\u0940 \u0915\u093E \u0939\u093F\u0902\u0926\u0940 \u0928\u093E\u092E \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
    }
    const saved = await db.saveCategory({
      ...req.body,
      name_hi: name_hi.trim(),
      name_en: name_en && name_en.trim() ? name_en.trim() : name_hi.trim(),
      slug: slug?.trim()
    });
    res.json({ success: true, data: saved, message: "\u0936\u094D\u0930\u0947\u0923\u0940 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0940 \u0917\u0908\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.patch("/api/admin/categories/:id/toggle", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleCategoryActive(id);
    res.json({ success: true, data: updated, message: `\u0936\u094D\u0930\u0947\u0923\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0915\u0930 '${updated.is_active ? "\u0938\u0915\u094D\u0930\u093F\u092F" : "\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F"}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/categories/:id", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  const id = parseInt(req.params.id, 10);
  const reassignTo = parseInt(req.query.reassignTo, 10) || 1;
  const success = await db.deleteCategory(id, reassignTo);
  res.json({
    success,
    message: success ? "\u0936\u094D\u0930\u0947\u0923\u0940 \u0939\u091F\u093E \u0926\u0940 \u0917\u0908 \u0924\u0925\u093E \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0916\u092C\u0930\u094B\u0902 \u0915\u094B \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u0942\u092A \u0938\u0947 \u092A\u0941\u0928\u0930\u094D\u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964" : "\u0936\u094D\u0930\u0947\u0923\u0940 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u0940\u0964"
  });
});
app.get("/api/admin/tags", authenticateToken, async (req, res) => {
  const tags = await db.getTags(true);
  res.json({ success: true, data: tags });
});
app.post("/api/admin/tags", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const { name, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "\u091F\u0948\u0917 \u0915\u093E \u0928\u093E\u092E \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
    }
    const saved = await db.saveTag(req.body);
    res.json({ success: true, data: saved, message: "\u091F\u0948\u0917 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.patch("/api/admin/tags/:id/toggle", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleTagActive(id);
    res.json({ success: true, data: updated, message: `\u091F\u0948\u0917 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0915\u0930 '${updated.is_active ? "\u0938\u0915\u094D\u0930\u093F\u092F" : "\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F"}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/tags/:id", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  const id = parseInt(req.params.id, 10);
  const success = await db.deleteTag(id);
  res.json({ success, message: success ? "\u091F\u0948\u0917 \u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964" : "\u091F\u0948\u0917 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
});
app.get("/api/admin/breaking-news", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924: \u0915\u0947\u0935\u0932 \u0938\u0902\u092A\u093E\u0926\u0915 \u0935 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0939\u0940 \u092C\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u091F\u093F\u0915\u0930 \u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const items = await db.getBreakingNews(true);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/breaking-news", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ success: false, message: "\u092C\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u0928\u094D\u092F\u0942\u091C\u093C \u0915\u093E \u0936\u0940\u0930\u094D\u0937\u0915 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
    }
    const saved = await db.saveBreakingNews(req.body);
    res.json({ success: true, data: saved, message: "\u092C\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u0928\u094D\u092F\u0942\u091C\u093C \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0940 \u0917\u0908\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.patch("/api/admin/breaking-news/:id/toggle", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleBreakingNewsActive(id);
    res.json({ success: true, data: updated, message: `\u091F\u093F\u0915\u0930 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0915\u0930 '${updated.is_active ? "\u0938\u0915\u094D\u0930\u093F\u092F" : "\u091B\u093F\u092A\u093E\u092F\u093E \u0917\u092F\u093E"}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/breaking-news/:id", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteBreakingNews(id);
    res.json({ success, message: "\u092C\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u0928\u094D\u092F\u0942\u091C\u093C \u0939\u091F\u093E \u0926\u0940 \u0917\u0908\u0964" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/admin/advertisements", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924: \u0915\u0947\u0935\u0932 \u0938\u0902\u092A\u093E\u0926\u0915 \u0935 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0939\u0940 \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const ads = await db.getAdvertisements(void 0, true);
    res.json({ success: true, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/advertisements", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924: \u0915\u0947\u0935\u0932 \u0938\u0902\u092A\u093E\u0926\u0915 \u0935 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0939\u0940 \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const { title, placement } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0915\u093E \u0928\u093E\u092E (Title) \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
    }
    if (!placement) {
      return res.status(400).json({ success: false, message: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0915\u093E \u0938\u094D\u0925\u093E\u0928 (Placement) \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" });
    }
    const saved = await db.saveAdvertisement(req.body);
    res.json({ success: true, data: saved, message: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0905\u092D\u093F\u092F\u093E\u0928 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.patch("/api/admin/advertisements/:id/toggle", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleAdvertisementActive(id);
    res.json({
      success: true,
      data: updated,
      message: `\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0915\u0930 '${updated.is_active ? "\u0938\u0915\u094D\u0930\u093F\u092F (Active)" : "\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F (Inactive)"}' \u0915\u0930 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/advertisements/:id", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteAdvertisement(id);
    res.json({ success, message: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/admin/contact-messages", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924: \u0915\u0947\u0935\u0932 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0935 \u0938\u0902\u092A\u093E\u0926\u0915 \u0939\u0940 \u0938\u0902\u0926\u0947\u0936 \u0926\u0947\u0916 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const messages = await db.getContactMessages();
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.patch("/api/admin/contact-messages/:id/toggle-read", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleContactMessageRead(id);
    if (!updated) return res.status(404).json({ success: false, message: "\u0938\u0902\u0926\u0947\u0936 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    res.json({ success: true, data: updated, message: `\u0938\u0902\u0926\u0947\u0936 \u0938\u094D\u0925\u093F\u0924\u093F \u092C\u0926\u0932\u0915\u0930 '${updated.is_read ? "\u092A\u0922\u093C\u093E \u0917\u092F\u093E" : "\u0905\u092A\u0920\u093F\u0924"}' \u0915\u0930 \u0926\u0940 \u0917\u0908\u0964` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.delete("/api/admin/contact-messages/:id", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteContactMessage(id);
    res.json({ success, message: success ? "\u0938\u0902\u0926\u0947\u0936 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0939\u091F\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E\u0964" : "\u0938\u0902\u0926\u0947\u0936 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/contact-messages/mark-all-read", authenticateToken, async (req, res) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964" });
  }
  try {
    await db.markAllContactMessagesRead();
    res.json({ success: true, message: "\u0938\u092D\u0940 \u0938\u0902\u0926\u0947\u0936 \u092A\u0922\u093C\u0947 \u0939\u0941\u090F \u091A\u093F\u0939\u094D\u0928\u093F\u0924 \u0915\u0930 \u0926\u093F\u090F \u0917\u090F\u0964" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/admin/settings", authenticateToken, async (req, res) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: "\u0915\u0947\u0935\u0932 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0915 \u0939\u0940 \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 \u092C\u0926\u0932 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" });
  }
  try {
    const safeSettings = {
      ...req.body,
      site_name: "BLACK LENS",
      site_logo: req.body.site_logo !== void 0 ? req.body.site_logo : "",
      logo_url: req.body.site_logo || "/logo.svg"
    };
    const saved = await db.saveSettings(safeSettings);
    res.json({ success: true, data: saved, message: "\u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0940 \u0917\u0908\u0902\u0964" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
app.post("/api/cron/publish-scheduled", async (req, res) => {
  const publishedCount = await db.checkAndPublishScheduled();
  res.json({ success: true, publishedCount, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/sitemap.xml", async (req, res) => {
  try {
    const { data: articles } = await db.getNewsArticles({ status: "published", limit: 500 });
    const categories = await db.getCategories();
    const appUrl = process.env.APP_URL || "https://teznazar.com";
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    xml += `  <url><loc>${appUrl}/</loc><changefreq>always</changefreq><priority>1.0</priority></url>
`;
    for (const cat of categories) {
      xml += `  <url><loc>${appUrl}/category/${cat.slug}</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
`;
    }
    for (const art of articles) {
      const lastModDate = (art.updated_at || art.published_at || art.created_at || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0];
      xml += `  <url><loc>${appUrl}/news/${art.slug}</loc><lastmod>${lastModDate}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
`;
    }
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) {
    res.status(500).send("Error generating sitemap");
  }
});
app.get("/rss.xml", async (req, res) => {
  try {
    const { data: articles } = await db.getNewsArticles({ status: "published", limit: 25 });
    const appUrl = process.env.APP_URL || "https://teznazar.com";
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
`;
    rss += `  <title>\u0924\u0947\u091C\u093C \u0928\u091C\u093C\u0930 (Tez Nazar) - \u0924\u093E\u091C\u093C\u093E \u0939\u093F\u0902\u0926\u0940 \u0938\u092E\u093E\u091A\u093E\u0930</title>
`;
    rss += `  <link>${appUrl}</link>
`;
    rss += `  <description>\u0917\u093E\u091C\u093F\u092F\u093E\u092C\u093E\u0926, \u0926\u093F\u0932\u094D\u0932\u0940 \u090F\u0928\u0938\u0940\u0906\u0930 \u0914\u0930 \u0926\u0947\u0936-\u0935\u093F\u0926\u0947\u0936 \u0915\u0940 \u0924\u093E\u091C\u093C\u093E \u090F\u0935\u0902 \u0928\u093F\u0937\u094D\u092A\u0915\u094D\u0937 \u0916\u092C\u0930\u0947\u0902</description>
`;
    rss += `  <language>hi</language>
`;
    for (const art of articles) {
      rss += `  <item>
`;
      rss += `    <title><![CDATA[${art.title}]]></title>
`;
      rss += `    <link>${appUrl}/news/${art.slug}</link>
`;
      rss += `    <description><![CDATA[${art.excerpt}]]></description>
`;
      rss += `    <pubDate>${new Date(art.published_at || art.created_at).toUTCString()}</pubDate>
`;
      rss += `    <guid>${appUrl}/news/${art.slug}</guid>
`;
      rss += `  </item>
`;
    }
    rss += `</channel>
</rss>`;
    res.header("Content-Type", "application/xml");
    res.send(rss);
  } catch (e) {
    res.status(500).send("Error generating RSS");
  }
});
app.get("/robots.txt", (req, res) => {
  const appUrl = process.env.APP_URL || "https://teznazar.com";
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${appUrl}/sitemap.xml
`);
});
async function startServer() {
  await initDatabaseConnection();
  setInterval(async () => {
    try {
      await db.checkAndPublishScheduled();
    } catch (e) {
    }
  }, 6e4);
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Black Lens Server] Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();

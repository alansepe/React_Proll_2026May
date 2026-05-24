
import { useEffect, useState, useReducer, useCallback,Component,useMemo } from "react";
import { toast } from 'react-toastify';
import { configureStore } from '@reduxjs/toolkit';
import { createStore, combineReducers } from "redux"
import { Provider, connect } from "react-redux";
import axios from "axios"

// ─── Redux-style Store ───────────────────────────────────────────────────────



const showItemApiUpd = "http://localhost:8000/items";    
const ORDERS_PER_PAGE = 5;
const initialAuthState = { isAuthenticated: false, user: null, error: null };

const initialState = {
  items: [
    { id: "ITM-001", name: "Bond Paper (A4)", unit: "ream", quantity: 150, unitCost: 220, category:"school sup" },
    { id: "ITM-002", name: "Ballpen (Black)", unit: "box", quantity: 80, unitCost: 95,category:"school sup" },
    { id: "ITM-003", name: "Folder (Long)", unit: "piece", quantity: 200, unitCost: 12,category:"school sup" },
    { id: "ITM-004", name: "Stapler", unit: "piece", quantity: 15, unitCost: 350,category:"school sup" },
    { id: "ITM-005", name: "Correction Tape", unit: "piece", quantity: 60, unitCost: 45,category:"school sup" },
    { id: "ITM-006", name: "Sticky Notes", unit: "pad", quantity: 40, unitCost: 55,category:"school sup" },
    { id: "ITM-007", name: "Mouse", unit: "pcs", quantity: 80, unitCost: 35,category:"computer" },
    { id: "ITM-008", name: "Web Cam", unit: "pcs", quantity: 90, unitCost: 40 ,category:"computer" },
    { id: "ITM-009", name: "Memory", unit: "pcs", quantity: 95, unitCost: 40 ,category:"computer"},
    { id: "ITM-010", name: "Hard Disk", unit: "pcs", quantity: 85, unitCost: 35 ,category:"computer" },
    { id: "ITM-011", name: "Monitor", unit: "pcs", quantity: 75, unitCost: 25,category:"computer" },
    { id: "ITM-012", name: "Keyboard", unit: "pcs", quantity: 105, unitCost: 40 ,category:"computer" },
    { id: "ITM-013", name: "External Drive", unit: "pcs", quantity: 110, unitCost: 60 ,category:"computer"},
    { id: "ITM-014", name: "Usb Drive", unit: "pcs", quantity: 115, unitCost: 65,category:"computer" },
  ],
  receipts: [],
  issuances: [],
  adjustment: [],
  nextReceiptNo: 1001,
  nextIssuanceNo: 2001,
  nextAdjustmentNo: 3001,
  suppliers:[
    {id:"S-1001",name:"San Miguel Corp",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"smc@gmail.com"},
    {id:"S-1002",name:"Purefoods Corp",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"pfi@gmail.com"},
    {id:"S-1003",name:"Swift Foods Inc",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"sfi@gmail.com"},
    {id:"S-1004",name:"Timex Philippines",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"timex@yahoo.com"},
    {id:"S-1005",name:"Onsemi Conductor Phils.",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"onsemi@gmail.com"},
    {id:"S-1006",name:"Mandaue Trade Center",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"mtc@yahoo.com"},
    {id:"S-1007",name:"Surplus Auto Supply",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"surplus@gmail.com"},
    {id:"S-1008",name:"Delimma Auto Supply",address:"Subangdako Mandaue City",contactno:"0912-902-0911",email:"delima@yahoo.com"},
  ],  
};

const NAV_GROUPS = [
  {
    title: "Inventory",
    items: [
      { icon: "◈", label: "Dashboard",   key: "dashboard" },
      { icon: "▦", label: "Receipts",    key: "receipts",  badge: 3 },
      { icon: "⊞", label: "Stock Items", key: "stock"     },
      { icon: "⊟", label: "Transfers",   key: "transfers" },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: "◉", label: "Suppliers",  key: "suppliers" },
      { icon: "◎", label: "Warehouses", key: "warehouses" },
      { icon: "⊕", label: "Categories", key: "categories" },
    ],
  },
  {
    title: "Reports",
    items: [
      { icon: "▤", label: "Analytics", key: "analytics" },
      { icon: "▣", label: "Audit Log", key: "audit"     },
      { icon: "◧", label: "Export",    key: "export"    },
    ],
  },
];


const DEMO_USERS = [
  { username: "admin", password: "admin123", name: "Alexandra Chen", role: "CFO" },
  { username: "demo", password: "demo", name: "Marcus Rivera", role: "Accountant" },
];



function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS": return { isAuthenticated: true, user: action.payload, error: null };
    case "LOGIN_FAILURE": return { ...state, error: action.payload };
    case "LOGOUT": return initialAuthState;
    case "CLEAR_ERROR": return { ...state, error: null };
    default: return state;
  }
}




function inventoryReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = { ...action.payload, id: `ITM-${String(state.items.length + 1).padStart(3, "0")}` };
      return { ...state, items: [...state.items, newItem] };
    }
    case "ADD_RECEIPT": {
      const receipt = {
        ...action.payload,
        receiptNo: `RCV-${state.nextReceiptNo}`,
        date: new Date().toISOString(),
        id: Date.now(),
      };
      const updatedItems = state.items.map((item) => {
        const line = receipt.lines.find((l) => l.itemId === item.id);
        return line ? { ...item, quantity: item.quantity + line.quantity } : item;
      });
      return {
        ...state,
        receipts: [receipt, ...state.receipts],
        items: updatedItems,
        nextReceiptNo: state.nextReceiptNo + 1,
      };
    }
    case "ADD_ISSUANCE": {
      const issuance = {
        ...action.payload,
        issuanceNo: `ISS-${state.nextIssuanceNo}`,
        date: new Date().toISOString(),
        id: Date.now(),
      };
      const updatedItems = state.items.map((item) => {
        const line = issuance.lines.find((l) => l.itemId === item.id);
        return line ? { ...item, quantity: item.quantity - line.quantity } : item;
      });
      return {
        ...state,
        issuances: [issuance, ...state.issuances],
        items: updatedItems,
        nextIssuanceNo: state.nextIssuanceNo + 1,
      };
    }
    default:
      return state;
  }
}


function Field({ label, children, error, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ textAlign:'left', fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

function Input({ style, ...props }) {
  return (
    <input
      style={{
        background: "var(--input-bg)",
        border: "1.5px solid var(--border)",
        borderRadius: 5,
        padding: "8px 10px",
        color: "var(--text)",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        transition: "border-color .15s",
        width: "130px",
        boxSizing: "border-box",
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      {...props}
    />
  );
}

function Select({ children, style, ...props }) {
  return (
    <select
      style={{
        background: "var(--input-bg)",
        border: "1.5px solid var(--border)",
        borderRadius: 6,
        padding: "8px 10px",
        color: "var(--text)",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        width: "320px",
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}



// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  receipt: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  issue: "M22 2l-7 20-4-9-9-4 20-7z",
  plus: "M12 5v14 M5 12h14",
  close: "M18 6L6 18 M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a2e;
    --ink-soft: #4a4a6a;
    --ink-ghost: #9898b8;
    --paper: #f5f3ee;
    --paper-warm: #ede9e0;
    --paper-card: #ffffff;
    --accent: #c4502a;
    --accent-light: #e8a090;
    --accent-bg: #fdf0ed;
    --green: #2a7a4e;
    --green-bg: #edf7f1;
    --green-light: #90d4aa;
    --amber: #b07a20;
    --amber-bg: #fdf5e0;
    --border: #ddd9d0;
    --shadow: 0 1px 3px rgba(26,26,46,0.08), 0 4px 16px rgba(26,26,46,0.06);
    --shadow-lg: 0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08);
    --radius: 5px;
    --radius-lg: 8px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }

  .app { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 240px; min-height: 100vh; background: var(--ink);
    display: flex; flex-direction: column; padding: 28px 0; flex-shrink: 0;
    position: sticky; top: 0; height: 100vh;
  }
  .sidebar-logo {
    padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo h1 {
    font-family: 'DM Serif Display', serif; font-size: 20px; color: #fff;
    line-height: 1.1; letter-spacing: -0.3px;
  }
  .sidebar-logo span { font-size: 10px; font-weight: 300; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; display: block; margin-top: 2px; }
  .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-label { font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.28); text-transform: uppercase; font-weight: 500; padding: 8px 12px 4px; }
  .nav-btn {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.55);
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 400;
    text-align: left; width: 100%; transition: all 0.15s;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
  .nav-btn.active { background: rgba(196,80,42,0.25); color: #e8a090; }
  .nav-btn .badge {
    margin-left: auto; font-size: 10px; font-family: 'DM Mono', monospace;
    background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
    padding: 1px 6px; border-radius: 20px;
  }
  .nav-btn.active .badge { background: rgba(196,80,42,0.3); color: #e8a090; }

  /* Main */
  .main { flex: 1; padding: 32px 36px; max-width: 1100px; }

  /* Page Header */
  .page-header { margin-bottom: 28px; }
  .page-header h2 { font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--ink); letter-spacing: -0.5px; }
  .page-header p { color: var(--ink-soft); font-size: 13.5px; margin-top: 4px; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card {
    background: var(--paper-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 18px 20px; box-shadow: var(--shadow);
  }
  .stat-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ink-ghost); font-weight: 500; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 30px; color: var(--ink); margin-top: 4px; line-height: 1; }
  .stat-sub { font-size: 11.5px; color: var(--ink-soft); margin-top: 5px; }
  .stat-card.accent { background: var(--accent); border-color: var(--accent); }
  .stat-card.accent .stat-label, .stat-card.accent .stat-value, .stat-card.accent .stat-sub { color: #fff; }
  .stat-card.accent .stat-value { color: rgba(255,255,255,0.9); }
  .stat-card.accent .stat-label { color: rgba(255,255,255,0.7); }

  /* Table Card */
  .card {
    background: var(--paper-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
    box-shadow: var(--shadow); overflow: hidden;
  }
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: #fafaf8;
  }
  .card-title { font-family: 'DM Serif Display', serif; font-size: 16px; color: var(--ink); }
  .card-sub { font-size: 12px; color: var(--ink-ghost); margin-top: 1px; }

  table { width: 100%; border-collapse: collapse; }
  th {
    font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
    font-weight: 600; color: var(--ink-ghost); padding: 10px 20px;
    text-align: left; background: #fafaf8; border-bottom: 1px solid var(--border);
  }
  td { padding: 12px 20px; font-size: 13.5px; border-bottom: 1px solid #f0ede7; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf8f5; }

  .mono { font-family: 'DM Mono', monospace; font-size: 12px; }
  .tag {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px;
    border-radius: 20px; font-size: 11px; font-weight: 500;
  }
  .tag-green { background: var(--green-bg); color: var(--green); }
  .tag-red { background: var(--accent-bg); color: var(--accent); }
  .tag-amber { background: var(--amber-bg); color: var(--amber); }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px;
    border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; transition: all 0.15s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #b0452a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(196,80,42,0.3); }
  .btn-green { background: var(--green); color: #fff; }
  .btn-green:hover { background: #236040; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(42,122,78,0.3); }
  .btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--paper); color: var(--ink); }
  .btn-sm { padding: 5px 11px; font-size: 12px; }
  .btn-icon { padding: 7px; border-radius: 6px; background: none; border: 1px solid var(--border); cursor: pointer; color: var(--ink-soft); display: inline-flex; align-items: center; transition: all 0.15s; }
  .btn-icon:hover { background: var(--paper); color: var(--ink); }

  /* Modal */
  .overlay {
    position: fixed; inset: 0; background: rgba(26,26,46,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
  }
  .modal {
    background: var(--paper-card); border-radius: var(--radius-lg); width: 100%; max-width: 900px;
    max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
  }
  .modal-header {
    padding: 22px 26px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start;  position: sticky; top: 0; background: var(--paper-card); z-index: 1;
  }
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink); }
  .modal-subtitle { font-size: 12px; color: var(--ink-ghost); margin-top: 2px; }
  .modal-body { padding: 22px 26px; }
  .modal-footer { padding: 16px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; background: #fafaf8; }

  /* Form */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .form-group { margin-bottom: 14px; width:700px }
  .form-group label { display: block; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-soft); margin-bottom: 6px; }
  .form-group input, .form-group select {
    width: 190px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 7px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; background: var(--paper-card);
    color: var(--ink); outline: none; transition: border 0.15s;
  }
  .form-group input:focus, .form-group select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(196,80,42,0.08); }


  /* Document Lines */
  .lines-section { margin-top: 18px; }
  .lines-header { font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-soft); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
  .line-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 16px; gap: 4px;
    align-items: end; margin-bottom: 8px;
  }
  .line-total { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--ink-soft); padding: 9px 0; text-align: right; }

  /* Document View */
  .doc-print {
    font-family: 'DM Sans', sans-serif; background: #fff;
    border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
  }
  .doc-head { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; background: #fafaf8; }
  .doc-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .doc-meta { font-size: 11px; color: var(--ink-ghost); margin-top: 3px; }
  .doc-number { font-family: 'DM Mono', monospace; font-size: 18px; color: var(--accent); font-weight: 500; }
  .doc-info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid var(--border); }
  .doc-info-cell { padding: 12px 20px; }
  .doc-info-cell + .doc-info-cell { border-left: 1px solid var(--border); }
  .doc-info-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ink-ghost); }
  .doc-info-val { font-size: 13px; color: var(--ink); margin-top: 2px; font-weight: 500; }
  .doc-table td, .doc-table th { padding: 10px 20px; }
  .doc-table th { font-size: 9px; letter-spacing: 1.5px; border-top: none; }
  .doc-footer { padding: 16px 20px; background: #fafaf8; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
  .doc-total { text-align: right; }
  .doc-total-label { font-size: 11px; color: var(--ink-ghost); text-transform: uppercase; letter-spacing: 1px; }
  .doc-total-value { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .sig-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; padding: 16px 20px; border-top: 1px solid var(--border); }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid var(--border); margin-bottom: 4px; padding-top: 4px; }
  .sig-role { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-ghost); }

  .empty-state { padding: 40px; text-align: center; color: var(--ink-ghost); }
  .empty-state svg { margin: 0 auto 10px; display: block; opacity: 0.3; }
  .empty-state p { font-size: 13px; }

  /* LOGIN */
  .login-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    background: var(--paper);
  }
  .login-brand {
    background: var(--ink); color: var(--paper);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 64px; position: relative; overflow: hidden;
  }
  .login-brand::before {
    content: ''; position: absolute; top: -120px; right: -120px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,150,44,0.18) 0%, transparent 70%);
  }
  .login-brand::after {
    content: ''; position: absolute; bottom: -80px; left: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,150,44,0.1) 0%, transparent 70%);
  }
  .brand-logo { font-family: 'DM Serif Display', serif; font-size: 28px; letter-spacing: -0.5px; }
  .brand-logo span { color: var(--gold); }
  .brand-tagline { font-size: 42px; font-family: 'DM Serif Display', serif; line-height: 1.2; font-weight: 400; }
  .brand-tagline em { color: var(--gold); font-style: italic; }
  .brand-hint { font-size: 12px; color: rgba(250,248,244,0.45); font-family: 'DM Mono', monospace; }

  .login-form-wrap {
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px 72px; background: var(--paper);
  }
  .login-title { font-family: 'DM Serif Display', serif; font-size: 36px; margin-bottom: 8px; color: var(--ink); }
  .login-sub { color: var(--muted); font-size: 14px; margin-bottom: 48px; font-weight: 300; }

  .form-group { margin-bottom: 24px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .form-input-wrap { position: relative; }
  .form-input {
    width: 100%; padding: 14px 44px 14px 16px; border: 1.5px solid var(--warm-gray);
    border-radius: 6px; font-size: 15px; background: white; color: var(--ink);
    font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .btn-login:hover { background: #1e1c18; }
  .btn-login:active { transform: scale(0.99); }
  .demo-creds {
    margin-top: 32px; padding: 16px; background: var(--cream);
    border-radius: 8px; border: 1px solid var(--warm-gray);
  }
  .demo-creds-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); font-weight: 600; margin-bottom: 10px; }
  .demo-cred { display: flex; gap: 8px; font-family: 'DM Mono', monospace; font-size: 12px; color: var(--ink); margin-bottom: 4px; }
  .demo-cred span:first-child { color: var(--muted); width: 90px; }



  .user-info { flex: 1; min-width: 0; }

  .user-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 11px;
    color: var(--color-text-tertiary);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 28px;
    gap: 20px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }

  .page-subtitle {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-top: 2px;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    border-radius: var(--border-radius-md);
    border: 0.5px solid var(--color-border-secondary);
    background: var(--color-background-primary);
    color: var(--color-text-secondary);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn:hover { background: var(--color-background-secondary); color: var(--color-text-primary); }

  .code-card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    flex: 1;
  }

  .code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--color-border-tertiary);
    background: var(--color-background-secondary);
  }

  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff6b6b; }
  .dot-y { background: #ffd166; }
  .dot-g { background: #06d6a0; }

  .code-filename {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    color: var(--color-text-secondary);
    margin-left: 4px;
  }

  .code-body {
    padding: 16px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-secondary);
    overflow: auto;
  }

  .kw { color: #7c3aed; }
  .fn { color: #0891b2; }
  .str { color: #059669; }
  .cm { color: var(--color-text-tertiary); font-style: italic; }
  .prop { color: #b45309; }

  .info-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .chip {
    font-size: 11.5px;
    padding: 4px 10px;
    border-radius: 100px;
    border: 0.5px solid var(--color-border-tertiary);
    color: var(--color-text-secondary);
    background: var(--color-background-secondary);
  }

  .chip.active { background: #ede9fe; color: #5b21b6; border-color: #c4b5fd; }



  .section-gap { margin-top: 20px; }

  @media (max-width: 900px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
    .sidebar { width: 200px; }
    .main { padding: 24px 20px; }
  }
`;

// ─── Helper functions ─────────────────────────────────────────────────────────
const fmt = (n) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

// ─── Document Modal (Receipt or Issuance) ─────────────────────────────────────
function DocumentModal({ type, items, onClose, onSave,suppliers }) {
  const isReceipt = type === "receipt";
  const [supplier, setSupplier] = useState("");
  const [dept, setDept] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [poNo, setPono] = useState("");
  const [referNo, setReferno] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState([{ itemId: "", quantity: "", unitCost: "", Amount:"" }]);

  const addLine = () => setLines([...lines, { itemId: "", quantity: "", unitCost: "", Amount:"" }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => {
    console.log(' acs log i:' + i + ' field:' + field + ' val:' + val);
    const next = [...lines];
    next[i] = { ...next[i], [field]: val };
    if (field === "itemId" && isReceipt) {
      const found = items.find((it) => it.id === val);
      if (found) {
        next[i].unitCost = found.unitCost;
        next[i].Amount = found.unitCost * found.quantity ;
      }
        
    }
    setLines(next);
  };

  const validLines = lines.filter((l) => l.itemId && l.quantity > 0);
  const total = validLines.reduce((sum, l) => {
    const item = items.find((it) => it.id === l.itemId);
    const cost = isReceipt ? Number(l.unitCost) : (item ? item.unitCost : 0);
    return sum + cost * Number(l.quantity);
  }, 0);

  const canSave =
    validLines.length > 0 &&
    (isReceipt ? supplier : dept) &&
    (isReceipt ? receivedBy : requestedBy);

  const handleSave = () => {
    const enriched = validLines.map((l) => {
      const item = items.find((it) => it.id === l.itemId);
      return {
        itemId: l.itemId,
        itemName: item?.name,
        unit: item?.unit,
        quantity: Number(l.quantity),
        unitCost: isReceipt ? Number(l.unitCost) : item?.unitCost,
      };
    });
    onSave({ ...(isReceipt ? { supplier, receivedBy } : { dept, requestedBy }), lines: enriched, total });
    onClose();
  };

  // Check stock for issuance
  const getStockWarning = (l) => {
    if (!l.itemId || !l.quantity) return null;
    const item = items.find((it) => it.id === l.itemId);
    if (item && Number(l.quantity) > item.quantity) return `Only ${item.quantity} available`;
    return null;
  };

    

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{isReceipt ? "New Receipt" : "New Issuance"}</div>
            <div className="modal-subtitle">
              {isReceipt ? "Record items received into inventory" : "Issue items out of inventory"}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon path={ICONS.close} /></button>
        </div>
        <div className="modal-body">

            {isReceipt ? (
              <>

   <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Field label="Supplier" required>
                      <Select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                        <option value="">Select Suppliers…</option>
                        {suppliers.map((it) => (
                          <option key={it.id} value={it.id}>{it.name} ({it.email})</option>
                        ))}
                      </Select>          
        </Field>
        <Field label="ReceivedBy" required>
          <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)}  style={{ background: "var(--panel-alt)", fontWeight: 700, color: "var(--accent)" }} />
        </Field>
        <Field label="PO No" required>
          <Input value={poNo} onChange={(e) => setPono(e.target.value)}  style={{ background: "var(--panel-alt)", fontWeight: 700, color: "var(--accent)" }} />
        </Field>

       <Field label="Reference" required>
          <Input value={referNo} onChange={(e) => setReferno(e.target.value)}  style={{ background: "var(--panel-alt)", fontWeight: 700, color: "var(--accent)" }} />
        </Field>


      </div>
      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
       
        <Field label="Remarks" required>
          <Input value={remarks} onChange={(e) => setRemarks(e.target.value)}  style={{width:'813px', background: "var(--panel-alt)", fontWeight: 700, color: "var(--accent)" }} />
        </Field>
      </div>
   </div>

             </>
            ) : (
              <>
                <div className="form-group">
                  <label>Requesting Department</label>
                  <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. Finance" />
                </div>
                <div className="form-group">
                  <label>Requested By</label>
                  <input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Full name" />
                </div>
              </>
            )}
          

          <div className="lines-section">
            <div className="lines-header">
              <span>...</span>
              <button className="btn btn-ghost btn-sm" onClick={addLine}>
                <Icon path={ICONS.plus} size={13} /> Add Line
              </button>
            </div>
            <hr/>
            <div className="lines-header">
                <label style={{width:'280px',textAlign:'left'}}>Product Description</label>
                <label style={{width:'120px',textAlign:'right'}}>Quantity</label>
                <label style={{width:'120px',textAlign:'right'}}>Unit Cost</label>
                <label style={{width:'130px',textAlign:'right'}}>Amount</label>
                <label style={{width:'80px',textAlign:'right'}}>...</label>
            </div>
            <hr/>
            {lines.map((line, i) => {
              const warn = !isReceipt ? getStockWarning(line) : null;
              const item = items.find((it) => it.id === line.itemId);
              const cost = isReceipt ? Number(line.unitCost) : (item ? item.unitCost : 0);
              return (
                <div key={i}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
                    <div  style={{ marginBottom: 0 }}>
                      {i === 0 }
                      <Select value={line.itemId} onChange={(e) => updateLine(i, "itemId", e.target.value)}>
                        <option value="">Select item…</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>
                        ))}
                      </Select>
                    </div>
                    <div  style={{ marginBottom: 0,width:'130px' }}>
                      {i === 0  }
                      <Input style={{width:'130px',textAlign:'right'}}  type="number" min="1" value={line.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} placeholder="0" />
                    </div>
                    {isReceipt &&(                      
                      <div  style={{ marginBottom: 0, width:'130px' }}>
                        {i === 0  }
                        <Input style={{width:'130px',textAlign:'right'}} type="number" min="0" value={line.unitCost} onChange={(e) => updateLine(i, "unitCost", e.target.value)} placeholder="0.00" />
                      </div>                       
                    )}

                    {isReceipt &&(
                      <div style={{ marginBottom: 0, width:'150px' }} >
                        {i === 0  }                        
                        <Input style={{width:'150px',textAlign:'right'}} type="number" min="0" value={line.unitCost*line.quantity} onChange={(e) => updateLine(i, "amount", e.target.value)} placeholder="0.00" />
                      </div>
                     )}
                   

                    {!isReceipt &&(
                      <div>
                        {i === 0 && <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--ink-soft)", marginBottom: "6px" }}>Subtotal</label>}
                        <div className="line-total">{line.itemId && line.quantity ? fmt(cost * Number(line.quantity)) : "—"}</div>
                      </div>
                    )}
                    <div style={{ paddingTop: i === 0 ? "2px" : "0", width:'50px' }}>
                      <button className="btn-icon" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                        <Icon path={ICONS.trash} size={13} />
                      </button>
                    </div>
                  </div>
                  {warn && (
                    <div style={{ fontSize: "11px", width:'20px',  color: "var(--accent)", display: "flex", alignItems: "center", gap: "2px", marginTop: "-10px", marginBottom: "4px", paddingLeft: "2px" }}>
                      <Icon path={ICONS.warning} size={12} /> {warn}
                    </div>
                  )}
                </div>
              );
            })}
            {validLines.length > 0 && (
              <div style={{ textAlign: "right", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--ink-ghost)" }}>Total Amount</span>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "var(--ink)" }}>{fmt(total)}</div>
              </div>
            )}
          </div>
        </div>
        
       
      




        <div className="modal-footer">

  

          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${isReceipt ? "btn-green" : "btn-primary"}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            <Icon path={ICONS.check} size={14} />
            {isReceipt ? "Save Receipt" : "Save Issuance"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Document Viewer ──────────────────────────────────────────────────────────
function DocumentViewer({ doc, type, onClose }) {
  const isReceipt = type === "receipt";
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Document Preview</div>
            <div className="modal-subtitle">{isReceipt ? doc.receiptNo : doc.issuanceNo}</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Icon path={ICONS.download} size={13} /> Print
            </button>
            <button className="btn-icon" onClick={onClose}><Icon path={ICONS.close} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="doc-print">
            <div className="doc-head">
              <div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--ink-ghost)", marginBottom: "4px" }}>Document</div>
                <div className="doc-title">{isReceipt ? "Inventory Receipt" : "Issuance Slip"}</div>
                <div className="doc-meta">{fmtDate(doc.date)} · {fmtTime(doc.date)}</div>
              </div>
              <div className="doc-number">{isReceipt ? doc.receiptNo : doc.issuanceNo}</div>
            </div>
            <div className="doc-info-row">
              <div className="doc-info-cell">
                <div className="doc-info-label">{isReceipt ? "Supplier / Source" : "Requesting Department"}</div>
                <div className="doc-info-val">{isReceipt ? doc.supplier : doc.dept}</div>
              </div>
              <div className="doc-info-cell">
                <div className="doc-info-label">{isReceipt ? "Received By" : "Requested By"}</div>
                <div className="doc-info-val">{isReceipt ? doc.receivedBy : doc.requestedBy}</div>
              </div>
            </div>
            <table className="doc-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>#</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Item Description</th>
                  <th style={{ textAlign: "center", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Unit</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Qty</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Unit Cost</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {doc.lines.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{l.itemName}</td>
                    <td style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: "12px" }}>{l.unit}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.quantity}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "12px", color: "var(--ink-soft)" }}>{fmt(l.unitCost)}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{fmt(l.unitCost * l.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="doc-footer">
              <div className="doc-total">
                <div className="doc-total-label">Total Amount</div>
                <div className="doc-total-value">{fmt(doc.total)}</div>
              </div>
            </div>
            <div className="sig-row">
              {[isReceipt ? "Prepared By" : "Requested By", "Approved By", isReceipt ? "Received By" : "Released By"].map((role) => (
                <div key={role} className="sig-box">
                  <div style={{ height: "32px" }} />
                  <div className="sig-line" />
                  <div className="sig-role">{role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function InventoryPage({ state, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "piece", quantity: 0, unitCost: 0 });
  const lowStock = state.items.filter((i) => i.quantity <= 20).length;

  const handleAdd = () => {
    dispatch({ type: "ADD_ITEM", payload: { ...form, quantity: Number(form.quantity), unitCost: Number(form.unitCost) } });
    setForm({ name: "", unit: "piece", quantity: 0, unitCost: 0 });
    setShowAdd(false);
  };

  const [search, setSearch] = useState(""); 
  const [sortBy, setSortBy] = useState("name");

  const [products, setProducts] = useState([]);
    
     useEffect(() => {
        getProducts();
      }, []);

  
  const ITEMS_PER_PAGE = 7 ;
  const inventory = products;
  console.log('test alan000');

  console.log('test no. of products : ' + products.length);

  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    //let data = state.items;
    let data = products ;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
    data = [...data].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "qty") return b.qty - a.qty;
      return 0;
    });
    return data;
  }, [inventory, category, search, sortBy]);


  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const status="In-stock";

  //const showItemApiUpd = "http://localhost:8000/items";    

const getProducts = () => {
        axios
          .get(showItemApiUpd)
          .then((res) => {
            setProducts(res.data);            
            console.log('acs logging success 123');
          })
          .catch((err) => {
            console.log('acs error logging 123');
            console.log(err);
          });
};





  return (
    <>
      <div className="page-header">
        <h2>Inventory Items</h2>
        <p>Master list of all tracked items and current stock levels</p>
      </div>
      <div className="stats-row">
        <div className="stat-card accent">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{state.items.length}</div>
          <div className="stat-sub">Distinct SKUs tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Units</div>
          <div className="stat-value">{state.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}</div>
          <div className="stat-sub">Across all items</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px" }}>{fmt(state.items.reduce((s, i) => s + i.quantity * i.unitCost, 0))}</div>
          <div className="stat-sub">At cost price</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value" style={{ color: lowStock > 0 ? "var(--accent)" : "var(--ink)" }}>{lowStock}</div>
          <div className="stat-sub">Items ≤ 20 units</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Items</div>
            <div className="card-sub">{state.items.length} items in inventory</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Icon path={showAdd ? ICONS.close : ICONS.plus} size={13} />
            {showAdd ? "Cancel" : "Add Item"}
          </button>
        </div>
        {showAdd && (
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", background: "var(--accent-bg)" }}>
            <div className="form-row" style={{ gap: "10px", alignItems: "end" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Item Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Description" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {["piece","ream","box","pad","roll","set","bundle","pack","bottle","can"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row" style={{ gap: "10px", marginTop: "10px", alignItems: "end" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Initial Qty</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Unit Cost (₱)</label>
                <input type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: "12px" }}>
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!form.name}>
                <Icon path={ICONS.check} size={13} /> Save Item
              </button>
            </div>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Qty on Hand</th>
              <th>Unit Cost</th>              
              <th>Status</th>
            </tr>
          </thead>
          <tbody>

              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : paginated.map((item, i) => (              

                

                <tr key={item.id} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px" }}> {item.id} </td>  
                    <td style={{ padding: "14px 16px" }}>{item.name} </td>  
                    <td style={{ padding: "14px 16px" }}>{item.unit} </td>                      
                    <td>
                    <span className="mono" style={{ fontWeight: 600, color: item.quantity <= 20 ? "var(--accent)" : "var(--ink)" }}>
                      {item.quantity.toLocaleString()}
                    </span>
                  </td>
                  <td><span className="mono">{fmt(item.unitCost)}</span></td>                
                  
                  <td style={{ padding: "14px 16px", color: "#22c55e", fontWeight: 700, fontSize: 14 }}>{status}</td>
                </tr>
              ))}


          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 8, padding: "8px 12px", color: page === 1 ? "#333" : "#aaa", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: page === 1 ? "#333" : "#aaa", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === page ? "linear-gradient(90deg,#4f8ef7,#6c63ff)" : "#ef4444", border: p === page ? "none" : "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: p === page ? "#fff" : "#666", cursor: "pointer", fontWeight: p === page ? 700 : 400, fontSize: 13 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: (page === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (page === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 8, padding: "8px 12px", color: (page === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (page === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>»</button>
      </div>


    </>
  );
}

function StockPill({ qty }) {
  const level = qty > 30 ? "high" : qty > 10 ? "mid" : "low";
  const map = { high: ["#12261a", "#22c55e"], mid: ["#1e1a10", "#f59e0b"], low: ["#2a1010", "#ef4444"] };
  const [bg, fg] = map[level];
  return (
    <span style={{ background: bg, color: fg, borderRadius: 20, padding: "2px 12px", fontWeight: 800, fontSize: 12, border: `1.5px solid ${fg}33` }}>
      {qty}
    </span>
  );
}


function ReceiptsPage({ state, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  return (
    <>
      {showModal && (
        <DocumentModal type="receipt" items={state.items} onClose={() => setShowModal(false)}
          onSave={(data) => dispatch({ type: "ADD_RECEIPT", payload: data })} suppliers={state.suppliers} />
      )}
      {viewDoc && <DocumentViewer doc={viewDoc} type="receipt" onClose={() => setViewDoc(null)} />}
      <div className="page-header">
        <h2>Receipts</h2>
        <p>Record of all items received into inventory</p>
      </div>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="stat-card accent">
          <div className="stat-label">Total Receipts</div>
          <div className="stat-value">{state.receipts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Received Value</div>
          <div className="stat-value" style={{ fontSize: "20px", paddingTop: "6px" }}>{fmt(state.receipts.reduce((s, r) => s + r.total, 0))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{state.receipts.filter((r) => new Date(r.date).getMonth() === new Date().getMonth()).length}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Receipt Summary</div>
            <div className="card-sub">{state.receipts.length} documents</div>
          </div>
          <button className="btn btn-green btn-sm" onClick={() => setShowModal(true)}>
            <Icon path={ICONS.plus} size={13} /> New Receipt
          </button>
        </div>
        {state.receipts.length === 0 ? (
          <div className="empty-state">
            <Icon path={ICONS.receipt} size={32} />
            <p>No receipts yet. Click "New Receipt" to record received items.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Received By</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.receipts.map((r) => (
                <tr key={r.id}>
                  <td><span className="mono" style={{ color: "var(--green)", fontWeight: 600 }}>{r.receiptNo}</span></td>
                  <td><span style={{ fontSize: "12.5px" }}>{fmtDate(r.date)}</span></td>
                  <td style={{ fontWeight: 500 }}>{r.supplier}</td>
                  <td>
                    <span className="tag tag-green">{r.lines.length} item{r.lines.length !== 1 ? "s" : ""}</span>
                  </td>
                  <td style={{ color: "var(--ink-soft)", fontSize: "13px" }}>{r.receivedBy}</td>
                  <td><span className="mono" style={{ fontWeight: 600 }}>{fmt(r.total)}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewDoc(r)}>
                      View <Icon path={ICONS.arrow} size={12} />                      
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function IssuancesPage({ state, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  return (
    <>
      {showModal && (
        <DocumentModal type="issuance" items={state.items} onClose={() => setShowModal(false)}
          onSave={(data) => dispatch({ type: "ADD_ISSUANCE", payload: data })} />
      )}
      {viewDoc && <DocumentViewer doc={viewDoc} type="issuance" onClose={() => setViewDoc(null)} />}
      <div className="page-header">
        <h2>Issuances</h2>
        <p>Record of all items issued out of inventory</p>
      </div>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="stat-card accent">
          <div className="stat-label">Total Issuances</div>
          <div className="stat-value">{state.issuances.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Issued Value</div>
          <div className="stat-value" style={{ fontSize: "20px", paddingTop: "6px" }}>{fmt(state.issuances.reduce((s, r) => s + r.total, 0))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{state.issuances.filter((r) => new Date(r.date).getMonth() === new Date().getMonth()).length}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Issuance Log</div>
            <div className="card-sub">{state.issuances.length} documents</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Icon path={ICONS.plus} size={13} /> New Issuance
          </button>
        </div>
        {state.issuances.length === 0 ? (
          <div className="empty-state">
            <Icon path={ICONS.issue} size={32} />
            <p>No issuances yet. Click "New Issuance" to issue items.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Issuance No.</th>
                <th>Date</th>
                <th>Department</th>
                <th>Items</th>
                <th>Requested By</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.issuances.map((r) => (
                <tr key={r.id}>
                  <td><span className="mono" style={{ color: "var(--accent)", fontWeight: 600 }}>{r.issuanceNo}</span></td>
                  <td><span style={{ fontSize: "12.5px" }}>{fmtDate(r.date)}</span></td>
                  <td style={{ fontWeight: 500 }}>{r.dept}</td>
                  <td>
                    <span className="tag tag-red">{r.lines.length} item{r.lines.length !== 1 ? "s" : ""}</span>
                  </td>
                  <td style={{ color: "var(--ink-soft)", fontSize: "13px" }}>{r.requestedBy}</td>
                  <td><span className="mono" style={{ fontWeight: 600 }}>{fmt(r.total)}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewDoc(r)}>
                      View <Icon path={ICONS.arrow} size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function DashboardPage({ state, setPage }) { 
  const totalValue = state.items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const receivedVal = state.receipts.reduce((s, r) => s + r.total, 0);
  const issuedVal = state.issuances.reduce((s, r) => s + r.total, 0);
  const lowStock = state.items.filter((i) => i.quantity <= 20);

  const recentDocs = [
    ...state.receipts.map((r) => ({ ...r, docType: "receipt", no: r.receiptNo })),
    ...state.issuances.map((r) => ({ ...r, docType: "issuance", no: r.issuanceNo })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of inventory movements and current stock status</p>
      </div>
      <div className="stats-row">
        <div className="stat-card accent">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px" }}>{fmt(totalValue)}</div>
          <div className="stat-sub">Current stock at cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Received</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px", color: "var(--green)" }}>{fmt(receivedVal)}</div>
          <div className="stat-sub">{state.receipts.length} receipts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Issued</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px", color: "var(--accent)" }}>{fmt(issuedVal)}</div>
          <div className="stat-sub">{state.issuances.length} issuances</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value" style={{ color: lowStock.length > 0 ? "var(--accent)" : "var(--green)" }}>{lowStock.length}</div>
          <div className="stat-sub">Items need replenishment</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
          </div>
          {recentDocs.length === 0 ? (
            <div className="empty-state"><p>No transactions yet</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((d) => (
                  <tr key={d.id}>
                    <td><span className="mono" style={{ color: d.docType === "receipt" ? "var(--green)" : "var(--accent)", fontSize: "11px" }}>{d.no}</span></td>
                    <td>
                      <span className={`tag ${d.docType === "receipt" ? "tag-green" : "tag-red"}`} style={{ fontSize: "10px" }}>
                        {d.docType === "receipt" ? "Receipt" : "Issuance"}
                      </span>
                    </td>
                    <td style={{ fontSize: "11.5px", color: "var(--ink-soft)" }}>{fmtDate(d.date)}</td>
                    <td><span className="mono" style={{ fontSize: "12px" }}>{fmt(d.total)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Low Stock Items</div>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state">
              <Icon path={ICONS.check} size={28} />
              <p>All items are sufficiently stocked</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, fontSize: "13px" }}>{item.name}</td>
                    <td><span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>{item.quantity}</span></td>
                    <td>
                      <span className={`tag ${item.quantity === 0 ? "tag-red" : "tag-amber"}`}>
                        {item.quantity === 0 ? "Out" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}


function AdjustmentPage({ state, setPage }) { 
  const totalValue = state.items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const receivedVal = state.receipts.reduce((s, r) => s + r.total, 0);
  const issuedVal = state.issuances.reduce((s, r) => s + r.total, 0);
  const lowStock = state.items.filter((i) => i.quantity <= 20);

  const recentDocs = [
    ...state.receipts.map((r) => ({ ...r, docType: "receipt", no: r.receiptNo })),
    ...state.issuances.map((r) => ({ ...r, docType: "issuance", no: r.issuanceNo })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <>
      <div className="page-header">
        <h2>Adjustment Page</h2>
        <p>Overview of inventory movements and current stock status</p>
      </div>
      <div className="stats-row">
        <div className="stat-card accent">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px" }}>{fmt(totalValue)}</div>
          <div className="stat-sub">Current stock at cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Received</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px", color: "var(--green)" }}>{fmt(receivedVal)}</div>
          <div className="stat-sub">{state.receipts.length} receipts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Issued</div>
          <div className="stat-value" style={{ fontSize: "22px", paddingTop: "4px", color: "var(--accent)" }}>{fmt(issuedVal)}</div>
          <div className="stat-sub">{state.issuances.length} issuances</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value" style={{ color: lowStock.length > 0 ? "var(--accent)" : "var(--green)" }}>{lowStock.length}</div>
          <div className="stat-sub">Items need replenishment</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
          </div>
          {recentDocs.length === 0 ? (
            <div className="empty-state"><p>No transactions yet</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((d) => (
                  <tr key={d.id}>
                    <td><span className="mono" style={{ color: d.docType === "receipt" ? "var(--green)" : "var(--accent)", fontSize: "11px" }}>{d.no}</span></td>
                    <td>
                      <span className={`tag ${d.docType === "receipt" ? "tag-green" : "tag-red"}`} style={{ fontSize: "10px" }}>
                        {d.docType === "receipt" ? "Receipt" : "Issuance"}
                      </span>
                    </td>
                    <td style={{ fontSize: "11.5px", color: "var(--ink-soft)" }}>{fmtDate(d.date)}</td>
                    <td><span className="mono" style={{ fontSize: "12px" }}>{fmt(d.total)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Low Stock Items</div>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state">
              <Icon path={ICONS.check} size={28} />
              <p>All items are sufficiently stocked</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, fontSize: "13px" }}>{item.name}</td>
                    <td><span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>{item.quantity}</span></td>
                    <td>
                      <span className={`tag ${item.quantity === 0 ? "tag-red" : "tag-amber"}`}>
                        {item.quantity === 0 ? "Out" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────


// ─── APP SHELL ─────────────────────────────────────────────────────────────────

function AppShell() {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const [page, setPage] = useState("dashboard");

  const [navOpen, setNavOpen] = useState(true);
  const [expanded, setExpanded] = useState({ receipts: true });
  const [active, setActive] = useState("all-receipts");

  const toggle = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));


  const nav = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.box },
    { id: "inventory", label: "Inventory", icon: ICONS.edit, badge: state.items.length },
    { id: "receipts", label: "Receipts", icon: ICONS.receipt, badge: state.receipts.length },
    { id: "issuances", label: "Issuances", icon: ICONS.issue, badge: state.issuances.length },
    { id: "adjustment", label: "Adjustment", icon: ICONS.issue , badge:state.adjustment.length},
  ];

const NAV_ITEMS = [
  {
    id: "dashboard",
    icon: "⊞",
    label: "Dashboard",
    children: [],
  },
  {
    id: "receipts",
    icon: "◫",
    label: "Receipts",
    children: [
      { id: "all-receipts", label: "All Receipts" },
      { id: "pending", label: "Pending" },
      { id: "delivered", label: "Delivered" },
      { id: "failed", label: "Failed" },
    ],
  },
  {
    id: "shipments",
    icon: "⊡",
    label: "Shipments",
    children: [
      { id: "outbound", label: "Outbound" },
      { id: "inbound", label: "Inbound" },
      { id: "returns", label: "Returns" },
    ],
  },
  {
    id: "customers",
    icon: "◎",
    label: "Customers",
    children: [
      { id: "accounts", label: "Accounts" },
      { id: "contacts", label: "Contacts" },
    ],
  },
  {
    id: "reports",
    icon: "◈",
    label: "Reports",
    children: [
      { id: "daily", label: "Daily Summary" },
      { id: "monthly", label: "Monthly Report" },
    ],
  },
  {
    id: "settings",
    icon: "◉",
    label: "Settings",
    children: [],
  },
];



  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <h1>StockDesk</h1>
            <span>Inventory System</span>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">Navigation</div>
            {nav.map((n) => (
              <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <Icon path={n.icon} size={15} />
                {n.label}
                {n.badge !== undefined && <span className="badge">{n.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: "0 12px 8px" }}>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }}>
              <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>Inventory Value</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                {fmt(state.items.reduce((s, i) => s + i.quantity * i.unitCost, 0))}
              </div>
            </div>
          </div>
        </div>
        <main className="main">
          {page === "dashboard" && <DashboardPage state={state} setPage={setPage} />}
          {page === "inventory" && <InventoryPage state={state} dispatch={dispatch} />}
          {page === "receipts" && <ReceiptsPage state={state} dispatch={dispatch} />}
          {page === "issuances" && <IssuancesPage state={state} dispatch={dispatch} />}
          {page === "adjustment" && <AdjustmentPage state={state} dispatch={dispatch} />}          

 {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
            const hasChildren = item.children.length > 0;
            const isExpanded = expanded[item.id];
            const isParentActive = item.children.some((c) => c.id === active);
            const isDirectActive = active === item.id;

            return (
              <div key={item.id}>
                <div
                  onClick={() => {
                    if (hasChildren) {
                      if (!navOpen) setNavOpen(true);
                      toggle(item.id);
                    } else {
                      setActive(item.id);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: navOpen ? "9px 16px" : "9px 14px",
                    cursor: "pointer",
                    background:
                      isDirectActive || isParentActive
                        ? "#252b50"
                        : "transparent",
                    borderLeft:
                      isDirectActive || isParentActive
                        ? "3px solid #4f6ef7"
                        : "3px solid transparent",
                    transition: "background 0.15s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#252b50")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      isDirectActive || isParentActive ? "#252b50" : "transparent")
                  }
                >
                  <span
                    style={{
                      fontSize: 16,
                      flexShrink: 0,
                      color:
                        isDirectActive || isParentActive ? "#7b96ff" : "#8890b5",
                    }}
                  >
                    {item.icon}
                  </span>
                  {navOpen && (
                    <>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight:
                            isDirectActive || isParentActive ? 600 : 400,
                          color:
                            isDirectActive || isParentActive ? "#e0e4ff" : "#cdd0e0",
                          flex: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                      {hasChildren && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#5a6080",
                            transform: isExpanded
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s",
                            display: "inline-block",
                          }}
                        >
                          ▶
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Sub-menu */}
                {hasChildren && navOpen && (
                  <div
                    style={{
                      maxHeight: isExpanded ? 200 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.22s cubic-bezier(.4,0,.2,1)",
                    }}
                  >
                    {item.children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setActive(child.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 16px 8px 42px",
                          cursor: "pointer",
                          background:
                            active === child.id ? "#2a3060" : "transparent",
                          userSelect: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#2a3060")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            active === child.id ? "#2a3060" : "transparent")
                        }
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background:
                              active === child.id ? "#4f6ef7" : "#4a5075",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color:
                              active === child.id ? "#c0caff" : "#8890b5",
                            fontWeight: active === child.id ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {child.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>


        </main>
      </div>
    </>
  )
}

const rootReducer = combineReducers({ auth: authReducer});
const store = createStore(rootReducer);

function useDispatch() { return store.dispatch; }

function useSelector(selector) {
  const [state, setState] = useState(() => selector(store.getState()));
  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(selector(store.getState())));
    return unsubscribe;
  }, []);
  return state;
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────

function LoginPage() {
  const dispatch = useDispatch();
  const error = useSelector(s => s.auth.error);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e) => {
    e && e.preventDefault();
    const user = DEMO_USERS.find(u => u.username === username && u.password === password);        
    if (user) {
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      //alert('success');
    } else {
      dispatch({ type: "LOGIN_FAILURE", payload: "Invalid credentials. Try admin / admin123." });
      //alert('failed');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-brand">
        <div className="brand-logo">Inventory Login<span>.</span></div>
        <div>
          <div className="brand-tagline">
            Inventory Mgt For <em>modern</em> Teams.
          </div>
          <div style={{ marginTop: 16, fontSize: 14, color: "rgba(250,248,244,0.5)", fontWeight: 300 }}>
            Track every peso. Understand every trend.
          </div>
        </div>
        <div className="brand-hint">v2.4.1 — Fiscal Year 2026</div>
      </div>

      <div className="login-form-wrap">
        <div style={{ maxWidth: 380, width: "100%" }}>
          <div className="login-title">Welcome back</div>
          <div className="login-sub">Sign in to your Inventory workspace</div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-title">
            <label className="form-label" style={{alignContent:'center'}}>Username</label>
          </div>

         <div className="login-title">
              <input className="form-input" style={{alignContent:'center',width:'170px'}} value={username} onChange={e => { setUsername(e.target.value); dispatch({ type: "CLEAR_ERROR" }); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter username" autoFocus />
          </div>


          <div className="login-title">
            <label className="form-label" style={{alignContent:'center'}}>Password</label>
          </div>

         <div className="login-title">
              <input className="form-input" style={{alignContent:'center',width:'170px'}} type={showPw ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); dispatch({ type: "CLEAR_ERROR" }); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter password" />

          </div>



<div style={{alignContent:'center'}}>
          <button className="btn btn-ghost"  onClick={handleLogin}>Sign In</button>
</div>
          <div className="demo-creds">
            <div className="demo-creds-title">Demo Credentials</div>
            <div className="demo-cred"><span>Admin:</span> admin / admin123</div>
            <div className="demo-cred"><span>Viewer:</span> demo / demo</div>
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── Pagination Component ─────────────────────────────────────────────────────
class PaginationBase extends Component {
  render() {
    const { currentPage, totalPages, onSetPage } = this.props;
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 20,
        }}
      >
        <button
          onClick={() => onSetPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={btnStyle(false, currentPage === 1)}
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onSetPage(p)}
            style={btnStyle(p === currentPage, false)}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onSetPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={btnStyle(false, currentPage === totalPages)}
        >
          ›
        </button>
      </div>
    );
  }
}

function btnStyle(active, disabled) {
  return {
    minWidth: 34,
    height: 34,
    borderRadius: 8,
    border: active ? "none" : "1px solid #D1D5DB",
    background: active ? "#111827" : disabled ? "#F3F4F6" : "#fff",
    color: active ? "#fff" : disabled ? "#9CA3AF" : "#374151",
    fontWeight: active ? 600 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontFamily: "inherit",
  };
}

const Pagination = connect(
  (state) => ({
    currentPage: state.pagination.currentPage,
  }),
  (dispatch) => ({ onSetPage: (p) => dispatch(setPage(p)) })
)(PaginationBase);





// ─── ROOT ──────────────────────────────────────────────────────────────────────


// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  
  const isAuthenticated = useSelector(s => s.auth.isAuthenticated);
const [products, setProducts] = useState([]);
const showItemApiUpd = "http://localhost:8000/items";    



  return (
    <>
      <style>{css}</style>
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  );

}

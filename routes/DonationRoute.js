const express = require("express");
const router = express.Router();
const { triggerCanary } = require("../services/canary");

const donators = [
  {
    id: "64b1f8c3a1e4f12d9c7e3a1b",
    full_name: "Maria Santos",
    donators: "Maria Santos",
    email: "m***@gmail.com",
    phone: "*******4567",
    city: "Quezon City",
    province: "Metro Manila",
    total_donated: 12500,
    total_donated_readable: "₱12,500.00",
    created_at: "2024-06-12T09:24:00.000Z",
    last_active: "2025-09-02T14:12:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b01", amount: 2500, currency: "PHP", created_at: "2024-01-10T08:00:00.000Z", status: "confirmed", note: "Relief fund" },
      { id: "64b1f8c3a1e4f12d9c7e3b02", amount: 5000, currency: "PHP", created_at: "2024-06-12T09:00:00.000Z", status: "confirmed", note: "Typhoon response" },
      { id: "64b1f8c3a1e4f12d9c7e3b03", amount: 5000, currency: "PHP", created_at: "2025-09-02T13:45:00.000Z", status: "confirmed", note: "Medical assistance" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c01",
        card_brand: "Visa",
        last4: "4242",
        masked_pan: "**** **** **** 4242",
        exp_month: 12,
        exp_year: 2027,
        card_holder_name_masked: "M*** S***",
        billing_address: { line1: "45 Santos Ave.", city: "Quezon City", province: "Metro Manila", postal_code: "1100" },
        token: "tok_visa_1a2b3c4d5e6f7g8h9i0j"
      }
    ],
    risk_score: 8
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a2c",
    full_name: "Juan Reyes",
    donators: "Juan Reyes",
    email: "j***@gmail.com",
    phone: "*******9876",
    city: "Makati",
    province: "Metro Manila",
    total_donated: 30000,
    total_donated_readable: "₱30,000.00",
    created_at: "2023-11-03T11:10:00.000Z",
    last_active: "2025-10-02T09:20:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b04", amount: 10000, currency: "PHP", created_at: "2023-11-03T11:00:00.000Z", status: "confirmed", note: "Community support" },
      { id: "64b1f8c3a1e4f12d9c7e3b05", amount: 20000, currency: "PHP", created_at: "2024-05-15T10:30:00.000Z", status: "confirmed", note: "Typhoon response" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c02",
        card_brand: "Mastercard",
        last4: "5555",
        masked_pan: "**** **** **** 5555",
        exp_month: 8,
        exp_year: 2026,
        card_holder_name_masked: "J*** R***",
        billing_address: { line1: "12 Reyes St.", city: "Makati", province: "Metro Manila", postal_code: "1210" },
        token: "tok_mastercard_9x8y7z6w5v4u3t2s1r"
      }
    ],
    risk_score: 12
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a3d",
    full_name: "Aaliyah Torres",
    donators: "Aaliyah Torres",
    email: "a***@gmail.com",
    phone: "*******0001",
    city: "Cebu City",
    province: "Cebu",
    total_donated: 7500,
    total_donated_readable: "₱7,500.00",
    created_at: "2024-02-20T07:50:00.000Z",
    last_active: "2025-08-18T16:05:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b06", amount: 2500, currency: "PHP", created_at: "2024-02-20T07:45:00.000Z", status: "confirmed", note: "Relief fund" },
      { id: "64b1f8c3a1e4f12d9c7e3b07", amount: 5000, currency: "PHP", created_at: "2025-08-18T15:50:00.000Z", status: "pending", note: "Emergency relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c03",
        card_brand: "Amex",
        last4: "0005",
        masked_pan: "**** ****** *0005",
        exp_month: 1,
        exp_year: 2028,
        card_holder_name_masked: "A*** T***",
        billing_address: { line1: "3 Torres Plaza", city: "Cebu City", province: "Cebu", postal_code: "6000" },
        token: "tok_amex_a1b2c3d4e5f6g7h8i9"
      }
    ],
    risk_score: 14
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a4e",
    full_name: "Isabella Garcia",
    donators: "Isabella Garcia",
    email: "i***@gmail.com",
    phone: "*******1234",
    city: "Davao City",
    province: "Davao del Sur",
    total_donated: 4200,
    total_donated_readable: "₱4,200.00",
    created_at: "2025-01-09T13:40:00.000Z",
    last_active: "2025-09-24T10:30:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b08", amount: 2000, currency: "PHP", created_at: "2025-01-09T13:30:00.000Z", status: "confirmed", note: "General donation" },
      { id: "64b1f8c3a1e4f12d9c7e3b09", amount: 2200, currency: "PHP", created_at: "2025-07-02T09:15:00.000Z", status: "confirmed", note: "Medical assistance" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c04",
        card_brand: "Visa",
        last4: "1111",
        masked_pan: "**** **** **** 1111",
        exp_month: 5,
        exp_year: 2026,
        card_holder_name_masked: "I*** G***",
        billing_address: { line1: "78 Garcia Lane", city: "Davao City", province: "Davao del Sur", postal_code: "8000" },
        token: "tok_visa_x7y6z5a4b3c2d1e0f9"
      }
    ],
    risk_score: 6
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a5f",
    full_name: "Carlito Mendoza",
    donators: "Carlito Mendoza",
    email: "c***@gmail.com",
    phone: "*******2109",
    city: "Bacolod",
    province: "Negros Occidental",
    total_donated: 8600,
    total_donated_readable: "₱8,600.00",
    created_at: "2023-08-22T10:15:00.000Z",
    last_active: "2025-07-11T12:00:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b0a", amount: 3600, currency: "PHP", created_at: "2023-08-22T10:10:00.000Z", status: "confirmed", note: "Community support" },
      { id: "64b1f8c3a1e4f12d9c7e3b0b", amount: 5000, currency: "PHP", created_at: "2024-07-30T09:25:00.000Z", status: "confirmed", note: "Flood relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c05",
        card_brand: "Visa",
        last4: "6677",
        masked_pan: "**** **** **** 6677",
        exp_month: 9,
        exp_year: 2026,
        card_holder_name_masked: "C*** M***",
        billing_address: { line1: "4 Mendoza Rd.", city: "Bacolod", province: "Negros Occidental", postal_code: "6100" },
        token: "tok_visa_p1q2r3s4t5u6v7w8x9"
      }
    ],
    risk_score: 10
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a6g",
    full_name: "Grace Lopez",
    donators: "Grace Lopez",
    email: "g***@gmail.com",
    phone: "*******3344",
    city: "Iloilo City",
    province: "Iloilo",
    total_donated: 5400,
    total_donated_readable: "₱5,400.00",
    created_at: "2024-03-15T14:20:00.000Z",
    last_active: "2025-08-30T11:45:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b0c", amount: 2000, currency: "PHP", created_at: "2024-03-15T14:15:00.000Z", status: "confirmed", note: "General donation" },
      { id: "64b1f8c3a1e4f12d9c7e3b0d", amount: 3400, currency: "PHP", created_at: "2025-08-30T11:30:00.000Z", status: "confirmed", note: "Education fund" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c06",
        card_brand: "Mastercard",
        last4: "8888",
        masked_pan: "**** **** **** 8888",
        exp_month: 3,
        exp_year: 2027,
        card_holder_name_masked: "G*** L***",
        billing_address: { line1: "23 Lopez St.", city: "Iloilo City", province: "Iloilo", postal_code: "5000" },
        token: "tok_mastercard_z1y2x3w4v5u6t7s8r9"
      }
    ],
    risk_score: 7
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a7h",
    full_name: "Ricardo Cruz",
    donators: "Ricardo Cruz",
    email: "r***@gmail.com",
    phone: "*******5566",
    city: "Mandaluyong",
    province: "Metro Manila",
    total_donated: 15200,
    total_donated_readable: "₱15,200.00",
    created_at: "2023-12-10T16:45:00.000Z",
    last_active: "2025-09-15T08:20:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b0e", amount: 5200, currency: "PHP", created_at: "2023-12-10T16:40:00.000Z", status: "confirmed", note: "Christmas drive" },
      { id: "64b1f8c3a1e4f12d9c7e3b0f", amount: 10000, currency: "PHP", created_at: "2025-09-15T08:10:00.000Z", status: "confirmed", note: "Disaster relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c07",
        card_brand: "Visa",
        last4: "9999",
        masked_pan: "**** **** **** 9999",
        exp_month: 11,
        exp_year: 2025,
        card_holder_name_masked: "R*** C***",
        billing_address: { line1: "67 Cruz Bldg.", city: "Mandaluyong", province: "Metro Manila", postal_code: "1550" },
        token: "tok_visa_k1l2m3n4o5p6q7r8s9"
      }
    ],
    risk_score: 9
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a8i",
    full_name: "Sofia Ramos",
    donators: "Sofia Ramos",
    email: "s***@gmail.com",
    phone: "*******7788",
    city: "Pasig",
    province: "Metro Manila",
    total_donated: 6800,
    total_donated_readable: "₱6,800.00",
    created_at: "2024-04-05T12:30:00.000Z",
    last_active: "2025-10-01T14:55:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b10", amount: 3000, currency: "PHP", created_at: "2024-04-05T12:25:00.000Z", status: "confirmed", note: "Medical fund" },
      { id: "64b1f8c3a1e4f12d9c7e3b11", amount: 3800, currency: "PHP", created_at: "2025-10-01T14:45:00.000Z", status: "confirmed", note: "Emergency response" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c08",
        card_brand: "JCB",
        last4: "1234",
        masked_pan: "**** **** **** 1234",
        exp_month: 6,
        exp_year: 2028,
        card_holder_name_masked: "S*** R***",
        billing_address: { line1: "89 Ramos Ave.", city: "Pasig", province: "Metro Manila", postal_code: "1600" },
        token: "tok_jcb_a1b2c3d4e5f6g7h8i9j"
      }
    ],
    risk_score: 11
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a9j",
    full_name: "Miguel Dela Cruz",
    donators: "Miguel Dela Cruz",
    email: "m***@yahoo.com",
    phone: "*******9900",
    city: "Taguig",
    province: "Metro Manila",
    total_donated: 23400,
    total_donated_readable: "₱23,400.00",
    created_at: "2023-09-18T08:15:00.000Z",
    last_active: "2025-09-28T10:10:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b12", amount: 8400, currency: "PHP", created_at: "2023-09-18T08:10:00.000Z", status: "confirmed", note: "Community program" },
      { id: "64b1f8c3a1e4f12d9c7e3b13", amount: 15000, currency: "PHP", created_at: "2025-09-28T10:00:00.000Z", status: "confirmed", note: "Typhoon relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c09",
        card_brand: "Mastercard",
        last4: "7777",
        masked_pan: "**** **** **** 7777",
        exp_month: 2,
        exp_year: 2026,
        card_holder_name_masked: "M*** D***",
        billing_address: { line1: "56 Dela Cruz St.", city: "Taguig", province: "Metro Manila", postal_code: "1630" },
        token: "tok_mastercard_p1o2i3u4y5t6r7e8w9"
      }
    ],
    risk_score: 5
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a10k",
    full_name: "Elena Bautista",
    donators: "Elena Bautista",
    email: "e***@gmail.com",
    phone: "*******1122",
    city: "Cagayan de Oro",
    province: "Misamis Oriental",
    total_donated: 9200,
    total_donated_readable: "₱9,200.00",
    created_at: "2024-01-22T11:20:00.000Z",
    last_active: "2025-08-25T13:40:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b14", amount: 3200, currency: "PHP", created_at: "2024-01-22T11:15:00.000Z", status: "confirmed", note: "Food drive" },
      { id: "64b1f8c3a1e4f12d9c7e3b15", amount: 6000, currency: "PHP", created_at: "2025-08-25T13:35:00.000Z", status: "confirmed", note: "Medical assistance" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c10",
        card_brand: "Visa",
        last4: "3333",
        masked_pan: "**** **** **** 3333",
        exp_month: 7,
        exp_year: 2027,
        card_holder_name_masked: "E*** B***",
        billing_address: { line1: "34 Bautista Rd.", city: "Cagayan de Oro", province: "Misamis Oriental", postal_code: "9000" },
        token: "tok_visa_q1w2e3r4t5y6u7i8o9p"
      }
    ],
    risk_score: 13
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a11l",
    full_name: "Antonio Navarro",
    donators: "Antonio Navarro",
    email: "a***@gmail.com",
    phone: "*******3344",
    city: "Zamboanga City",
    province: "Zamboanga del Sur",
    total_donated: 15700,
    total_donated_readable: "₱15,700.00",
    created_at: "2023-10-30T09:50:00.000Z",
    last_active: "2025-09-20T16:25:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b16", amount: 5700, currency: "PHP", created_at: "2023-10-30T09:45:00.000Z", status: "confirmed", note: "Community center" },
      { id: "64b1f8c3a1e4f12d9c7e3b17", amount: 10000, currency: "PHP", created_at: "2025-09-20T16:20:00.000Z", status: "confirmed", note: "Disaster response" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c11",
        card_brand: "Amex",
        last4: "8888",
        masked_pan: "**** ****** *8888",
        exp_month: 4,
        exp_year: 2028,
        card_holder_name_masked: "A*** N***",
        billing_address: { line1: "12 Navarro St.", city: "Zamboanga City", province: "Zamboanga del Sur", postal_code: "7000" },
        token: "tok_amex_l1k2j3h4g5f6d7s8a9f"
      }
    ],
    risk_score: 15
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a12m",
    full_name: "Carmen Villanueva",
    donators: "Carmen Villanueva",
    email: "c***@yahoo.com",
    phone: "*******5566",
    city: "Baguio",
    province: "Benguet",
    total_donated: 4800,
    total_donated_readable: "₱4,800.00",
    created_at: "2024-05-14T15:10:00.000Z",
    last_active: "2025-09-05T11:30:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b18", amount: 1800, currency: "PHP", created_at: "2024-05-14T15:05:00.000Z", status: "confirmed", note: "Education fund" },
      { id: "64b1f8c3a1e4f12d9c7e3b19", amount: 3000, currency: "PHP", created_at: "2025-09-05T11:25:00.000Z", status: "confirmed", note: "Medical support" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c12",
        card_brand: "Visa",
        last4: "2222",
        masked_pan: "**** **** **** 2222",
        exp_month: 10,
        exp_year: 2026,
        card_holder_name_masked: "C*** V***",
        billing_address: { line1: "78 Villanueva Ave.", city: "Baguio", province: "Benguet", postal_code: "2600" },
        token: "tok_visa_z1x2c3v4b5n6m7a8s9d"
      }
    ],
    risk_score: 8
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a13n",
    full_name: "Fernando Castillo",
    donators: "Fernando Castillo",
    email: "f***@gmail.com",
    phone: "*******7788",
    city: "General Santos",
    province: "South Cotabato",
    total_donated: 11300,
    total_donated_readable: "₱11,300.00",
    created_at: "2024-02-08T13:45:00.000Z",
    last_active: "2025-09-12T09:15:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b1a", amount: 4300, currency: "PHP", created_at: "2024-02-08T13:40:00.000Z", status: "confirmed", note: "Community program" },
      { id: "64b1f8c3a1e4f12d9c7e3b1b", amount: 7000, currency: "PHP", created_at: "2025-09-12T09:10:00.000Z", status: "confirmed", note: "Emergency relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c13",
        card_brand: "Mastercard",
        last4: "4444",
        masked_pan: "**** **** **** 4444",
        exp_month: 12,
        exp_year: 2027,
        card_holder_name_masked: "F*** C***",
        billing_address: { line1: "56 Castillo St.", city: "General Santos", province: "South Cotabato", postal_code: "9500" },
        token: "tok_mastercard_f1g2h3j4k5l6z7x8c9v"
      }
    ],
    risk_score: 16
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a14o",
    full_name: "Lourdes Morales",
    donators: "Lourdes Morales",
    email: "l***@gmail.com",
    phone: "*******9900",
    city: "Batangas City",
    province: "Batangas",
    total_donated: 7200,
    total_donated_readable: "₱7,200.00",
    created_at: "2024-07-03T10:25:00.000Z",
    last_active: "2025-08-22T14:50:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b1c", amount: 2200, currency: "PHP", created_at: "2024-07-03T10:20:00.000Z", status: "confirmed", note: "General donation" },
      { id: "64b1f8c3a1e4f12d9c7e3b1d", amount: 5000, currency: "PHP", created_at: "2025-08-22T14:45:00.000Z", status: "confirmed", note: "Medical fund" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c14",
        card_brand: "Visa",
        last4: "6666",
        masked_pan: "**** **** **** 6666",
        exp_month: 8,
        exp_year: 2026,
        card_holder_name_masked: "L*** M***",
        billing_address: { line1: "89 Morales Rd.", city: "Batangas City", province: "Batangas", postal_code: "4200" },
        token: "tok_visa_b1n2m3a4q5w6e7r8t9y"
      }
    ],
    risk_score: 9
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a15p",
    full_name: "Roberto Aquino",
    donators: "Roberto Aquino",
    email: "r***@gmail.com",
    phone: "*******1122",
    city: "Pasay",
    province: "Metro Manila",
    total_donated: 18900,
    total_donated_readable: "₱18,900.00",
    created_at: "2023-07-15T14:30:00.000Z",
    last_active: "2025-09-25T10:40:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b1e", amount: 8900, currency: "PHP", created_at: "2023-07-15T14:25:00.000Z", status: "confirmed", note: "Community support" },
      { id: "64b1f8c3a1e4f12d9c7e3b1f", amount: 10000, currency: "PHP", created_at: "2025-09-25T10:35:00.000Z", status: "confirmed", note: "Disaster response" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c15",
        card_brand: "Mastercard",
        last4: "1212",
        masked_pan: "**** **** **** 1212",
        exp_month: 3,
        exp_year: 2027,
        card_holder_name_masked: "R*** A***",
        billing_address: { line1: "23 Aquino Ave.", city: "Pasay", province: "Metro Manila", postal_code: "1300" },
        token: "tok_mastercard_u1i2o3p4a5s6d7f8g9h"
      }
    ],
    risk_score: 7
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a16q",
    full_name: "Teresa Lim",
    donators: "Teresa Lim",
    email: "t***@gmail.com",
    phone: "*******3344",
    city: "Cebu City",
    province: "Cebu",
    total_donated: 6100,
    total_donated_readable: "₱6,100.00",
    created_at: "2024-08-12T11:15:00.000Z",
    last_active: "2025-09-18T13:20:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b20", amount: 2100, currency: "PHP", created_at: "2024-08-12T11:10:00.000Z", status: "confirmed", note: "Education fund" },
      { id: "64b1f8c3a1e4f12d9c7e3b21", amount: 4000, currency: "PHP", created_at: "2025-09-18T13:15:00.000Z", status: "confirmed", note: "Medical assistance" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c16",
        card_brand: "Visa",
        last4: "7878",
        masked_pan: "**** **** **** 7878",
        exp_month: 5,
        exp_year: 2028,
        card_holder_name_masked: "T*** L***",
        billing_address: { line1: "45 Lim St.", city: "Cebu City", province: "Cebu", postal_code: "6000" },
        token: "tok_visa_j1k2l3m4n5b6v7c8x9z"
      }
    ],
    risk_score: 12
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a17r",
    full_name: "Alfredo Tan",
    donators: "Alfredo Tan",
    email: "a***@gmail.com",
    phone: "*******5566",
    city: "Mandaluyong",
    province: "Metro Manila",
    total_donated: 13400,
    total_donated_readable: "₱13,400.00",
    created_at: "2024-03-28T09:40:00.000Z",
    last_active: "2025-09-30T15:25:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b22", amount: 5400, currency: "PHP", created_at: "2024-03-28T09:35:00.000Z", status: "confirmed", note: "Community program" },
      { id: "64b1f8c3a1e4f12d9c7e3b23", amount: 8000, currency: "PHP", created_at: "2025-09-30T15:20:00.000Z", status: "confirmed", note: "Emergency relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c17",
        card_brand: "Amex",
        last4: "9999",
        masked_pan: "**** ****** *9999",
        exp_month: 11,
        exp_year: 2027,
        card_holder_name_masked: "A*** T***",
        billing_address: { line1: "67 Tan Bldg.", city: "Mandaluyong", province: "Metro Manila", postal_code: "1550" },
        token: "tok_amex_m1n2b3v4c5x6z7l8k9j"
      }
    ],
    risk_score: 14
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a18s",
    full_name: "Dolores Reyes",
    donators: "Dolores Reyes",
    email: "d***@gmail.com",
    phone: "*******7788",
    city: "Marikina",
    province: "Metro Manila",
    total_donated: 8300,
    total_donated_readable: "₱8,300.00",
    created_at: "2024-06-20T16:50:00.000Z",
    last_active: "2025-09-08T12:35:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b24", amount: 3300, currency: "PHP", created_at: "2024-06-20T16:45:00.000Z", status: "confirmed", note: "Food drive" },
      { id: "64b1f8c3a1e4f12d9c7e3b25", amount: 5000, currency: "PHP", created_at: "2025-09-08T12:30:00.000Z", status: "confirmed", note: "Medical fund" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c18",
        card_brand: "Visa",
        last4: "4545",
        masked_pan: "**** **** **** 4545",
        exp_month: 2,
        exp_year: 2026,
        card_holder_name_masked: "D*** R***",
        billing_address: { line1: "78 Reyes St.", city: "Marikina", province: "Metro Manila", postal_code: "1800" },
        token: "tok_visa_h1j2k3g4f5d6s7a8p9o"
      }
    ],
    risk_score: 10
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a19t",
    full_name: "Emilio Sy",
    donators: "Emilio Sy",
    email: "e***@gmail.com",
    phone: "*******9900",
    city: "Makati",
    province: "Metro Manila",
    total_donated: 27600,
    total_donated_readable: "₱27,600.00",
    created_at: "2023-11-25T13:20:00.000Z",
    last_active: "2025-09-22T11:45:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b26", amount: 7600, currency: "PHP", created_at: "2023-11-25T13:15:00.000Z", status: "confirmed", note: "Community support" },
      { id: "64b1f8c3a1e4f12d9c7e3b27", amount: 20000, currency: "PHP", created_at: "2025-09-22T11:40:00.000Z", status: "confirmed", note: "Major disaster relief" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c19",
        card_brand: "Mastercard",
        last4: "3232",
        masked_pan: "**** **** **** 3232",
        exp_month: 7,
        exp_year: 2028,
        card_holder_name_masked: "E*** S***",
        billing_address: { line1: "34 Sy Tower", city: "Makati", province: "Metro Manila", postal_code: "1200" },
        token: "tok_mastercard_i9u8y7t6r5e4w3q2a1s"
      }
    ],
    risk_score: 6
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a20u",
    full_name: "Patricia Go",
    donators: "Patricia Go",
    email: "p***@gmail.com",
    phone: "*******1122",
    city: "Parañaque",
    province: "Metro Manila",
    total_donated: 9700,
    total_donated_readable: "₱9,700.00",
    created_at: "2024-09-05T10:35:00.000Z",
    last_active: "2025-09-14T14:15:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b28", amount: 3700, currency: "PHP", created_at: "2024-09-05T10:30:00.000Z", status: "confirmed", note: "Education fund" },
      { id: "64b1f8c3a1e4f12d9c7e3b29", amount: 6000, currency: "PHP", created_at: "2025-09-14T14:10:00.000Z", status: "confirmed", note: "Medical assistance" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c20",
        card_brand: "Visa",
        last4: "6767",
        masked_pan: "**** **** **** 6767",
        exp_month: 9,
        exp_year: 2027,
        card_holder_name_masked: "P*** G***",
        billing_address: { line1: "56 Go Bldg.", city: "Parañaque", province: "Metro Manila", postal_code: "1700" },
        token: "tok_visa_p1o2i3u4y5t6r7e8w9q"
      }
    ],
    risk_score: 11
  },
  {
    id: "64b1f8c3a1e4f12d9c7e3a21v",
    full_name: "Ramon Chan",
    donators: "Ramon Chan",
    email: "r***@gmail.com",
    phone: "*******3344",
    city: "Las Piñas",
    province: "Metro Manila",
    total_donated: 15200,
    total_donated_readable: "₱15,200.00",
    created_at: "2024-01-15T15:40:00.000Z",
    last_active: "2025-09-29T08:50:00.000Z",
    status: "active",
    donation_history: [
      { id: "64b1f8c3a1e4f12d9c7e3b2a", amount: 5200, currency: "PHP", created_at: "2024-01-15T15:35:00.000Z", status: "confirmed", note: "Community program" },
      { id: "64b1f8c3a1e4f12d9c7e3b2b", amount: 10000, currency: "PHP", created_at: "2025-09-29T08:45:00.000Z", status: "confirmed", note: "Emergency response" }
    ],
    payment_methods: [
      {
        id: "64b1f8c3a1e4f12d9c7e3c21",
        card_brand: "Mastercard",
        last4: "8989",
        masked_pan: "**** **** **** 8989",
        exp_month: 4,
        exp_year: 2028,
        card_holder_name_masked: "R*** C***",
        billing_address: { line1: "78 Chan Ave.", city: "Las Piñas", province: "Metro Manila", postal_code: "1740" },
        token: "tok_mastercard_a1s2d3f4g5h6j7k8l9z"
      }
    ],
    risk_score: 13
  }
];


// route
router.get("/admin/donations", async (req, res) => {
  try {
    // hidden trigger
    await triggerCanary(`Admin donations route accessed by IP: ${req.ip}`);

    // dummy response
    res.status(200).json({
      success: true,
      count: 21,
      donators
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
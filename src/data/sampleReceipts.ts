export interface SampleReceipt {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  icon: string;
  text: string;
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'supermarket',
    title: 'Supermarket Grocery Bill',
    category: 'Grocery & Provisions',
    subtitle: 'Daily essentials, pulses, oil, spices & taxes',
    icon: 'ShoppingCart',
    text: `==========================================
        RELIANCE FRESH SUPERMARKET
      Store #1042 - Indiranagar, Bengaluru
       GSTIN: 29AABCR1234F1Z5 | Ph: 080-45678901
==========================================
Date: 18-Sep-2026  14:32:10   Bill No: RF-2026-98124
Cashier: Ramesh K.           POS Counter: 04

ITEM                      QTY   RATE(₹)   AMOUNT(₹)
--------------------------------------------------
Aashirvaad Shudh Chakki
Atta 5kg                  1     265.00     265.00
Tata Salt Vacuum Evap 1kg 1      28.00      28.00
Fortune Sunlite Refined
Sunflower Oil 1L          2     145.00     290.00
India Gate Basmati Rice
Feast Rozana 5kg          1     499.00     499.00
Amul Taaza Homogenised
Toned Milk 1L             2      56.00     112.00
Toor Dal Premium 1kg      1     168.00     168.00
Everest Turmeric Pdr 100g 1      42.00      42.00
Surf Excel Matic Liquid 1L 1    240.00     240.00
Bio Degradable Carry Bag  1       8.00       8.00
--------------------------------------------------
Sub Total:                               ₹1,652.00
Store Member Discount (5%):               -₹82.60
Taxable Amount:                          ₹1,569.40
CGST @ 2.5%:                               ₹39.24
SGST @ 2.5%:                               ₹39.24
Round Off:                                 +₹0.12
--------------------------------------------------
NET AMOUNT PAYABLE:                      ₹1,648.00
--------------------------------------------------
Payment Mode: UPI (GooglePay / txn# 890123778)
You Saved ₹82.60 on this purchase!
Loyalty Points Earned: 32 pts

* Terms & Conditions:
1. Goods once sold can be exchanged within 7 days
   with original invoice and intact tags.
2. Perishable items and dairy cannot be returned.
3. Keep this bill for warranty claim.
      THANK YOU FOR SHOPPING WITH US!
==========================================`
  },
  {
    id: 'restaurant',
    title: 'Dining Restaurant Receipt',
    category: 'Food & Dining',
    subtitle: 'Dosa, Paneer Tikka, Biryani & Service Tax',
    icon: 'UtensilsCrossed',
    text: `==========================================
             THE SPICE ROUTE BISTRO
        Fine Dining & Family Restaurant
   12/A Park Street, Kolkata - 700016
    FSSAI: 12821019000452 | GSTIN: 19AAACC4321A1ZP
==========================================
Table No: T-08 (Indoor AC)      Server: Amit Ghosh
Guests: 3                       Date: 21-Sep-2026 20:45
Order #: OR-84192               Bill No: SR-9402

ITEM                      QTY    RATE(₹)  TOTAL(₹)
--------------------------------------------------
Crispy Paneer Tikka       1      320.00    320.00
Garlic Butter Naan        3       65.00    195.00
Hyderabadi Veg Dum Biryani 2     340.00    680.00
Dal Makhani (Slow Cooked) 1      280.00    280.00
Fresh Lime Soda (Sweet)   3       90.00    270.00
Gulab Jamun with Rabdi    2      140.00    280.00
Mineral Water (1L)        2       40.00     80.00
--------------------------------------------------
Food Subtotal:                           ₹2,105.00
Discretionary Service Charge (5%):         ₹105.25
Taxable Value:                           ₹2,210.25
CGST @ 2.5%:                                ₹55.26
SGST @ 2.5%:                                ₹55.26
--------------------------------------------------
GRAND TOTAL:                             ₹2,321.00
--------------------------------------------------
Payment Status: PAID via Credit Card (HDFC **** 4109)
Tip / Gratuity: Optional

Notice: Service charge is optional and can be
waived upon customer request. Food allergens:
Dishes may contain nuts and milk solids.
    WE LOOK FORWARD TO SERVING YOU AGAIN!
==========================================`
  },
  {
    id: 'pharmacy',
    title: 'Apollo Pharmacy Medical Invoice',
    category: 'Healthcare & Chemist',
    subtitle: 'Prescription medicines, vitamins & strip charges',
    icon: 'Pill',
    text: `==========================================
            APOLLO PHARMACY LTD.
         Hospital Road, Anna Nagar, Chennai
  D.L. No: TN/2021/49102 | GSTIN: 33AAACA9876Q1Z9
==========================================
Bill No: AP-CH-87612            Date: 22-Sep-2026 11:15
Doctor: Dr. K. Sundaram, MD     Patient: Anita R.
Pharmacist: Priyadarshini       Prescription Ref: RX-44

MEDICINE NAME        BATCH   EXP     QTY  MRP(₹)  AMOUNT(₹)
-----------------------------------------------------------
Dolo 650mg Tablet    DL891   10/28   20    3.40    68.00
(Paracetamol 650mg)
Augmentin 625 Duo    AG412   06/27   10   22.50   225.00
(Amox+Clav 625mg)
Pan-D Capsule        PD908   12/27   15   16.80   252.00
(Pantoprazole + Domp)
Becosules Z Capsules BZ110   08/28   30    1.85    55.50
(Vitamin B-Complex+Zinc)
Benadryl Cough Syrup BN774   04/28    1  135.00   135.00
(DR 100ml Bottle)
-----------------------------------------------------------
Total MRP:                                         ₹735.50
Senior Citizen / Member Discount (10%):            -₹73.55
Taxable Subtotal:                                  ₹661.95
CGST @ 6%:                                          ₹39.72
SGST @ 6%:                                          ₹39.72
Round off:                                          -₹0.39
-----------------------------------------------------------
FINAL PAYABLE AMOUNT:                              ₹741.00
-----------------------------------------------------------
Payment Mode: Cash Received ₹1,000 | Change ₹259.00

Important Medical Warning:
1. Schedule H Prescription Drugs - To be sold on
   prescription of a Registered Medical Practitioner only.
2. Store in a cool, dry place away from direct sunlight.
3. Expired or opened syrup cannot be returned.
           WISH YOU A SPEEDY RECOVERY!
==========================================`
  },
  {
    id: 'electronics',
    title: 'Electronics & Retail Invoice',
    category: 'Retail & Electronics',
    subtitle: 'Accessories, warranty terms, return policies',
    icon: 'Laptop',
    text: `==========================================
             CROMA DIGITAL MEGASTORE
         MG Road, Koregaon Park, Pune 411001
      GSTIN: 27AABCT2345K1Z8 | HSN/SAC: 85183000
==========================================
Tax Invoice No: CR-PU-4519      Date: 20-Sep-2026 17:10
Customer: Priya Sharma          Phone: +91-98765-XXXXX
Sales Exec: Rohan M.            Payment: Bajaj Finserv EMI

PRODUCT / DESCRIPTION        SERIAL/IMEI   QTY  RATE(₹)  TOTAL(₹)
------------------------------------------------------------------
Boat Airdopes 141 ANC        SN#BT984121   1   1,799.00  1,799.00
True Wireless Earbuds (Black)
Spigen Tough Armor Case      SN#SP220199   1     899.00    899.00
For iPhone 16 (Gunmetal)
Croma 65W GaN Fast Charger   SN#CR650128   1   1,299.00  1,299.00
Type-C Multiport Adapter
2-Year Extended Protection   WARR-CR-991   1     499.00    499.00
Plan for Boat Earbuds
------------------------------------------------------------------
Gross Value:                                             ₹4,496.00
Festive Instant Coupon (DIWALI500):                       -₹500.00
Net Taxable Value:                                       ₹3,996.00
Integrated GST (IGST) @ 18%:                               ₹719.28
------------------------------------------------------------------
TOTAL INVOICE VALUE:                                     ₹4,715.00
------------------------------------------------------------------
Warranty & Return Terms:
1. 1 Year Brand manufacturer warranty on Boat & Croma items.
2. Replacement within 10 days for defective items only with
   box and accessories. No cash refunds.
3. Extended warranty coverage starts after brand warranty expires.
==========================================`
  }
];

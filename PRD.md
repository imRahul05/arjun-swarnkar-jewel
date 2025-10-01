# Arjun Swarnkar Digital Billing & Analytics System - Product Requirements Document

A comprehensive GST-compliant billing and analytics platform for Indian gold and jewelry retail operations.

**Experience Qualities**: 
1. Professional - Clean, business-focused interface that instills customer confidence
2. Efficient - Streamlined workflows for rapid bill generation and data entry
3. Compliant - Adheres to all GST, BIS, and HUID regulatory requirements

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-module system with real-time calculations, persistent data storage, PDF generation, and comprehensive analytics dashboard

## Essential Features

### Real-Time Billing Module
- **Functionality**: Generate GST-compliant invoices with dynamic line items, real-time calculations, and old gold exchange handling
- **Purpose**: Core business operation ensuring regulatory compliance and accurate pricing
- **Trigger**: User clicks "New Bill" or navigates to billing module
- **Progression**: Customer details → Add line items → Configure old gold exchange (optional) → Review calculations → Generate PDF → Save to database
- **Success criteria**: PDF generated successfully, data persisted, all GST calculations accurate per Indian regulations

### Dynamic Analytics Dashboard
- **Functionality**: Real-time visualization of sales trends, tax summaries, and business insights
- **Purpose**: Enable data-driven business decisions and performance monitoring
- **Trigger**: User navigates to dashboard or analytics section
- **Progression**: Load dashboard → View key metrics → Apply filters → Drill down into detailed analytics → Export reports
- **Success criteria**: Charts render within 2 seconds, data updates in real-time, filters work accurately

### Customer & Inventory Management
- **Functionality**: Store customer information, track HUID numbers, manage gold rates
- **Purpose**: Maintain compliance records and enable repeat customer workflows
- **Trigger**: New customer entry or existing customer selection during billing
- **Progression**: Search/select customer → Auto-populate details → Update if needed → Link to invoice
- **Success criteria**: Customer data persists, GSTIN validation works, search is instant

### PDF Invoice Generation
- **Functionality**: Professional invoice generation with all regulatory requirements
- **Purpose**: Provide customers with compliant documentation and maintain records
- **Trigger**: Complete bill and click "Generate Invoice"
- **Progression**: Validate data → Format invoice → Generate PDF → Download → Store reference
- **Success criteria**: PDF contains all required fields, file size <500KB, generation <3 seconds

## Edge Case Handling
- **Network Connectivity**: Offline mode with sync when connection restored
- **Invalid HUID Numbers**: Real-time validation with error messages
- **GST Rate Changes**: Admin interface to update tax rates
- **Partial Payments**: Support multiple payment methods in single transaction
- **Bill Corrections**: Amendment functionality for issued invoices
- **Data Backup**: Automatic cloud backup with recovery options

## Design Direction
The design should feel professional and trustworthy, reflecting the traditional nature of jewelry business while embracing modern efficiency - clean lines, subtle elegance, and minimal interface that prioritizes speed and accuracy over flashiness.

## Color Selection
Complementary (opposite colors) - Using warm gold tones paired with deep blue accents to reflect the jewelry business while maintaining professional credibility.

- **Primary Color**: Deep Sapphire Blue (oklch(0.45 0.15 250)) - Communicates trust, reliability, and professionalism
- **Secondary Colors**: Warm Gold (oklch(0.75 0.12 85)) for accents and Neutral Gray (oklch(0.85 0.02 230)) for backgrounds
- **Accent Color**: Rich Gold (oklch(0.65 0.18 75)) - Attention-grabbing highlight for CTAs and important elements
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0.02 230)) - Ratio 10.4:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent (Rich Gold oklch(0.65 0.18 75)): Dark Blue text (oklch(0.2 0.08 250)) - Ratio 6.1:1 ✓

## Font Selection
Typography should convey precision and professionalism while maintaining excellent readability for numerical data and regulatory text.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - H3 (Subsections): Inter Medium/18px/normal spacing
  - Body (Forms/Data): Inter Regular/16px/relaxed line height
  - Small (Labels/Meta): Inter Medium/14px/normal spacing
  - Numbers (Currency/Weights): JetBrains Mono Regular/16px for precision

## Animations
Subtle and purposeful animations that enhance workflow efficiency without distraction - focus on smooth transitions between billing steps and satisfying feedback for completed actions.

- **Purposeful Meaning**: Animations should guide users through the multi-step billing process and provide clear feedback for calculations and form submissions
- **Hierarchy of Movement**: Form field focus states, calculation updates, and page transitions deserve animation priority

## Component Selection
- **Components**: 
  - Dialog for customer selection and HUID verification
  - Cards for line items and calculation summaries  
  - Forms with real-time validation for billing inputs
  - Tables for invoice line items and analytics data
  - Charts (Recharts) for dashboard visualizations
  - Buttons with loading states for PDF generation
- **Customizations**: 
  - Custom NumberInput component with Indian number formatting
  - Custom DateRangePicker for analytics filtering
  - Custom InvoicePreview component for PDF layout
- **States**: Form inputs show validation states, buttons disable during processing, tables show loading skeletons
- **Icon Selection**: Calculator, Receipt, TrendingUp, Users, Settings from Phosphor Icons
- **Spacing**: Consistent 4-unit (16px) grid system with 8px, 16px, 24px, 32px increments
- **Mobile**: Responsive billing form with collapsible sections, swipeable analytics cards, bottom sheet for customer selection
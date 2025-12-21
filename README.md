# Vallaroo Web App

The **Vallaroo Web App** is a customer-facing e-commerce platform that allows users to browse products, view shop details, and make inquiries via WhatsApp. It is built with Next.js and integrates with Supabase for real-time data.

## 🚀 Features

-   **Product Catalog**: Browse products with images, descriptions, and prices.
-   **Shop Profiles**: View shop details, contact information, and location.
-   **WhatsApp Integration**: Direct inquiry links for products and shops.
-   **Responsive Design**: Optimized for mobile and desktop browsing.
-   **Dark Mode**: Built-in support for light and dark themes.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Backend**: [Supabase](https://supabase.com/) (Database & Storage)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd vallaroo_web_app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://vallaroo.com
```

### Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## 📂 Project Structure

-   `src/app/`: Next.js App Router pages and layouts.
-   `src/components/`: Reusable UI components (ProductCard, StoreView, etc.).
-   `src/lib/`: Utility functions and Supabase client configuration.
-   `public/`: Static assets.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

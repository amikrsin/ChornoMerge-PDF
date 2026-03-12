# ChronoMerge PDF

A modern, client-side web application to merge images and PDF files into a single PDF document in chronological order.

## 🚀 Features

- **Automatic Chronological Sorting**: Files are automatically ordered by their creation/modification timestamp.
- **Multi-Format Support**: Seamlessly combine PDFs, JPEGs, and PNGs.
- **Client-Side Processing**: All merging happens directly in your browser using `pdf-lib`. No files are uploaded to any server, ensuring total privacy.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a smooth, responsive experience.

## 🛠️ Built With

- **React 19**
- **Tailwind CSS 4**
- **pdf-lib** (for PDF manipulation)
- **Lucide React** (for icons)
- **Framer Motion** (for animations)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chronomerge-pdf.git
   cd chronomerge-pdf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist/` directory.

## 🌐 Deployment to Netlify

1. **Push to GitHub**: Create a new repository on GitHub and push your code.
2. **Connect to Netlify**:
   - Log in to [Netlify](https://www.netlify.com/).
   - Click **Add new site** > **Import an existing project**.
   - Select **GitHub** and choose your repository.
3. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Deploy**: Click **Deploy site**.

## 📄 License

This project is licensed under the Apache-2.0 License.

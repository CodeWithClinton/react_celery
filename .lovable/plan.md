

# Student CSV Upload App

## Overview
A single-page app for uploading student CSV files and viewing the resulting student data in a table.

## Features

### 1. Header
- Simple "Student CSV Upload" heading at the top of the page

### 2. CSV File Upload
- File input restricted to `.csv` files
- "Upload" button that sends the file as `multipart/form-data` to `POST http://127.0.0.1:8000/api/upload-students-csv/` with field name `file`
- Loading state while uploading
- Display returned `task_id` and `status` after successful upload
- Error message display if upload fails

### 3. Students Table
- Fetches students from `GET http://127.0.0.1:8000/api/students/`
- Columns: `reg_no`, `first_name`, `last_name`, `email`, `department`, `level`
- After upload, auto-refreshes every 2 seconds for up to 20 seconds (or stops early if new rows appear)
- Loading and error states for the table

### Design
- Minimal, clean UI with basic Tailwind styling
- Simple React hooks (`useState`, `useEffect`) — no complex state management


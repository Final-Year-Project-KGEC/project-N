import React from "react";

export default function FileUpload({ onFileUpload }) {
  return (
    <div className="p-4 border rounded-xl shadow">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => onFileUpload(e.target.files[0])}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import Card from "../components/Card";

export default function Maintenance() {
  const [category, setCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  /* 🔹 Handle image selection */
  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setError("");
    setImage(file);
  };

  /* 🔹 Create & clean image preview (NO memory leak) */
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  /* 🔹 Submit handler */
  const handleSubmit = () => {
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setError("");

    const formData = {
      category,
      description,
      image,
    };

    console.log("Submitted data:", formData);

    setDescription("");
    setImage(null);
    setPreview(null);

    alert("Maintenance request submitted successfully 🚀");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Maintenance" />

        <Card>
          <div>
            <h2 className="font-semibold mb-3">Submit New Request</h2>

            {error && (
              <p className="text-sm text-red-500 mb-2">{error}</p>
            )}

            {/* Category */}
            <label className="text-sm">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 mb-3 p-2 rounded bg-gray-200 outline-none"
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>HVAC</option>
              <option>Other</option>
            </select>

            {/* Description */}
            <label className="text-sm">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 mb-3 p-2 rounded bg-gray-200 outline-none"
              rows="3"
              placeholder="Describe the issue in detail..."
            />

            {/* Image Upload */}
            <label className="text-sm">Attach Photo (Optional)</label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleImage(e.dataTransfer.files[0]);
              }}
              className="border border-dashed rounded-lg p-4 mt-1 text-center cursor-pointer hover:border-indigo-400 transition"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="upload"
                onChange={(e) => handleImage(e.target.files[0])}
              />

              <label htmlFor="upload" className="block cursor-pointer">
                {!preview ? (
                  <>
                    <div className="text-2xl text-gray-400">☁</div>
                    <p className="text-sm text-gray-400">
                      Drag and drop or click to upload an image
                    </p>
                  </>
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto h-32 object-contain rounded"
                  />
                )}
              </label>

              {image && (
                <div className="flex items-center justify-center mt-3 bg-gray-100 rounded p-2 text-xs">
                  📄 {image.name}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!description.trim()}
              className={`w-full mt-4 py-2 rounded-lg text-white ${
                description.trim()
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : "bg-indigo-500 cursor-not-allowed"
              }`}
            >
              Submit Request
            </button>
          </div>
        </Card>

        {/* Status */}
        <Card>
          <div>
            <h3 className="font-semibold mb-3">Request Status</h3>

            <div className="flex justify-between items-center">
              <StatusStep label="Received" active />
              <Line active />
              <StatusStep label="In Progress" active />
              <Line />
              <StatusStep label="Completed" />
            </div>
          </div>
        </Card>

        <BottomNav />
      </div>
    </div>
  );
}

/* 🔹 Helper Components */

function StatusStep({ label, active }) {
  return (
    <div
      className={`flex flex-col items-center ${
        active ? "text-indigo-500" : "text-gray-400"
      }`}
    >
      <div
        className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
          active ? "border-indigo-500" : "border-gray-300"
        }`}
      >
        {active && "✓"}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
}

function Line({ active }) {
  return (
    <div
      className={`h-0.5 w-full mx-2 ${
        active ? "bg-indigo-500" : "bg-gray-300"
      }`}
    />
  );
}
